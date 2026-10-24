// Reads the counters back as one aggregate — the data behind /insights.
//
// Public by design: everything here is a total, and "which of my projects get
// opened" is exactly the kind of thing worth showing rather than hiding. No
// individual hit is stored, so there is nothing finer-grained to leak.

import { configured, pipeline, dayKey } from "./_store.js";

/** @typedef {import("../types/api").ApiRequest} ApiRequest */
/** @typedef {import("../types/api").ApiResponse} ApiResponse */
/** @typedef {import("./_store.js").RedisValue} RedisValue */

/**
 * One day's counters, field to count — the shape HGETALL is folded into.
 * @typedef {Record<string, number>} DayCounts
 */

const MAX_DAYS = 90;

/**
 * The N most recent UTC days, oldest first.
 * @param {number} n
 * @param {Date} [now]
 */
export function lastDays(n, now = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - (n - 1 - i));
    return dayKey(d);
  });
}

/**
 * HGETALL arrives as a flat [field, value, field, value, …] list.
 * @param {RedisValue} flat
 * @returns {DayCounts}
 */
const toObject = (flat) => {
  const list = /** @type {(string | number)[] | null} */ (flat);
  /** @type {DayCounts} */
  const o = {};
  for (let i = 0; i < (list?.length ?? 0); i += 2) o[String(list?.[i])] = Number(list?.[i + 1]);
  return o;
};

/**
 * Fold per-day hashes into totals. Pure, so it is testable without a store.
 * @param {string[]} days   oldest first, as lastDays returns them
 * @param {DayCounts[]} hashes     one per day, same order
 * @param {number[]} visitors  distinct-visitor count per day, same order
 */
export function aggregate(days, hashes, visitors) {
  /** @param {string} prefix @param {number} [limit] */
  const rank = (prefix, limit = 8) => {
    /** @type {Record<string, number>} */
    const totals = {};
    hashes.forEach((h) => {
      for (const [k, v] of Object.entries(h)) {
        if (k.startsWith(prefix)) totals[k.slice(prefix.length)] = (totals[k.slice(prefix.length)] || 0) + v;
      }
    });
    return Object.entries(totals)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, limit);
  };

  const series = days.map((date, i) => ({
    date,
    views: hashes[i].pv || 0,
    visitors: visitors[i] || 0,
  }));

  /** @param {"views" | "visitors"} key */
  const sum = (key) => series.reduce((n, d) => n + d[key], 0);
  /** @param {string} name */
  const events = (name) => rank(`ev:${name}:`, 10);
  /** @param {string} name */
  const eventTotal = (name) =>
    hashes.reduce((n, h) => n + Object.entries(h).reduce((m, [k, v]) => (k === `ev:${name}` || k.startsWith(`ev:${name}:`) ? m + v : m), 0), 0);

  return {
    days: days.length,
    from: days[0],
    to: days[days.length - 1],
    totals: {
      views: sum("views"),
      // Distinct per day, summed. A returning visitor counts once per day they
      // come, so this is visitor-days — labelled that way on the page rather
      // than passed off as unique people.
      visitorDays: sum("visitors"),
      projectOpens: eventTotal("project_open"),
      writeUps: eventTotal("case_study_open"),
      resume: eventTotal("resume_download"),
      booking: eventTotal("booking_click"),
      contact: eventTotal("contact_sent"),
    },
    series,
    projects: events("project_open"),
    studies: events("case_study_open"),
    pages: rank("path:", 8),
    referrers: rank("ref:"),
    sources: rank("src:"),
    devices: rank("dev:", 3),
    countries: rank("cty:"),
  };
}

/**
 * @param {ApiRequest} req
 * @param {ApiResponse} res
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }
  if (!configured()) {
    // 200 with a flag, not an error: "no store connected" is a state the page
    // explains, not a failure to retry.
    return res.status(200).json({ configured: false });
  }

  const n = Math.min(MAX_DAYS, Math.max(1, parseInt(String(req.query?.days), 10) || 30));
  const days = lastDays(n);

  try {
    const out = await pipeline([
      ...days.map((d) => ["HGETALL", `a:${d}`]),
      ...days.map((d) => ["PFCOUNT", `u:${d}`]),
    ]);
    const hashes = out.slice(0, n).map(toObject);
    const visitors = out.slice(n).map(Number);

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ configured: true, ...aggregate(days, hashes, visitors) });
  } catch (err) {
    console.error("stats:", err instanceof Error ? err.message : err);
    return res.status(502).json({ error: "store unavailable" });
  }
}
