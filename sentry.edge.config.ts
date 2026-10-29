import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  // @vercel/otel owns the OpenTelemetry provider for this app.
  skipOpenTelemetrySetup: true,
});
