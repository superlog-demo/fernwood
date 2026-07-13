import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("@superlog/sample");

interface CareProfile {
  leaves: number;
}

// Returns the care profile for a plant SKU, or null if none is on file.
function getCareProfile(_plantId: string): CareProfile | null {
  // nullingia has no care profile registered yet
  return null;
}

// Reads the leaf count off the plant's care profile to show on the cart line.
// Defaults to 0 leaves when no care profile exists for this SKU.
function addNullingiaToCart() {
  const careProfile = getCareProfile("nullingia");
  return { leaves: careProfile?.leaves ?? 0 };
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
