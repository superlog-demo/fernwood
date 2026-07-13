# Fernwood

A small storefront for a fictional indoor-plant shop, built with Next.js (App
Router) and instrumented with OpenTelemetry via `@vercel/otel`.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3005
```

## Routes

- `/` — storefront: product grid, cart, checkout.
- `POST /api/cart/add` — add an item to the cart.
- `GET /api/healthy` — health check.

## Deploy

Deployed on Vercel. Telemetry (traces + logs) is exported through the Vercel
OpenTelemetry drains to the observability backend; no OTLP endpoint is
configured in the app itself.
