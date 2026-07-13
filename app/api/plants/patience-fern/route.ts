import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("@superlog/sample");

const GREENHOUSE_API_URL =
  process.env.GREENHOUSE_API_URL ?? "https://api.greenhouse.internal";
const TIMEOUT_MS = 5_000;
const MAX_ATTEMPTS = 2;

interface StockResult {
  sku: string;
  available: number;
}

async function checkPatienceFernStock(): Promise<StockResult> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(
        `${GREENHOUSE_API_URL}/stock/patience-fern`,
        { signal: controller.signal }
      );
      if (!res.ok) {
        throw new Error(`greenhouse API responded with ${res.status}`);
      }
      return (await res.json()) as StockResult;
    } catch (err) {
      lastError =
        err instanceof Error ? err : new Error(String(err));
      if (lastError.name === "AbortError") {
        lastError = new Error(
          `upstream greenhouse API timed out after ${TIMEOUT_MS}ms`
        );
      }
      // Retry on the last attempt only if there are more attempts left;
      // otherwise fall through to throw.
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
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
      console.error('cart.add failed for plant "patience-fern":', e);
      span.recordException(e);
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
      return Response.json({ ok: false, error: e.name, message: e.message }, { status: 500 });
    } finally {
      span.end();
    }
  });
}
