## Domain Structure
To register a subdomain, submit a pull request with a new JSON file in the `domains` directory. For example, to register `example.runonaws.dev`, create a file named `example.json` in `domains/`.

# JSON Structure

### Example JSON File
`domains/docs.json`:

```json
{
  "owner": {
    "username": "runonaws-dev",
    "email": "contact@runonaws.dev"
  },
  "records": {
    "CNAME": "docs.runonaws.dev"
  },
  "proxied": true
}
```

#### owner (required)
Contact information for the subdomain owner. Required fields:
- `username`: Your GitHub username.
- `email`: Contact email address.

Example:
```json
{
  "owner": {
    "username": "your-github-username"
  }
}
```

#### records (required)
Specify DNS records for your subdomain. Supported record types:

##### A (IPv4 address)
```json
"A": ["192.0.2.1", "198.51.100.1"]
```

##### AAAA (IPv6 address)
```json
"AAAA": ["2001:db8::1", "2001:db8::2"]
```

##### CAA (Certificate Authority Authorization)
```json
"CAA": [
  { "flags": 0, "tag": "issue", "value": "letsencrypt.org" }
]
```

##### CNAME (Canonical Name)
```json
"CNAME": "your-site.runonaws.dev"
```

##### DS (DNSSEC Delegation Signer)
```json
"DS": [
  {
    "key_tag": 2371,
    "algorithm": 13,
    "digest_type": 2,
    "digest": "..."
  }
]
```

##### MX (Mail Exchange)
Simple form:
```json
"MX": [
  "mx1.runonaws.dev",
  "mx2.runonaws.dev"
]
```
With priority:
```json
"MX": [
  { "target": "mx1.runonaws.dev", "priority": 10 },
  { "target": "mx2.runonaws.dev", "priority": 20 }
]
```

##### NS (Name Server)
```json
"NS": ["ns1.runonaws.dev", "ns2.runonaws.dev"]
```

##### SRV (Service Record)
```json
"SRV": [
  {
    "priority": 10,
    "weight": 5,
    "port": 8080,
    "target": "service.runonaws.dev"
  }
]
```

##### TLSA (TLS/SSL Certificate Association)
```json
"TLSA": [
  {
    "usage": 1,
    "selector": 1,
    "matching_type": 1,
    "certificate": "..."
  }
]
```

##### TXT (Text Record)
Single string:
```json
"TXT": "Some verification text"
```
List format:
```json
"TXT": ["part1", "part2"]
```

##### URL (Redirect)
```json
"URL": "https://runonaws.dev"
```

#### proxied (optional)
Enable Cloudflare proxy:
```json
"proxied": true
```
> Users may only register one single-letter subdomain to prevent domain squatting.