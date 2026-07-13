import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("@superlog/sample");

// Each plant in the shop is a different kind of failure. Adding one to the cart
// runs its `trigger`, which throws a genuinely distinct exception (distinct type
// + stack), so Superlog groups them as separate issues.
class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

const TRIGGERS: Record<string, () => never> = {
  // TypeError — reach for a property on null.
  nullingia: () => {
    const plant = null as unknown as { leaves: number };
    void plant.leaves;
    throw new Error("unreachable");
  },
  // RangeError — infinite recursion blows the call stack.
  recursa: () => {
    const grow = (n: number): number => grow(n + 1);
    grow(0);
    throw new Error("unreachable");
  },
  // SyntaxError — parse some malformed JSON.
  marigold: () => {
    JSON.parse("{ petals: unquoted, }");
    throw new Error("unreachable");
  },
  // Error — a slow upstream that never answers.
  "patience-fern": () => {
    throw new Error("upstream greenhouse API timed out after 5000ms");
  },
  // Custom DatabaseError — a deadlock rolls the transaction back.
  "deadlock-dahlia": () => {
    throw new DatabaseError(
      'deadlock detected on relation "orders"; transaction rolled back',
    );
  },
  // ReferenceError — an identifier that was never defined.
  "ghost-orchid": () => {
    new Function("return waterSchedule")();
    throw new Error("unreachable");
  },
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { id?: string };
  const id = body.id ?? "";

  return tracer.startActiveSpan("cart.add", (span) => {
    span.setAttribute("plant.id", id);
    span.setAttribute("demo.kind", "add-to-cart");
    try {
      const trigger = TRIGGERS[id];
      if (!trigger) {
        return Response.json({ ok: false, error: "unknown plant" }, { status: 404 });
      }
      trigger();
      span.setStatus({ code: SpanStatusCode.OK });
      return Response.json({ ok: true });
    } catch (err) {
      const e = err as Error;
      // Log to stderr (Vercel drains this as an ERROR log) and record the
      // exception on the span (drained as a trace).
      console.error(`cart.add failed for plant "${id}":`, e);
      span.recordException(e);
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
      return Response.json(
        { ok: false, error: e.name, message: e.message },
        { status: 500 },
      );
    } finally {
      span.end();
    }
  });
}
