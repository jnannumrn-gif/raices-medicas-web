# Testing raices-medicas-web

## Overview
This is a single-page static HTML site (index.html) deployed on Cloudflare Pages. No build step is needed — changes to index.html are deployed directly.

## Deployment
- **Hosting**: Cloudflare Pages
- **Production URL**: https://raicesmedicas.health (also raices-medicas-web.pages.dev)
- **Preview URLs**: Generated automatically on PRs via Cloudflare Pages integration. Look for the `cloudflare-workers-and-pages` bot comment on the PR for the preview URL.
- **CI**: Cloudflare Pages deploy check — no other CI steps.

## Site Structure
Single-page site with these sections (in scroll order):
1. **Navigation** — fixed top bar with brand name and links
2. **Hero** — badge, heading, paragraph, CTA buttons, stats
3. **About (Nosotros)** — image + description + feature cards
4. **Nuestras Raíces** — founder bio (uses HTML entities for accents)
5. **Programs (Programas)** — 3 program cards with tags, titles, descriptions, links
6. **Values (Valores)** — 4 value cards
7. **CTA Banner** — call-to-action with heading, paragraph, button
8. **Contact (Contacto)** — info + form with placeholders
9. **YouTube Banner** — subscribe CTA + QR code
10. **Footer** — brand, navigation links, program links, contact links, social icons, copyright

## Testing Tips
- **Local testing**: Open `index.html` directly in the browser — no server needed.
- **Preview testing**: Use the Cloudflare Pages preview URL from the PR comment.
- **Spanish text verification**: The site is entirely in Spanish. When checking text corrections:
  - Zoom into each section to verify accented characters render correctly (á, é, í, ó, ú, ñ, ¿, ¡).
  - The "Nuestras Raíces" bio section uses HTML entities (`&iacute;`, `&aacute;`, etc.) while the rest uses direct UTF-8 Unicode characters — both are valid since the page declares `charset="utf-8"`.
  - Check form placeholders by zooming into the form fields.
  - Check the browser tab title for accents.
- **Encoding**: The file uses UTF-8 (`<meta charset="utf-8" />`). If accented characters appear garbled, it's likely an encoding mismatch.
- **Social links**: The site has YouTube, TikTok, Facebook, Instagram, X, LinkedIn, and Reddit social links in the footer. Usernames in URLs (e.g., `@RaicesMedicas`) should NOT have accents.

## Devin Secrets Needed
None — the site is fully static with no authentication required.
