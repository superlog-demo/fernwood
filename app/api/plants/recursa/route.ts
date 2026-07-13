import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("@superlog/sample");

// Recursa's price includes every plant it has budded off. This walk has no base
// case, so it recurses until the call stack overflows (RangeError).
function priceWithOffshoots(depth: number): number {
  return priceWithOffshoots(depth + 1);
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
