// Redis over HTTP, for the first-party counters.
//
// Not a function: Vercel treats an underscore-prefixed file in /api as a
// private module rather than a route. It talks to Upstash's REST API, which is
// what the "Upstash Redis" integration in the Vercel marketplace provisions —
// either variable pair below is set for you when you connect it, so there is
// nothing to hand-copy.
//
// Unconfigured is a normal state, not an error: the site works identically and
// the stats page says it has no store to read from.

const url = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const configured = () => Boolean(url() && token());

/** Run several commands in one round trip. Each is ["CMD", ...args]. */
export async function pipeline(commands) {
  const r = await fetch(`${url()}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(3000),
  });
  if (!r.ok) throw new Error(`store responded ${r.status}`);
  const results = await r.json();
  const failed = results.find((x) => x?.error);
  if (failed) throw new Error(failed.error);
  return results.map((x) => x.result);
}

/** The UTC calendar day, "2026-10-25" — the unit every counter is bucketed by. */
export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
