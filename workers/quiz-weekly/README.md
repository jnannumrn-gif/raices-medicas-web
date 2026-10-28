# quiz-weekly — automatización del "Quiz de la Semana"

Cloudflare Worker que genera, hace revisar por Telegram, y publica el quiz
semanal de salud renal del sitio, sin pre-cargar el registro en D1 (evita
que `functions/api/quiz/current.js` lo active antes de tiempo).

Desplegado como: **`raices-quiz-weekly`**
URL: `https://raices-quiz-weekly.jnannum-rn.workers.dev`

## Flujo

Todos los horarios son **hora de Nueva York** (America/New_York, ajusta solo
por DST automáticamente — el cron real corre cada 15 min en UTC y el Worker
traduce a NY internamente, ver `src/scheduler.js`).

1. **Viernes 9:00am** — genera un borrador (3 preguntas) con Claude, evitando
   temas de los últimos ~8 quizzes publicados, y lo envía por Telegram al
   chat autorizado con botones `✅ Aprobar` / `❌ Cambiar`.
2. **Sábado 9:00am** — si el borrador sigue sin aprobar, reenvía el mismo
   borrador como recordatorio.
3. **Domingo 10:00pm** — si el borrador fue aprobado, lo publica (`POST
   /api/quiz/admin` en el sitio real). **Nunca publica antes de esta hora**,
   sin importar cuándo se aprobó (ver "Regla del domingo objetivo" abajo).

Botón `❌ Cambiar`: pide un comentario de texto libre, regenera el quiz
completo con ese ajuste aplicado, y vuelve a enviarlo con los mismos
botones. Se puede repetir cuantas veces haga falta.

### Regla del domingo objetivo (importante)

Cada borrador generado un viernes tiene un **domingo objetivo** fijo: el
domingo inmediatamente siguiente (2 días después). Aprobar el quiz el mismo
viernes, el sábado, o el domingo antes de las 10pm **no adelanta la
publicación** — el Worker vuelve a comprobar la fecha/hora real en el
momento de publicar y solo publica si ya se llegó o pasó esa hora. Esto
aplica igual al cron automático y al disparador manual
`/admin/trigger/publish`, así que no hay forma de publicar un quiz antes de
su semana por ningún camino.

### `week_start` siempre debe ser lunes

`week_start` se calcula como el lunes siguiente al **próximo viernes**
(hoy mismo si hoy ya es viernes) — no asume ciegamente "hoy es viernes y
sumo 3 días". Esto importa porque `functions/api/quiz/current.js` activa un
quiz comparando `week_start <= fecha UTC actual` (solo fecha, sin hora): si
`week_start` no cayera en lunes, el quiz podría activarse en un día
equivocado de la semana.

Dos salvaguardas independientes contra esto, ambas con aviso por Telegram
si se disparan:
- Al **generar**: si el `week_start` calculado no es lunes, no se guarda ni
  se envía el borrador (falla con error, que se reporta por Telegram).
- Al **publicar**: se revalida que `week_start` sea lunes y que no sea
  posterior a la fecha UTC actual, independientemente de cómo se haya
  generado el borrador. Si falla, el borrador pasa a `status: "blocked"` y
  no se publica — hay que revisarlo a mano.

## Modo dry run (por defecto: ACTIVADO)

Mientras `config:dry_run` en KV sea distinto de `"false"` (incluido cuando
la clave no existe), el Worker hace todo el flujo (genera, notifica,
aprueba) pero **no llama realmente** a `POST /api/quiz/admin`. En su lugar
marca el borrador como `dry_run_published` y te avisa por Telegram que fue
una prueba.

**Para pasar a modo real** (publicación real en el sitio):

```bash
export NS=8aab28f45f5b4bb6937c24d3d5e7181b ACC=854aab207a73dde863412e20220ba220
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACC/storage/kv/namespaces/$NS/values/config:dry_run" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" --data-raw "false"
```

Para volver a dry run, repetir con `--data-raw "true"`.

## Kill switch (freno de emergencia)

Si `kill_switch:paused` en KV vale `"1"`, el Worker no hace nada: ni el cron
automático (genera/recuerda/publica) ni el disparador manual
`/admin/trigger/*`. El webhook de Telegram tampoco procesa botones ni
comentarios de cambio mientras esté activo.

```bash
# Activar (detener todo inmediatamente)
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACC/storage/kv/namespaces/$NS/values/kill_switch:paused" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" --data-raw "1"

# Desactivar (reanudar)
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACC/storage/kv/namespaces/$NS/values/kill_switch:paused" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" --data-raw "0"
```

