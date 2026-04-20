# Testing Raíces Médicas Website

## Environment

- **Hosting**: Cloudflare Pages at `raicesmedicas.health`
- **Database**: Cloudflare D1 (`raices-medicas-db`, ID: `880dbd6b-ab6e-4416-80cd-610944607359`)
- **API**: Cloudflare Pages Functions (serverless, under `functions/` directory)
- **Frontend**: Vanilla HTML/CSS/JS (no framework, no build step)
- **Account ID**: `854aab207a73dde863412e20220ba220`

## Devin Secrets Needed

- `CLOUDFLARE_API_TOKEN_FULL` — Cloudflare API token with D1 read/write and Pages permissions

## How to Get Preview URLs

After pushing to a feature branch, Cloudflare Pages auto-deploys a preview. Find the preview URL via:
1. `git_pr_checks` — the Cloudflare Pages check includes the preview URL in its description
2. `git_view_pr` — preview URLs also appear in PR comments/status checks
3. Preview URL format: `https://<hash>.raices-medicas-web.pages.dev`
4. Branch preview URL format: `https://<branch-slug>.raices-medicas-web.pages.dev`

## Testing the Quiz Feature

### API Endpoints
- `GET /api/quiz/current` — Returns active quiz with questions (no answers leaked)
- `POST /api/quiz/answer` — Submit an answer, returns correct/incorrect + explanation

### Key Things to Verify
1. **Quiz loads on homepage** — Section is between "Síguenos en Nuestras Redes" and "Sobre Nosotros"
2. **Full flow**: Loading → Question → Feedback → Results
3. **API security**: `GET /api/quiz/current` must NOT return `correct_index` or `explanation`
4. **Wrong answer feedback**: Selected wrong option shows red, correct shows green
5. **Results page**: Score, per-question recap with correct answers (not "undefined")
6. **Stats**: "El X% de los visitantes respondió correctamente" appears after answering

### Known Correct Answers (First Quiz - Salud Renal)
- Q1: Index 1 (B - Diabetes)
- Q2: Index 1 (B - Con uno solo)
- Q3: Index 2 (C - Espuma en la orina)

### D1 Database Queries
To verify data or seed new quizzes, use the Cloudflare D1 API:
```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database/$DB_ID/query" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"sql": "SELECT * FROM quizzes;"}'
```

### D1 Binding
The Pages project needs a `QUIZ_DB` D1 binding pointing to the `raices-medicas-db` database. This must be configured for both production and preview environments via the Cloudflare API or dashboard.

## General Notes

- The site uses vanilla JS with IIFEs for component logic — no build step needed
- i18n is handled via `i18n.js` with `data-i18n` attributes; quiz static text is hardcoded in Spanish
- Nav links use anchor `#quiz` for scroll-to-section navigation
- CSS uses `@media(max-width:640px)` breakpoint for mobile responsive styles
- CORS is set to `*` on quiz endpoints; existing endpoints like `latest-video.js` scope to `https://raicesmedicas.health`
