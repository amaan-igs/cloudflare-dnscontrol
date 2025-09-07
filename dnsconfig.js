var domainName = "runonaws.dev";
var registrar = NewRegistrar("none");
var dnsProvider = DnsProvider(NewDnsProvider("cloudflare"));

function getDomainsList(filesPath) {
    var result = [];
    var files = glob.apply(null, [filesPath, true, ".json"]);

    for (var i = 0; i < files.length; i++) {
        var name = files[i]
            .split("/")
            .pop()
            .replace(/\.json$/, "");

        result.push({ name: name, data: require(files[i]) });
    }

    return result;
}

var domains = getDomainsList("./domains");
var records = [];

for (var subdomain in domains) {
    var subdomainName = domains[subdomain].name;
    var data = domains[subdomain].data;
    var proxyState = data.proxied ? CF_PROXY_ON : CF_PROXY_OFF;

    // Handle A records
    if (data.records.A) {
        for (var a in data.records.A) {
            records.push(A(subdomainName, IP(data.records.A[a]), proxyState));
        }
    }

    // Handle AAAA records
    if (data.records.AAAA) {
        for (var aaaa in data.records.AAAA) {
            records.push(AAAA(subdomainName, data.records.AAAA[aaaa], proxyState));
        }
    }

    // Handle CAA records
    if (data.records.CAA) {
        for (var caa in data.records.CAA) {
            var caaRecord = data.records.CAA[caa];
            records.push(CAA(subdomainName, caaRecord.tag, caaRecord.value));
        }
    }

    // Handle CNAME records
    if (data.records.CNAME) {
        records.push(ALIAS(subdomainName, data.records.CNAME + ".", proxyState));
    }

    // Handle DS records
    if (data.records.DS) {
        for (var ds in data.records.DS) {
            var dsRecord = data.records.DS[ds];
            records.push(
                DS(subdomainName, dsRecord.key_tag, dsRecord.algorithm, dsRecord.digest_type, dsRecord.digest)
            );
        }
    }

    // Handle MX records
    if (data.records.MX) {
        for (var mx in data.records.MX) {
            var mxRecord = data.records.MX[mx];

            if (typeof mxRecord === "string") {
                records.push(
                    MX(subdomainName, 10 + parseInt(mx), data.records.MX[mx] + ".")
                );
            } else {
                records.push(
                    MX(
                        subdomainName,
                        parseInt(mxRecord.priority),
                        mxRecord.target + "."
                    )
                );
            }
        }
    }

    // Handle NS records
    if (data.records.NS) {
        for (var ns in data.records.NS) {
            records.push(NS(subdomainName, data.records.NS[ns] + "."));
        }
    }

    // Handle SRV records
    if (data.records.SRV) {
        for (var srv in data.records.SRV) {
            var srvRecord = data.records.SRV[srv];
            records.push(
                SRV(subdomainName, srvRecord.priority, srvRecord.weight, srvRecord.port, srvRecord.target + ".")
            );
        }
    }

    // Handle TLSA records
    if (data.records.TLSA) {
        for (var tlsa in data.records.TLSA) {
            var tlsaRecord = data.records.TLSA[tlsa];
            records.push(
                TLSA(
                    subdomainName,
                    tlsaRecord.usage,
                    tlsaRecord.selector,
                    tlsaRecord.matching_type,
                    tlsaRecord.certificate
                )
            );
        }
    }

    // Handle TXT records
    if (data.records.TXT) {
        if (Array.isArray(data.records.TXT)) {
            for (var txt in data.records.TXT) {
                records.push(
                    TXT(
                        subdomainName,
                        data.records.TXT[txt].length <= 255
                            ? "\"" + data.records.TXT[txt] + "\""
                            : data.records.TXT[txt]
                    )
                );
            }
        } else {
            records.push(
                TXT(
                    subdomainName,
                    data.records.TXT.length <= 255
                        ? "\"" + data.records.TXT + "\""
                        : data.records.TXT
                )
            );
        }
    }

    // Handle URL records (simple A record redirect)
    if (data.records.URL) {
        records.push(A(subdomainName, IP("192.0.2.1"), CF_PROXY_ON));
    }

}

