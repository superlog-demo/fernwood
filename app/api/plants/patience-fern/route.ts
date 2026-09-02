import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("@superlog/sample");

function checkPatienceFernStock() {
  console.error('greenhouse stock check failed for plant "patience-fern"', {
    reason: "upstream request timed out",
    fallback: "cached stock",
  });

  return { available: true, source: "cached" };
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
