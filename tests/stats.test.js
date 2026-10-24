import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import collect, { commandsFor, refHost } from "../api/collect.js";
import stats, { aggregate, lastDays } from "../api/stats.js";

/** @typedef {import("../types/api").ApiRequest} ApiRequest */
/** @typedef {import("../types/api").ApiResponse} ApiResponse */

/**
 * What the response double exposes beyond the handler's own interface: the
 * header, status and body the handler set. `body` is `any` because each test
 * reads a different part of a different handler's reply.
 * @typedef {ApiResponse & { headers: Record<string, string>, code: number, body: any }} MockRes
 */

const CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

/**
 * The handlers read a handful of request fields, so the doubles carry only
 * those. The one cast lives here rather than in every test, instead of
 * faking the whole of Node's IncomingMessage.
 * @param {{ method: string, headers?: Record<string, unknown>, query?: Record<string, unknown>, body?: unknown }} partial
 * @returns {ApiRequest}
 */
const req = (partial) => /** @type {ApiRequest} */ (/** @type {unknown} */ (partial));

/**
 * A response double that records what the handler did.
 * @returns {MockRes}
 */
const mockRes = () => {
  const res = {
    /** @type {Record<string, string>} */
    headers: {},
    code: 0,
    /** @type {any} */
    body: undefined,
    /**
     * @param {string} k
     * @param {string} v
     */
    setHeader(k, v) { this.headers[k] = v; },
    /** @param {number} c */
    status(c) { this.code = c; return this; },
    /** @param {unknown} b */
    json(b) { this.body = b; return this; },
    end() { return this; },
  };
  return /** @type {MockRes} */ (/** @type {unknown} */ (res));
};

/** The few Redis commands the counters use, in memory. */
function fakeRedis() {
  const hashes = new Map();
  const sets = new Map();
  /** @type {(string | number)[][]} */
  const log = [];
  /** @param {[string, string, ...(string | number)[]]} command */
  const run = ([cmd, key, ...args]) => {
    log.push([cmd, key, ...args]);
    switch (cmd) {
      case "HINCRBY": {
        const h = hashes.get(key) ?? new Map();
        h.set(args[0], (Number(h.get(args[0])) || 0) + Number(args[1]));
        hashes.set(key, h);
        return { result: h.get(args[0]) };
      }
      case "HGETALL": return { result: [...(hashes.get(key) ?? [])].flat().map(String) };
      case "PFADD": {
        const s = sets.get(key) ?? new Set();
        s.add(args[0]); sets.set(key, s);
        return { result: 1 };
      }
      case "PFCOUNT": return { result: sets.get(key)?.size ?? 0 };
      case "EXPIRE": return { result: 1 };
      default: return { error: `unsupported ${cmd}` };
    }
  };
  /**
   * @param {string} _url
   * @param {{ body: string }} init
   */
  const store = async (_url, init) => ({
    ok: true,
    json: async () => JSON.parse(init.body).map(run),
  });
  const fetch = vi.fn(store);
  return { fetch, log };
}

/**
 * @param {Record<string, unknown>} body
 * @param {Record<string, string>} [headers]  overrides the defaults
 */
const hit = (body, headers = {}) =>
  req({
    method: "POST",
    headers: { "user-agent": CHROME, host: "www.bhupesh.blog", "x-forwarded-for": "203.0.113.7", ...headers },
    body,
  });

