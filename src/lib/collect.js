/**
 * Sends the first-party counters behind /insights. See api/collect.js for what
 * is and is not stored — in short, totals per day and never anything that
 * identifies a visitor.
 *
 * Opt-out is honoured before anything is sent: a browser that says Do Not Track
 * or Global Privacy Control is not counted at all, not even anonymously.
 */
const LANDED = "collect-landed";

const isLocal = () => ["localhost", "127.0.0.1"].includes(window.location.hostname);

function allowed() {
  if (typeof window === "undefined") return false;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl) return false;
  // Development has no /api, and a test click would otherwise be a 404 in the
  // console. `?collect=1` turns it on for checking the wiring.
  if (isLocal() && !new URLSearchParams(window.location.search).has("collect")) return false;
  return true;
}

function send(payload) {
  const body = JSON.stringify(payload);
  try {
    // sendBeacon survives the page closing, which is when the last click of a
    // visit tends to happen. Falls back to a keepalive fetch where it is absent.
    if (navigator.sendBeacon?.("/api/collect", new Blob([body], { type: "application/json" }))) return;
    fetch("/api/collect", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  } catch {
    /* Counting is never worth an error in the visitor's console. */
  }
}

/** A named action — project opened, résumé downloaded, and so on. */
export function collect(event, detail = "") {
  if (!allowed()) return;
  send({ event, detail });
}

/**
 * A page view. The referrer and ?src= tag go with the first one of the visit
 * only: later views in the same tab are navigation within the site, and
 * counting their referrer as "direct" would drown the real sources.
 */
export function collectPageview(path, src = "") {
  if (!allowed()) return;
  let first = false;
  try {
    first = !sessionStorage.getItem(LANDED);
    sessionStorage.setItem(LANDED, "1");
  } catch {
    /* No storage: treat every view as a landing, which over-credits sources a little. */
    first = true;
  }
  send({
    event: "pageview",
    path,
    ref: first ? document.referrer : "",
    src: first ? src : "",
  });
}
