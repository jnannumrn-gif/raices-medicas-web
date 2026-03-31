# Testing raices-medicas-web

## Overview
This is a static Cloudflare Pages site (HTML/CSS/JS, no build step) with Cloudflare Pages Functions for server-side logic. The site supports trilingual i18n (ES/EN/PT).

## Devin Secrets Needed
- `CLOUDFLARE_API_TOKEN_FULL` — Cloudflare API token with Pages/KV permissions for the account
- Cloudflare Account ID: can be found in the repo's Pages project settings

## URLs
- **Production**: https://raicesmedicas.health
- **Preview**: Each PR gets a preview deployment via Cloudflare Pages CI. The branch preview URL follows the pattern `https://{branch-slug}.raices-medicas-web.pages.dev`
- Check the PR's CI checks for the exact preview URL after deployment

## Architecture
- **Static site**: `index.html` is the single page, all CSS is inline in `<style>`, all JS is inline in `<script>`
- **Pages Functions**: Located in `/functions/` directory. These are deployed automatically by Cloudflare Pages
  - `/functions/api/visitor-count.js` — KV-backed visitor counter (GET only)
  - `/functions/api/latest-video.js` — YouTube API integration
- **i18n**: `i18n.js` contains all translations. Language selector buttons (ES/EN/PT) are in the navbar with class `.lang-btn` and `data-lang` attribute
- **KV Namespaces**: `VISITOR_COUNTER` namespace is bound to the Pages project for both production and preview environments

## Testing Checklist

### Basic Page Load
1. Navigate to the production or preview URL
2. Verify the page loads without errors (check browser console)
3. Verify all sections render: Hero, Nuestras Raíces, Último Episodio, YouTube banner, Programs, Values, Team, Contact, Visitor Counter, Footer

### Visitor Counter
1. Scroll to the bottom of the page (just above the footer)
2. Verify the LED counter section has a dark background with green glowing digits
3. Note the current count (should be >= 3060, the initial seed)
4. Refresh the page and verify the count increments by exactly 1
5. If the counter shows dim zeros (class `loading`), the KV binding may not be active — check Cloudflare Pages project settings

### i18n (Language Switching)
1. Click ES/EN/PT buttons in the top navbar
2. Verify ALL text on the page changes language (not just headers)
3. Key translations to check:
   - Visitor counter label: ES="Gracias por ser el visitante número" / EN="Thanks for being visitor number" / PT="Obrigado por ser o visitante número"
   - Nav items, section titles, footer text should all switch
4. Language switching does NOT reload the page — it updates DOM elements with `data-i18n` attributes

### Pages Functions
- The `/api/visitor-count` endpoint should return `{ "count": <number> }` with status 200
- It only responds to GET requests (`onRequestGet`). Other methods will get 405
- Cache-Control is set to `no-cache, no-store`

## Common Issues
- **KV not bound on preview**: Preview deployments might not have KV bindings active. The counter will show dim zeros. Fix: bind KV namespace to preview environment via Cloudflare API or dashboard
- **Pages Functions not deploying**: Ensure the `/functions/` directory is at the repo root. Cloudflare Pages auto-detects and deploys functions from this path
- **i18n not updating new elements**: Any new HTML element that needs translation must have `data-i18n="key"` attribute and corresponding entries in all 3 language objects in `i18n.js`

## Deployment
- Merging to `main` triggers automatic Cloudflare Pages deployment
- No build step required — the site is static HTML
- PRs get automatic preview deployments
