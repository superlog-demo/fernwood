import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("@superlog/sample");

const BASE_PRICE = 14.99;
const OFFSHOOT_PRICE = 4.5;
const MAX_OFFSHOOT_DEPTH = 4; // recursa typically buds 4 generations deep

// Recursa's price includes every plant it has budded off.
function priceWithOffshoots(depth: number): number {
  if (depth >= MAX_OFFSHOOT_DEPTH) return BASE_PRICE;
  return OFFSHOOT_PRICE + priceWithOffshoots(depth + 1);
}

export async function POST() {
  return tracer.startActiveSpan("cart.add", (span) => {
    span.setAttribute("plant.id", "recursa");
    try {
      const price = priceWithOffshoots(0);
      span.setStatus({ code: SpanStatusCode.OK });
      return Response.json({ ok: true, price });
    } catch (err) {
      const e = err as Error;
      console.error('cart.add failed for plant "recursa":', e);
      span.recordException(e);
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
      return Response.json({ ok: false, error: e.name, message: e.message }, { status: 500 });
    } finally {
      span.end();
    }
  });
}
