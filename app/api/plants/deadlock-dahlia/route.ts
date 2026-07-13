import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("@superlog/sample");

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

// Reserves stock for the Deadlock Dahlia. Two orders contend for the same row
// and the database aborts this transaction with a deadlock.
function reserveDeadlockDahlia(): never {
  throw new DatabaseError('deadlock detected on relation "orders"; transaction rolled back');
}

export async function POST() {
  return tracer.startActiveSpan("cart.add", (span) => {
    span.setAttribute("plant.id", "deadlock-dahlia");
    try {
      const reservation = reserveDeadlockDahlia();
      span.setStatus({ code: SpanStatusCode.OK });
      return Response.json({ ok: true, reservation });
    } catch (err) {
      const e = err as Error;
      console.error('cart.add failed for plant "deadlock-dahlia":', e);
      span.recordException(e);
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
      return Response.json({ ok: false, error: e.name, message: e.message }, { status: 500 });
    } finally {
      span.end();
    }
  });
}
