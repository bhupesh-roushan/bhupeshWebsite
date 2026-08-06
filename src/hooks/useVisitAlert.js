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
    /**
     * Chrome froze the Android version in its user-agent at "Android 10" for
     * every device, so a phone on Android 17 reports 10 and the string cannot
     * be fixed by parsing it better. The real version, and the device model,
     * only exist behind high-entropy Client Hints — which have to be asked
     * for. Chromium only; Safari and Firefox fall back to UA parsing.
     */
    const hints = async () => {
      try {
        const uad = navigator.userAgentData;
        if (!uad?.getHighEntropyValues) return {};
        const h = await uad.getHighEntropyValues([
          "platformVersion",
          "model",
          "fullVersionList",
        ]);
        // "Not.A/Brand" is deliberate noise Chromium injects to stop anyone
        // hardcoding the list; the real browser is whatever remains.
        const real = (h.fullVersionList || []).find(
          (b) => !/not.?a.?brand/i.test(b.brand)
        );
        return {
          platform: uad.platform || "",
          platformVersion: h.platformVersion || "",
          model: h.model || "",
          browser: real ? `${real.brand} ${real.version.split(".")[0]}` : "",
          mobile: !!uad.mobile,
        };
      } catch {
        return {};
      }
    };

    const send = async () => {
      if (cancelled) return;
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* keep going — worst case it sends twice */
      }

      const ch = await hints();
      if (cancelled) return;

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
          ...ch,
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