describe("collect", () => {
  /** @type {ReturnType<typeof fakeRedis>} */
  let redis;
  beforeEach(() => {
    redis = fakeRedis();
    vi.stubGlobal("fetch", redis.fetch);
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example";
    process.env.UPSTASH_REDIS_REST_TOKEN = "t";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  it("does nothing, quietly, when no store is connected", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const res = mockRes();
    await collect(hit({ event: "pageview", path: "/" }), res);
    expect(res.code).toBe(204);
    expect(res.headers["x-collect"]).toBe("disabled");
    expect(redis.fetch).not.toHaveBeenCalled();
  });

  it("also accepts the KV_REST_API_* names the marketplace integration sets", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.KV_REST_API_URL = "https://kv.example";
    process.env.KV_REST_API_TOKEN = "t";
    const res = mockRes();
    await collect(hit({ event: "pageview", path: "/" }), res);
    expect(redis.fetch).toHaveBeenCalledOnce();
  });

  it("drops crawlers and script clients without writing", async () => {
    for (const ua of ["Googlebot/2.1", "curl/8.4.0", "python-requests/2.31", "Java/17"]) {
      const res = mockRes();
      await collect(hit({ event: "pageview", path: "/" }, { "user-agent": ua }), res);
      expect(res.code).toBe(204);
    }
    expect(redis.fetch).not.toHaveBeenCalled();
  });

  it("rejects events outside the closed list, and malformed detail", async () => {
    let res = mockRes();
    await collect(hit({ event: "delete_everything" }), res);
    expect(res.code).toBe(400);
    res = mockRes();
    await collect(hit({ event: "project_open", detail: "a b\nc; DROP" }), res);
    expect(res.code).toBe(400);
    expect(redis.fetch).not.toHaveBeenCalled();
  });

  it("rejects non-POST", async () => {
    const res = mockRes();
    await collect(req({ method: "GET", headers: {} }), res);
    expect(res.code).toBe(405);
  });

  it("never writes an IP or user-agent into any key, field or value", async () => {
    await collect(hit({ event: "pageview", path: "/", ref: "https://news.ycombinator.com/item?id=1" }), mockRes());
    const written = JSON.stringify(redis.log);
    expect(written).not.toContain("203.0.113.7");
    expect(written).not.toContain("Macintosh");
    expect(written).not.toContain("Chrome/140");
  });

  it("counts the same visitor once a day, and a different one separately", async () => {
    await collect(hit({ event: "pageview", path: "/" }), mockRes());
    await collect(hit({ event: "pageview", path: "/writing" }), mockRes());
    await collect(hit({ event: "pageview", path: "/" }, { "x-forwarded-for": "198.51.100.9" }), mockRes());

    const res = mockRes();
    await stats(req({ method: "GET", query: { days: "1" } }), res);
    expect(res.body.totals.views).toBe(3);
    expect(res.body.totals.visitorDays).toBe(2);
  });

  it("records an event under its detail, and the referrer as a bare host", async () => {
    await collect(hit({ event: "pageview", path: "/", ref: "https://www.linkedin.com/feed/update/xyz?trk=1" }), mockRes());
    await collect(hit({ event: "project_open", detail: "atlas" }), mockRes());
    await collect(hit({ event: "project_open", detail: "atlas" }), mockRes());
    await collect(hit({ event: "project_open", detail: "hourglass" }), mockRes());

    const res = mockRes();
    await stats(req({ method: "GET", query: { days: "1" } }), res);
    expect(res.body.projects).toEqual([
      { name: "atlas", count: 2 },
      { name: "hourglass", count: 1 },
    ]);
    expect(res.body.totals.projectOpens).toBe(3);
    expect(res.body.referrers).toEqual([{ name: "linkedin.com", count: 1 }]);
  });

  it("swallows a store failure rather than surfacing it to the visitor", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500 })));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = mockRes();
    await collect(hit({ event: "pageview", path: "/" }), res);
    expect(res.code).toBe(204);
    spy.mockRestore();
  });
});

describe("refHost", () => {
  it("keeps only the host, minus www", () => {
    expect(refHost("https://www.google.com/search?q=secret", "www.bhupesh.blog")).toBe("google.com");
  });
  it("ignores the site itself and garbage", () => {
    expect(refHost("https://www.bhupesh.blog/projects/atlas", "www.bhupesh.blog")).toBe("");
    expect(refHost("not a url", "x")).toBe("");
    expect(refHost("", "x")).toBe("");
  });
});

describe("commandsFor", () => {
  it("gives every key an expiry, so nothing is kept forever", () => {
    const cmds = commandsFor({ event: "pageview", path: "/", visitor: "v" }, "2026-10-25");
    expect(cmds.some((c) => c[0] === "EXPIRE" && c[1] === "a:2026-10-25")).toBe(true);
    expect(cmds.some((c) => c[0] === "EXPIRE" && c[1] === "u:2026-10-25")).toBe(true);
  });
  it("adds to the visitor set only for page views", () => {
    const cmds = commandsFor({ event: "project_open", detail: "atlas", visitor: "v" }, "2026-10-25");
    expect(cmds.some((c) => c[0] === "PFADD")).toBe(false);
  });
});

describe("stats", () => {
  it("answers 200 with configured:false when there is no store", async () => {
    const res = mockRes();
    await stats(req({ method: "GET", query: {} }), res);
    expect(res.code).toBe(200);
    expect(res.body).toEqual({ configured: false });
  });

  it("lists days oldest first, ending today", () => {
    const d = lastDays(3, new Date("2026-10-25T12:00:00Z"));
    expect(d).toEqual(["2026-10-23", "2026-10-24", "2026-10-25"]);
  });

  it("clamps the window", async () => {
    const redis = fakeRedis();
    vi.stubGlobal("fetch", redis.fetch);
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example";
    process.env.UPSTASH_REDIS_REST_TOKEN = "t";
    const res = mockRes();
    await stats(req({ method: "GET", query: { days: "100000" } }), res);
    expect(res.body.days).toBe(90);
    vi.unstubAllGlobals();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("aggregates across days and ranks by count", () => {
    const out = aggregate(
      ["2026-10-24", "2026-10-25"],
      [
        { pv: 4, "ref:google.com": 2, "ev:project_open:atlas": 1 },
        { pv: 6, "ref:google.com": 1, "ref:linkedin.com": 4, "ev:project_open:atlas": 2, "ev:project_open:cubekit": 1 },
      ],
      [3, 5]
    );
    expect(out.totals).toMatchObject({ views: 10, visitorDays: 8, projectOpens: 4 });
    expect(out.referrers[0]).toEqual({ name: "linkedin.com", count: 4 });
    expect(out.projects[0]).toEqual({ name: "atlas", count: 3 });
    expect(out.series[1]).toEqual({ date: "2026-10-25", views: 6, visitors: 5 });
  });
});
