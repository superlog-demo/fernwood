import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("@superlog/sample");

// Computes the Ghost Orchid's watering reminder. It references a schedule that
// was never defined in this scope, throwing a ReferenceError.
function ghostOrchidWateringReminder() {
  return new Function("return waterSchedule")();
}

export async function POST() {
  return tracer.startActiveSpan("cart.add", (span) => {
    span.setAttribute("plant.id", "ghost-orchid");
    try {
      const reminder = ghostOrchidWateringReminder();
      span.setStatus({ code: SpanStatusCode.OK });
      return Response.json({ ok: true, reminder });
    } catch (err) {
      const e = err as Error;
      console.error('cart.add failed for plant "ghost-orchid":', e);
      span.recordException(e);
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
      return Response.json({ ok: false, error: e.name, message: e.message }, { status: 500 });
    } finally {
      span.end();
    }
  });
}
