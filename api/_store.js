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

/**
 * What Redis hands back for one command: a string, an integer, null for a
 * missing key, or a flat list of those (HGETALL is field, value, field, value).
 * One level of list is all these commands produce, and it keeps the type from
 * referring to itself, which the checker rejects.
 * @typedef {string | number | null | (string | number | null)[]} RedisValue
 */

/**
 * One command: ["CMD", ...args].
 * @typedef {(string | number)[]} RedisCommand
 */

/**
 * Run several commands in one round trip.
 * @param {RedisCommand[]} commands
 * @returns {Promise<RedisValue[]>}
 */
export async function pipeline(commands) {
  const r = await fetch(`${url()}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(3000),
  });
  if (!r.ok) throw new Error(`store responded ${r.status}`);
  /** @type {{ result: RedisValue, error?: string }[]} */
  const results = await r.json();
  const failed = results.find((x) => x?.error);
  if (failed) throw new Error(failed.error);
  return results.map((x) => x.result);
}

/**
 * The UTC calendar day, "2026-10-25" — the unit every counter is bucketed by.
 * @param {Date} [d]
 */
export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