## Disparo manual (sin esperar al cron)

Protegido con el mismo `X-Admin-Password` que ya usa el panel admin del
quiz en el sitio:

```bash
curl -X POST "https://raices-quiz-weekly.jnannum-rn.workers.dev/admin/trigger/generate" \
  -H "X-Admin-Password: $QUIZ_ADMIN_PASSWORD"

curl -X POST "https://raices-quiz-weekly.jnannum-rn.workers.dev/admin/trigger/reminder" \
  -H "X-Admin-Password: $QUIZ_ADMIN_PASSWORD"

curl -X POST "https://raices-quiz-weekly.jnannum-rn.workers.dev/admin/trigger/publish" \
  -H "X-Admin-Password: $QUIZ_ADMIN_PASSWORD"
```

`publish` respeta la regla del domingo objetivo y el kill switch igual que
el cron real — es un atajo para no esperar la ventana horaria, no una forma
de saltarse las reglas de seguridad.

## Descartar / revisar el borrador actual

```bash
# Ver el borrador actual
curl -s "https://api.cloudflare.com/client/v4/accounts/$ACC/storage/kv/namespaces/$NS/values/draft:current" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# Descartarlo (el viernes siguiente se genera uno nuevo)
curl -X DELETE "https://api.cloudflare.com/client/v4/accounts/$ACC/storage/kv/namespaces/$NS/values/draft:current" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

## Configuración (KV `QUIZ_WEEKLY_KV`, namespace `8aab28f45f5b4bb6937c24d3d5e7181b`)

| Clave | Valor | Descripción |
|---|---|---|
| `chat_id:authorized` | `8550265746` | Único chat de Telegram desde el que se acepta aprobar/cambiar. |
| `config:dry_run` | `"true"` / `"false"` | Ver arriba. Por defecto `true` si falta la clave. |
| `kill_switch:paused` | `"1"` / `"0"` | Ver arriba. |
| `draft:current` | JSON | El borrador en curso (o ausente). |
| `ran:<slot>:<fecha-NY>` | `"1"` | Marcador de idempotencia, expira solo. |

## Secretos del Worker (`wrangler secret put`, ya configurados)

- `QUIZ_ADMIN_PASSWORD` — mismo password del panel admin del quiz del sitio.
- `QUIZ_ANTHROPIC_API_KEY` — clave de Anthropic.
- `TELEGRAM_BOT_TOKEN` — token del bot `@Tirzo_Raices_bot`.
- `TELEGRAM_WEBHOOK_SECRET` — token aleatorio que Telegram reenvía en el
  header `X-Telegram-Bot-Api-Secret-Token`; si no coincide, el webhook
  responde 404 sin revelar que el endpoint existe.

## Por qué esta carpeta NO se sirve en el sitio

`workers/quiz-weekly/` vive en el mismo repositorio que el sitio
(`raicesmedicas.health`), pero es un proyecto totalmente aparte (se
despliega por separado como el Worker `raices-quiz-weekly`, ver arriba). El
proyecto de Cloudflare Pages del sitio no tiene build command (sirve el
repo tal cual como archivos estáticos), así que sin ninguna exclusión
`workers/quiz-weekly/*` —código fuente, `wrangler.toml`, `package.json`—
quedaría accesible públicamente en `raicesmedicas.health/workers/...`.

Esto se evita con un **build command** en la configuración de Pages
(Dashboard → el proyecto → Settings → Builds → Build command, o vía API):

```
rm -rf workers
```

Pages ejecuta ese comando en una copia del checkout antes de subir
`destination_dir` (`/`), así que la carpeta nunca llega a publicarse — sin
tocar nada en el repo ni en `.gitignore`. No afecta a `functions/` (Pages
Functions se compilan aparte, independientemente del build command) ni
requiere ningún paso de "build" real porque el sitio sigue siendo HTML
estático.

Verificado: tras aplicar este build command y regenerar el deployment de
preview de este mismo PR, `/workers/quiz-weekly/package.json` (y el resto
de archivos de esta carpeta) devuelven el fallback normal del sitio en vez
de su contenido real, mientras que el resto del sitio y `/api/quiz/*` 
siguen funcionando sin cambios.

## Desarrollo local

```bash
cd workers/quiz-weekly
npm install
npx wrangler dev   # necesita CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID en el entorno
npx wrangler deploy
npx wrangler tail   # logs en vivo
```
