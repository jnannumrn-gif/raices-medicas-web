# Testing Raíces Médicas

## Environment

- **Stack**: Cloudflare Pages (static) + Workers (Functions) + D1 (SQLite) + R2 (object storage)
- **Preview URLs**: Each push to a PR branch generates a unique preview at `https://<hash>.raices-medicas-web.pages.dev`
- **Branch preview**: Also available at `https://<branch-slug>.raices-medicas-web.pages.dev`
- **Production**: `https://raicesmedicas.health`

## Credentials

- **Admin password**: Stored as `QUIZ_ADMIN_PASSWORD` environment variable in Cloudflare Pages settings. Used for both Quiz and Actualidades admin panels.
- **Cloudflare API Token**: Available as `CLOUDFLARE_API_TOKEN_FULL` secret. Required for D1 database operations.
- **Cloudflare Account ID**: `854aab207a73dde863412e20220ba220`
- **D1 Database**: `raices-medicas-db` (UUID: `880dbd6b-ab6e-4416-80cd-610944607359`)

## D1 Database Setup

Schema and seed SQL files exist in `db/schema.sql` and `db/seed.sql` but are NOT auto-executed on deployment. To create/update tables:

```bash
# Execute SQL against D1 via Cloudflare API
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/854aab207a73dde863412e20220ba220/d1/database/880dbd6b-ab6e-4416-80cd-610944607359/query" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN_FULL" \
  -H "Content-Type: application/json" \
  -d '{"sql": "YOUR SQL HERE"}'
```

## Admin Panels

- **Quiz Admin**: `/admin/quiz/` — Create weekly quizzes
- **Actualidades Admin**: `/admin/actualidades/` — CRUD for news entries
- Both use the same password (env var `QUIZ_ADMIN_PASSWORD`)
- Auth is via `X-Admin-Password` header on API calls
- Admin GET endpoints return all entries (including deactivated) when valid password header is sent

## Testing Workflow

1. **Check preview URL**: After pushing, verify Cloudflare Pages deploy via `git_pr_checks`
2. **Dismiss cookie banner**: Click "Aceptar" on the cookie consent banner before testing
3. **Test public pages**: Verify content renders, category filters work, pagination works
4. **Test admin panels**: Wrong password → error message, correct password → panel loads
5. **Test CRUD**: Create, edit, deactivate, reactivate entries
6. **Test XSS**: Create entries with `<script>` tags — verify they render as literal text, no alerts fire
7. **Test deactivation**: Deactivated entries should be hidden from public page but visible in admin with "Inactiva" badge

## Key Pages

- `/` — Homepage with quiz section
- `/actualidades.html` — Public news page
- `/admin/quiz/` — Quiz admin
- `/admin/actualidades/` — News admin
- `/aviso-legal.html`, `/politica-privacidad.html`, `/cookies.html` — Legal pages

## Common Issues

- **D1 table not found**: Tables must be created manually via Cloudflare API (see above)
- **R2 uploads failing**: `MEDIA_BUCKET` binding must be configured in Cloudflare Pages settings
- **Stale preview**: Cloudflare Pages may cache; use the unique hash preview URL, not the branch preview
- **Timezone**: Admin panel date defaults use Eastern Time (Florida)
