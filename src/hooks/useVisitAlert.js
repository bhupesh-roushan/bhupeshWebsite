import { useEffect } from "react";

/**
 * Pings /api/visit once per browser session so a visit can be emailed.
 *
 * Once per *session*, not per page load: the modals change the URL, and
 * without this guard opening four projects would send five emails. There is
 * no cross-session dedupe — the same person returning tomorrow counts again,
 * which is usually what you want from a visit alert anyway.
 *
 * Everything here is best-effort. A failed alert must never be something the
 * visitor can see, so nothing throws and nothing blocks paint.
 */
const KEY = "visit-alerted";

export function useVisitAlert() {
  useEffect(() => {
    let cancelled = false;

    // sessionStorage throws in some privacy modes; a visit alert is not worth
    // taking the page down for.
    let already = false;
    try {
      already = sessionStorage.getItem(KEY) === "1";
    } catch {
      return;
    }
    if (already) return;

    // After paint, and idle — the alert is for you, not for them, so it waits
    // until the page it interrupts has finished rendering.
    const send = () => {
      if (cancelled) return;
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* keep going — worst case it sends twice */
      }

      fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          page: window.location.pathname + window.location.hash,
          referrer: document.referrer || "direct",
          screen: `${window.screen?.width}x${window.screen?.height}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      }).catch(() => {
        /* offline, blocked by an ad blocker, or not configured — all fine */
      });
    };

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(send, { timeout: 4000 })
      : setTimeout(send, 2500);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback && window.requestIdleCallback) {
        window.cancelIdleCallback(idle);
      } else {
        clearTimeout(idle);
      }
    };
  }, []);
}
