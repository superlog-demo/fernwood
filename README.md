# Fernwood

A small indoor-plant storefront built with Next.js (App Router) and
instrumented with OpenTelemetry via `@vercel/otel`.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3005
```

Copy `.env.example` to `.env.local` and fill in the Sentry values before
running the app. `SENTRY_DSN` configures server and edge reporting,
while `NEXT_PUBLIC_SENTRY_DSN` configures browser reporting. Use the same
project DSN for both. `SENTRY_ORG`, `SENTRY_PROJECT`, and the server-only
`SENTRY_AUTH_TOKEN` enable source map uploads during production builds.

Do not commit `.env.local` or an auth token.

## Routes

- `/` — storefront: product grid, cart, checkout.
- `POST /api/plants/marigold` — add a Marigold to the cart.
- `POST /api/plants/patience-fern` — add a Patience Fern to the cart.
- `GET /api/healthy` — health check.

## Deploy

Deployed on Vercel. Telemetry (traces + logs) is exported through the Vercel
OpenTelemetry drains to the observability backend; no OTLP endpoint is
configured in the app itself. Sentry uses the existing OpenTelemetry provider
on the server so that this trace export remains intact.
