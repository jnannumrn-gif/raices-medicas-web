---
name: testing-raices-medicas
description: How to run, test, and verify the Raíces Médicas static site, its Cloudflare Pages Functions (quiz API + D1), and preview/production deployments.
---

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

### Quiz API (Pages Functions + D1)
Endpoints live in `functions/api/quiz/`: `current.js` (public), `answer.js` (POST, writes to D1), `admin.js` (GET list / POST create), `admin/[id].js` (GET detail). Admin endpoints authenticate with the `X-Admin-Password` header vs `env.QUIZ_ADMIN_PASSWORD`.

Run the whole site + functions + a local D1 copy:
```bash
cd <repo root>
npx wrangler@3 pages dev . --d1=QUIZ_DB --binding QUIZ_ADMIN_PASSWORD=testpw \
  --compatibility-date=2025-07-18 --port 8788 --persist-to .wrangler/state
```
Seed local D1 once (state persists in `.wrangler/`, which is gitignored):
```bash
npx wrangler@3 d1 execute QUIZ_DB --local --persist-to .wrangler/state --file db/schema.sql
npx wrangler@3 d1 execute QUIZ_DB --local --persist-to .wrangler/state --file db/seed.sql
```
Notes:
- wrangler may print an error/telemetry prompt at startup and still serve correctly — verify with `curl localhost:8788/api/quiz/current` rather than trusting the log.
- The homepage quiz UI is the `#quiz` section of `index.html`; visiting `http://127.0.0.1:8788/#quiz` exercises `current` + `answer` against local D1, so the UI flow can be tested end-to-end without touching production.
- **Never POST to `/api/quiz/admin` or `/api/quiz/answer` on production/preview** — both write to the real D1 (new quizzes / response stats). Use the local instance for all writes; production is safe for GETs only.
- Admin CORS is origin-scoped (`functions/api/quiz/_admin.js`): the API reflects `Access-Control-Allow-Origin` only for the request's **own origin**, the site domains and `*.raices-medicas-web.pages.dev` previews, and always sends `Vary: Origin`. Consequence when testing: the allowed local origin is exactly the host:port you browse to, so a page on `http://127.0.0.1:8788` can call the API but the same page served from `http://localhost:8080` is blocked by the browser. Requests without an `Origin` header (curl, server-to-server) are unaffected — CORS is a browser-side control, so a missing ACAO still returns 200 to curl; verify the *blocking* in a real browser, not with curl status codes.
- Handy browser CORS check: drop a temporary `cors-check.html` in the repo root (served by wrangler), open it once from the wrangler origin and once from a plain `python3 -m http.server` origin, and have it `fetch()` the admin endpoint — success vs `TypeError: Failed to fetch` is the proof. Delete the file afterwards.
- The homepage prints a `Visitor counter error: HTTP 500` in the console on local dev (the counter API isn't available locally) — unrelated to the quiz/admin work.
- Cross-check trick for the detail endpoint: the `correct_index` it reports must equal what `POST /api/quiz/answer` returns for the same question id, and the public `current` endpoint must NOT contain `correct_index`/`explanation`.

### Cloudflare Pages Preview URLs
- Every PR gets a preview deployment at `https://{hash}.raices-medicas-web.pages.dev`
- Preview URLs do NOT have the standalone Cloudflare *Worker* routes (e.g. `/api/latest-video`), so those features show error states — expected, not a bug
- Pages *Functions* (`functions/**`, including the quiz API) DO run on preview URLs and share the production D1 database
- Use preview URLs to test error state UI and general layout/styling

### Mobile Testing
- The site uses CSS media queries at 968px and 640px breakpoints
- Mobile menu is a hidden div (`#mobileMenu`) toggled by the hamburger button
- Verify mobile menu links via DOM inspection or by resizing the browser

## Devin Secrets Needed
- `QUIZ_ADMIN_PASSWORD` — admin password for `/api/quiz/admin*` on preview/production (send as `X-Admin-Password` header)
- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_API_TOKEN_V2` — Cloudflare API token with Workers, Pages, and DNS permissions

## Common Issues
- **Port already in use**: Kill existing process with `fuser -k 8080/tcp` before starting a new server
- **Cloudflare bot protection**: `curl` requests to production URLs may get 403 challenges — use a real browser or the Cloudflare API to verify
- **YouTube RSS feed**: Only returns the 15 most recent videos. If the channel has no videos, the worker will return an error
