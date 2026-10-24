import { useEffect, useState } from "react";

const USER = "bhupesh-roushan";
// The repo pushed to most recently. Not the events feed: that only reaches back
// 90 days, so a quiet quarter returned nothing and the pill vanished, when "last
// public push 4 months ago" is exactly the true thing worth saying.
const URL = `https://api.github.com/users/${USER}/repos?sort=pushed&per_page=1&type=owner`;

// Unauthenticated GitHub is 60 requests an hour per IP, and a visitor who
// bounces between pages would burn that on the same answer. A quarter of an
// hour is stale enough to be invisible in "3 hours ago" and fresh enough to be
// true. Bump the suffix if the stored shape changes.
const CACHE_KEY = "live-status-v2";
const TTL_MS = 15 * 60 * 1000;

const read = () => {
  try {
    const hit = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
    return hit && Date.now() - hit.at < TTL_MS ? hit.value : undefined;
  } catch {
    return undefined;
  }
};

const write = (value) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), value }));
  } catch {
    /* private mode or full — it just means the next page refetches. */
  }
};

/** "3 hours ago", in the largest unit that is not zero. */
export function ago(date, now = Date.now()) {
  const s = Math.max(0, Math.round((now - new Date(date).getTime()) / 1000));
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, size] of units) {
    const n = Math.floor(s / size);
    if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

/**
 * The most recent push to a public repository, or null.
 *
 * Public only, and the label says so: most of the work sits in private repos
 * that this API cannot see, so "last commit" would overstate how quiet it has
 * been. Fails to null on any error — a status that cannot be fetched should
 * disappear, not show a broken pill.
 */
export function useLastPush() {
  const [push, setPush] = useState(() => read() ?? null);

  useEffect(() => {
    if (read() !== undefined) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        // Our own function first — token-backed and edge-cached — because the
        // anonymous call below is capped at 60 an hour per IP, and a shared
        // network spends that before a visitor arrives.
        let value = undefined;
        try {
          const own = await fetch("/api/github-activity", { signal: ctrl.signal });
          if (own.ok && (own.headers.get("content-type") ?? "").includes("application/json")) {
            const d = await own.json();
            value = d.lastPush ? { repo: d.lastPush.repo, at: d.lastPush.at } : null;
          }
        } catch (err) {
          if (err.name === "AbortError") return;
        }

        if (value === undefined) {
          const r = await fetch(URL, { signal: ctrl.signal });
          if (!r.ok) return;
          const [repo] = await r.json();
          value = repo?.pushed_at ? { repo: repo.name, at: repo.pushed_at } : null;
        }

        write(value);
        setPush(value);
      } catch {
        /* offline, rate-limited, aborted — leave the pill out */
      }
    })();
    return () => ctrl.abort();
  }, []);

  return push;
}
