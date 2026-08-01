import * as Sentry from "@sentry/nextjs";
import { registerOTel } from "@vercel/otel";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }

  registerOTel({
    serviceName: "superlog-sample-nextjs",
    attributes: {
      // Tag this application as a demo environment to prevent production alerts
      env: "demo",
      "deployment.environment.name": "demo",
      "app.purpose": "demonstration",
    },
  });
}

export const onRequestError = Sentry.captureRequestError;
