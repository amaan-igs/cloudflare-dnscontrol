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