// ==============================
// RESERVED SUBDOMAINS HANDLING
// ==============================
// Reserved subdomains are protected by creating placeholder A records
// pointing to a reserved IP address (203.0.113.0) with Cloudflare proxy enabled.
// This prevents these subdomains from being registered by users while
// maintaining their reserved status in the DNS zone.

var reserved = require("./util/reserved.json");
// Create placeholder A records for all reserved subdomains
// Each reserved subdomain gets an A record to 203.0.113.0 (TEST-NET-3)
for (var i = 0; i < reserved.length; i++) {
    var subdomainName = reserved[i];
    records.push(A(subdomainName, IP("203.0.113.0"), CF_PROXY_ON));
}

// Zone last updated marker
records.push(TXT("_zone-updated", "\"" + Date.now().toString() + "\""));

// Ignore auto-generated / managed records
var ignored = [
    // ==============================
    // ROOT DOMAIN (@) RECORDS
    // ==============================
    // Ignore standard record types at apex; only CAA will be managed explicitly
    IGNORE("@", "A"),       // Root A record auto-managed or existing elsewhere
    IGNORE("@", "AAAA"),    // Root AAAA record auto-managed or existing elsewhere
    IGNORE("@", "CERT"),    // Certificate-related records, not managed manually
    IGNORE("@", "CNAME"),   // Avoid conflicts with apex CNAME restrictions
    IGNORE("@", "DNSKEY"),  // DNSSEC key records auto-generated
    IGNORE("@", "DS"),      // Delegation signer for DNSSEC
    IGNORE("@", "HTTPS"),   // Service binding for HTTPS (auto-managed)
    IGNORE("@", "LOC"),     // Geolocation records, rarely managed
    IGNORE("@", "MX"),      // Mail exchange records; keep existing, not altered
    IGNORE("@", "NAPTR"),   // Naming authority pointer; usually auto
    IGNORE("@", "NS"),      // Nameservers; managed by registrar/Cloudflare
    IGNORE("@", "PTR"),     // Reverse DNS; not relevant for root
    IGNORE("@", "SMIMEA"),  // Email certificate records, auto
    IGNORE("@", "SRV"),     // Service records, often auto or managed elsewhere
    IGNORE("@", "SSHFP"),   // SSH fingerprints, auto-generated
    IGNORE("@", "SVCB"),    // Service binding for future protocols
    IGNORE("@", "TLSA"),    // DANE TLS certs, auto
    IGNORE("@", "TXT"),     // Other TXT records like SPF, DKIM may exist
    IGNORE("@", "URI"),     // URI association records, rare

    // ==============================
    // WILDCARD / SPECIAL RECORDS
    // ==============================
    IGNORE("\\*", "A"),            // Wildcard A records; usually auto-managed
    IGNORE("*._domainkey", "TXT"), // DKIM keys for email; auto-generated
    IGNORE("_acme-challenge", "TXT"), // ACME challenge records for Let's Encrypt; auto
    IGNORE("_discord", "TXT"),     // Specific service TXT records (Discord)  
    IGNORE("_dmarc", "TXT"),       // DMARC policy; auto-managed
    IGNORE("_psl", "TXT"),         // Public suffix list validation TXT records

    // ==============================
    // NAMESERVERS / SUBDOMAINS
    // ==============================
    IGNORE("ns[1-4]", "A,AAAA"),   // Legacy or sub-NS glue records; auto
    IGNORE("go", "CNAME")          // Subdomain `go` CNAME for R2 Bucket as Cloudflare auto-manages it
];

// Add internal ignore list
var internal = require("./utils/internal.json");
internal.forEach(function (subdomain) {
    ignored.push(IGNORE(subdomain, "*"));
});

// Final declaration
D(domainName, registrar, dnsProvider, records, ignored);
