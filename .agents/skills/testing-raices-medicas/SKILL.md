# Testing Raíces Médicas Web

## Project Overview
- Static HTML/CSS/JS site (no build step, no framework)
- Hosted on Cloudflare Pages (auto-deploys from GitHub)
- Cloudflare Workers handle API endpoints (e.g., `/api/latest-video`)
- Domain: `raicesmedicas.health`

## Local Development

### Serving the Site Locally
The site is plain HTML with no build step. Use any static file server:
```bash
python3 -m http.server 8080
```
Or use a custom test server if you need to mock API endpoints (see below).

### Mocking Cloudflare Worker Endpoints
Cloudflare Workers are routed to the production domain only. For local testing, create a Python test server that serves both static files and mocks the worker endpoints:

```python
import http.server
import json
import os

MOCK_RESPONSE = json.dumps({...})  # Match the worker's response shape

class TestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/latest-video":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(MOCK_RESPONSE.encode())
        else:
            super().do_GET()

os.chdir(os.path.dirname(os.path.abspath(__file__)))
http.server.HTTPServer(("0.0.0.0", 8080), TestHandler).serve_forever()
```

To get real data for the mock, fetch the YouTube RSS feed directly:
```bash
curl -s "https://www.youtube.com/feeds/videos.xml?channel_id=UCdjmZMIZIEd24EfV-NahQ2w"
```

## Cloudflare Worker Deployment

### Prerequisites
- `wrangler` CLI: `npm install -g wrangler`
- Cloudflare API token with Workers permissions (secret: `CLOUDFLARE_API_TOKEN_V2`)

### Deploying Workers
```bash
export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN_V2}"
cd workers/
wrangler deploy
```

### Verifying Worker Deployment
- The Cloudflare API can confirm deployment: `curl -H "Authorization: Bearer $TOKEN" https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts/{worker_name}`
- Direct `curl` to the production URL may return a 403 due to Cloudflare bot protection — this is expected and does NOT mean the worker is broken. Test in a real browser instead.
- Cloudflare Account ID: `854aab207a73dde863412e20220ba220`
- Zone ID for raicesmedicas.health: `d3f9493852685e38425cf8a79fc552d6`

## Testing Checklist

### Frontend (HTML/CSS/JS)
1. Serve site locally on port 8080 with mock API
2. Verify sections render correctly in a browser
3. Check nav links (desktop + mobile menu) navigate to correct anchors
4. Use browser console to verify DOM state (element visibility, attribute values)
5. Test error states by loading on a domain without the worker (e.g., Cloudflare Pages preview URL)

### Cloudflare Pages Preview URLs
- Every PR gets a preview deployment at `https://{hash}.raices-medicas-web.pages.dev`
- Preview URLs do NOT have Cloudflare Worker routes, so API-dependent features will show error states — this is expected behavior, not a bug
- Use preview URLs to test error state UI and general layout/styling

### Mobile Testing
- The site uses CSS media queries at 968px and 640px breakpoints
- Mobile menu is a hidden div (`#mobileMenu`) toggled by the hamburger button
- Verify mobile menu links via DOM inspection or by resizing the browser

## Devin Secrets Needed
- `CLOUDFLARE_API_TOKEN_V2` — Cloudflare API token with Workers, Pages, and DNS permissions

## Common Issues
- **Port already in use**: Kill existing process with `fuser -k 8080/tcp` before starting a new server
- **Cloudflare bot protection**: `curl` requests to production URLs may get 403 challenges — use a real browser or the Cloudflare API to verify
- **YouTube RSS feed**: Only returns the 15 most recent videos. If the channel has no videos, the worker will return an error
