import * as Sentry from "@sentry/nextjs";
import { after } from "next/server";

const FLUSH_TIMEOUT_MS = 2_000;

/**
 * Capture a handled server error and keep the request alive until Sentry has
 * finished sending it. Vercel can suspend background work after the response,
 * so the flush must be registered with Next.js' request lifecycle.
 */
export function captureServerException(error: unknown): string {
  const eventId = Sentry.captureException(error);

  after(async () => {
    const flushed = await Sentry.flush(FLUSH_TIMEOUT_MS);

    if (!flushed) {
      console.error("Sentry delivery timed out", { eventId });
    }
  });

  return eventId;
}
