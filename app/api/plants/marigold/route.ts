import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("@superlog/sample");

// Loads the Marigold's care card, stored as a JSON blob. The record is
// malformed, so JSON.parse throws a SyntaxError.
function loadMarigoldCareCard() {
  return JSON.parse("{ petals: unquoted, }");
}

export async function POST() {
  return tracer.startActiveSpan("cart.add", (span) => {
    span.setAttribute("plant.id", "marigold");
    try {
      const careCard = loadMarigoldCareCard();
      span.setStatus({ code: SpanStatusCode.OK });
      return Response.json({ ok: true, careCard });
    } catch (err) {
      const e = err as Error;
      console.error('cart.add failed for plant "marigold":', e);
      span.recordException(e);
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
      return Response.json({ ok: false, error: e.name, message: e.message }, { status: 500 });
    } finally {
      span.end();
    }
  });
}
