// First-party, privacy-preserving counters.
//
// What it stores, and what it does not — stated here because the gap is the
// point of the design:
//
//   stored    per-day totals: page views, which project / write-up was opened,
//             the referring *site's host* (never the full URL), device class,
//             and country. A count of distinct visitors per day.
//   never     an IP address, a user-agent string, a cookie, a fingerprint, or
//             anything that can be tied back to one person or followed across
//             days.
//
// "Distinct visitors" without storing anyone: the IP and user-agent are hashed
// together with the date and a salt, and the hash goes only into a HyperLogLog
// — a structure that can say roughly how many different values it has seen but
// cannot list them, and cannot be asked whether a given one is in it. The date
// in the hash means the same person is a different value tomorrow, so there is
// no way to follow anyone from one day to the next even with the salt.
//
// Set STATS_SALT to any long random string. Without it a fixed fallback is
// used, which still rotates daily but is guessable in principle.

import { createHash } from "node:crypto";
import { BOT, HTTP_CLIENT, readAgent } from "./visit.js";
import { configured, pipeline, dayKey } from "./_store.js";

// A closed list. Anything else is dropped, so the endpoint can't be used to
// write arbitrary keys into the store.
const EVENTS = new Set([
  "pageview",
  "project_open",
  "case_study_open",
  "resume_download",
  "booking_click",
  "contact_sent",
]);

const KEEP_DAYS = 400;
const SAFE_DETAIL = /^[a-z0-9][a-z0-9._ -]{0,59}$/i;
const SAFE_PATH = /^\/[a-z0-9/_-]{0,80}$/i;
const SAFE_HOST = /^[a-z0-9.-]{1,80}$/i;

const clip = (v, n) => (typeof v === "string" ? v.slice(0, n) : "");

/** The referring site's host with no scheme, path or query — or "". */
export function refHost(raw, ownHost) {
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
    if (!host || host === ownHost?.replace(/^www\./, "") || !SAFE_HOST.test(host)) return "";
    return host;
  } catch {
    return "";
  }
}

/** Build the Redis commands for one validated hit. Pure, so it is testable. */
export function commandsFor({ event, detail, path, ref, src, device, country, visitor }, day) {
  const a = `a:${day}`;
  const cmds = [];
  const bump = (field) => cmds.push(["HINCRBY", a, field, 1]);

  if (event === "pageview") {
    bump("pv");
    if (path) bump(`path:${path}`);
    if (ref) bump(`ref:${ref}`);
    if (src) bump(`src:${src}`);
    if (device) bump(`dev:${device}`);
    if (country) bump(`cty:${country}`);
    cmds.push(["PFADD", `u:${day}`, visitor]);
    cmds.push(["EXPIRE", `u:${day}`, KEEP_DAYS * 86400]);
  } else {
    bump(`ev:${event}${detail ? `:${detail}` : ""}`);
  }
  cmds.push(["EXPIRE", a, KEEP_DAYS * 86400]);
  return cmds;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  // Not set up: say nothing, cost nothing. The browser does not retry.
  if (!configured()) {
    res.setHeader("x-collect", "disabled");
    return res.status(204).end();
  }

  const ua = clip(req.headers["user-agent"], 300);
  // Crawlers and previewers would otherwise be most of the "visitors".
  if (!ua || BOT.test(ua) || HTTP_CLIENT.test(ua)) return res.status(204).end();

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || !EVENTS.has(body.event)) return res.status(400).json({ error: "unknown event" });

  const detail = clip(body.detail, 60);
  if (detail && !SAFE_DETAIL.test(detail)) return res.status(400).json({ error: "bad detail" });

  const path = clip(body.path, 100).split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  const ownHost = clip(req.headers.host, 80).split(":")[0];

  const ip = clip(String(req.headers["x-forwarded-for"] || "").split(",")[0].trim(), 60);
  const day = dayKey();
  const visitor = createHash("sha256")
    .update(`${process.env.STATS_SALT || "bhupesh.blog"}|${day}|${ip}|${ua}`)
    .digest("hex")
    .slice(0, 24);

  const src = clip(body.src, 60);
  const hit = {
    event: body.event,
    detail,
    path: SAFE_PATH.test(path) ? path : "",
    ref: refHost(clip(body.ref, 300), ownHost),
    src: SAFE_DETAIL.test(src) ? src.toLowerCase() : "",
    device: readAgent(ua).kind,
    country: /^[A-Z]{2}$/.test(String(req.headers["x-vercel-ip-country"] || ""))
      ? req.headers["x-vercel-ip-country"]
      : "",
    visitor,
  };

  try {
    await pipeline(commandsFor(hit, day));
    res.status(204).end();
  } catch (err) {
    // The visitor must never see this, and a failing counter must never block
    // anything — it is a 502 in the log and a 204 to the browser.
    console.error("collect:", err.message);
    res.status(204).end();
  }
}
