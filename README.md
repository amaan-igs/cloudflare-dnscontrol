## Security Policy: Managing Critical DNS Records

**Important:**

- Critical DNS records (MX, TXT, and all root-level records) are not managed or altered by DNSControl in this repository.
- The purpose of this tooling is to enable developers, operations, and platform teams to request subdomains with valid reasons and their names via Pull Requests (PRs), ensuring a documented and auditable process.
- Any changes to root-level DNS configurations (e.g., MX, TXT, NS, or A records for the apex domain) must be performed directly in the Cloudflare panel.
- Access to the Cloudflare panel for root-level changes is restricted and requires written approval over email. No developer, operations, or platform team member may modify root-level DNS records without explicit authorization.

**Summary:**

- Subdomain requests and changes are managed via DNSControl and PRs.
- Root-level DNS changes require Cloudflare panel access and written approval.
- This policy protects the integrity and security of the domain's core DNS setup.

## Ignored DNS Records in DNSControl

| Pattern                       | Type      | Purpose/Reason                                      | Security/Risk if not Ignored                       |
|-------------------------------|-----------|-----------------------------------------------------|----------------------------------------------------|
| `*`                           | A         | Ignore all wildcard A records                        | Wildcard A records can expose all subdomains to unintended IPs, risking takeover or misrouting. |
| `*._domainkey`                | TXT       | Ignore all DKIM TXT records for subdomains           | DKIM records are managed by mail providers; accidental changes can break email authentication. |
| `@`                           | *         | Ignore all records at the root domain                | Root domain records are critical; accidental changes can break main website, mail, or cause outages. |
| `_acme-challenge`             | TXT       | Ignore ACME challenge TXT records (SSL certs)        | SSL certificate issuance can fail or be hijacked if these are modified. |
| `_discord`                    | TXT       | Ignore Discord verification TXT records              | Discord integrations may break or be hijacked.      |
| `_dmarc`                      | TXT       | Ignore DMARC TXT records                             | DMARC policy changes can impact email deliverability and security. |
| `_psl`                        | TXT       | Ignore Public Suffix List TXT records                | Public Suffix List changes can impact domain security and browser behavior. |
| `ns[1-4]`                     | A,AAAA    | Ignore name server A/AAAA records                    | Name server records are critical; accidental changes can break DNS resolution for the entire domain. |

## DNSControl Quick Install

Manage DNS as code with [DNSControl](https://github.com/StackExchange/dnscontrol/releases).

### Install (Fedora/RHEL)

```bash
curl -LO https://github.com/StackExchange/dnscontrol/releases/download/v4.24.0/dnscontrol-4.24.0.x86_64.rpm
sudo dnf install ./dnscontrol-4.24.0.x86_64.rpm -y
```

### Verify Installation

```bash
dnscontrol version
# Output: 4.24.0
```

### Other Platforms
- macOS
- Debian
- Windows
- FreeBSD

See [DNSControl Releases](https://github.com/StackExchange/dnscontrol/releases) for downloads.

## Cloudflare API Creation and Validation

![Cloudflare API Token Permissions](./media/cf-api-token.png)

To verify your Cloudflare API token, run:

```bash
curl "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer XX-YOUR-CF-TOKEN-XX"
```
Example successful response:
```json
{
  "success": true,
  "errors": [],
  "messages": [
    {
      "code": 10000,
      "message": "This API Token is valid and active",
      "type": null
    }
  ],
  "result": {
    "id": "1A2B3C4D5E6F7G8H9I",
    "status": "active",
    "not_before": "2025-08-31T00:00:00Z", // If you have set a TTL/Expiry
    "expires_on": "2025-10-01T23:59:59Z" // ^^
  }
}
```

