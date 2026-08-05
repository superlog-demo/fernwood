import { SpanStatusCode, trace } from "@opentelemetry/api";
import * as Sentry from "@sentry/nextjs";

const tracer = trace.getTracer("@superlog/sample");

const GREENHOUSE_API_URL =
  process.env.GREENHOUSE_API_URL ?? "https://greenhouse.fernwood.internal";
const GREENHOUSE_TIMEOUT_MS = 5_000;

// Checks live stock for the Patience Fern against the upstream greenhouse API.
async function checkPatienceFernStock(): Promise<{ available: number }> {
  const response = await fetch(`${GREENHOUSE_API_URL}/stock/patience-fern`, {
    signal: AbortSignal.timeout(GREENHOUSE_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`greenhouse API responded with ${response.status}`);
  }
  return response.json() as Promise<{ available: number }>;
}

export async function POST() {
  return tracer.startActiveSpan("cart.add", async (span) => {
    span.setAttribute("plant.id", "patience-fern");
    try {
      const stock = await checkPatienceFernStock();
      span.setStatus({ code: SpanStatusCode.OK });
      return Response.json({ ok: true, stock });
    } catch (err) {
      const e = err as Error;
      Sentry.captureException(e);
      console.error('cart.add failed for plant "patience-fern":', e);
      span.recordException(e);
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
      return Response.json({ ok: false, error: e.name, message: e.message }, { status: 500 });
    } finally {
      span.end();
    }
  });
}
