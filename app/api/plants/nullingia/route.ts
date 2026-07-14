import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("@superlog/sample");

// Reads the leaf count off the plant's care profile to show on the cart line.
// The care profile may be absent for some SKUs; guard against null before reading.
function addNullingiaToCart() {
  const careProfile: { leaves: number } | null = null;
  return { leaves: careProfile?.leaves ?? null };
}

export async function POST() {
  return tracer.startActiveSpan("cart.add", (span) => {
    span.setAttribute("plant.id", "nullingia");
    try {
      const line = addNullingiaToCart();
      span.setStatus({ code: SpanStatusCode.OK });
      return Response.json({ ok: true, line });
    } catch (err) {
      const e = err as Error;
      console.error('cart.add failed for plant "nullingia":', e);
      span.recordException(e);
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
      return Response.json({ ok: false, error: e.name, message: e.message }, { status: 500 });
    } finally {
      span.end();
    }
  });
}
