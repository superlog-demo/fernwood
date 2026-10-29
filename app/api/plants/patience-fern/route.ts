import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("@superlog/sample");

type StockCheck = {
  available: boolean;
  source: "cached" | "live";
  degradedReason?: string;
};

function checkPatienceFernStock(): StockCheck {
  const degradedReason = "upstream request timed out";

  console.error("greenhouse stock check failed", {
    plantId: "patience-fern",
    reason: degradedReason,
    fallback: "cached stock",
  });

  return { available: true, source: "cached", degradedReason };
}

export async function POST() {
  return tracer.startActiveSpan("cart.add", (span) => {
    span.setAttribute("plant.id", "patience-fern");
    try {
      const { available, source, degradedReason } = checkPatienceFernStock();
      span.setAttribute("stock.source", source);
      span.setAttribute("stock.available", available);
      if (degradedReason) {
        span.addEvent("stock.fallback", { reason: degradedReason });
      }
      span.setStatus({ code: SpanStatusCode.OK });
      return Response.json({ ok: true, stock: { available, source } });
    } catch (err) {
      const e = err as Error;
      console.error("cart.add failed", {
        plantId: "patience-fern",
        error: { name: e.name, message: e.message, stack: e.stack },
      });
      span.recordException(e);
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
      return Response.json({ ok: false, error: e.name, message: e.message }, { status: 500 });
    } finally {
      span.end();
    }
  });
}
