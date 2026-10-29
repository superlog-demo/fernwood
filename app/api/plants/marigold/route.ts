import { SpanStatusCode, trace } from "@opentelemetry/api";
import { captureServerException } from "@/lib/sentry";

const tracer = trace.getTracer("@superlog/sample");

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
      const eventId = captureServerException(e);
      span.setAttribute("sentry.event_id", eventId);
      console.error("cart.add failed", {
        plantId: "marigold",
        sentryEventId: eventId,
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
