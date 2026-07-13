import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("@superlog/sample");

// Checks live stock for the Patience Fern against the upstream greenhouse API,
// which never answers in time — the call times out.
function checkPatienceFernStock(): never {
  throw new Error("upstream greenhouse API timed out after 5000ms");
}

export async function POST() {
  return tracer.startActiveSpan("cart.add", (span) => {
    span.setAttribute("plant.id", "patience-fern");
    try {
      const stock = checkPatienceFernStock();
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
