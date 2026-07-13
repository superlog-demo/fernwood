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

// Retries a database operation when it fails with a transient deadlock error.
// PostgreSQL picks one transaction as the deadlock victim; the contending
// transaction has already committed by the time the error is raised, so an
// immediate retry almost always succeeds.
async function withDeadlockRetry<T>(
  fn: () => T,
  maxAttempts = 3,
  delayMs = 50,
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return fn();
    } catch (err) {
      const isDeadlock =
        err instanceof Error && err.message.includes("deadlock");
      if (!isDeadlock || attempt === maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
  // Unreachable — the loop either returns or throws.
  throw new Error("withDeadlockRetry: exhausted attempts");
}

export async function POST() {
  return tracer.startActiveSpan("cart.add", async (span) => {
    span.setAttribute("plant.id", "deadlock-dahlia");
    try {
      const reservation = await withDeadlockRetry(() =>
        reserveDeadlockDahlia(),
      );
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
