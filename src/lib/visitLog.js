/**
 * Collects what a visitor actually did, so the alert can say more than that
 * someone arrived.
 *
 * Module-level rather than React state on purpose: components mount and
 * unmount as modals open and routes change, and the log has to outlive all of
 * that. It is per page-load, holds no identifiers, and never leaves the tab
 * except in the single summary sent when the visitor goes.
 */
const SRC_KEY = "visit-src";

const log = {
  start: Date.now(),
  events: [],
  path: [],
};

/** Landing tag, from ?src= or the usual UTM pair. */
function readSrc() {
  try {
    const q = new URLSearchParams(window.location.search);
    const found = q.get("src") || q.get("utm_source") || q.get("utm_campaign");
    // Held for the session: they land on /?src=acme, then open a project and
    // the parameter is gone from the URL — but the visit is still that one.
    if (found) sessionStorage.setItem(SRC_KEY, found.slice(0, 60));
    return sessionStorage.getItem(SRC_KEY) || "";
  } catch {
    return "";
  }
}

/** Anything worth knowing they did. Called from the components that do it. */
export function logVisitEvent(name, detail = "") {
  if (log.events.length >= 40) return; // a bored clicker shouldn't write an essay
  log.events.push({ name, detail: String(detail).slice(0, 60), at: Date.now() });
}

export function logVisitPath(path) {
  const last = log.path[log.path.length - 1];
  if (last === path) return;
  if (log.path.length < 20) log.path.push(path);
}

export function visitSummary() {
  const seconds = Math.round((Date.now() - log.start) / 1000);
  const pick = (name) =>
    log.events.filter((e) => e.name === name).map((e) => e.detail).filter(Boolean);

  return {
    seconds,
    src: readSrc(),
    path: log.path,
    projects: [...new Set(pick("project_open"))],
    studies: [...new Set(pick("case_study_open"))],
    resume: [...new Set(pick("resume_download"))],
    booking: log.events.some((e) => e.name === "booking_click"),
    contact: log.events.some((e) => e.name === "contact_sent"),
    events: log.events.length,
  };
}

export { readSrc };
