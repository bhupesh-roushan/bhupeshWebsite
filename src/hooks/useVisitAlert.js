import { useEffect } from "react";
import { logVisitPath, readSrc, visitSummary } from "../lib/visitLog";

/**
 * Sends one alert per visit, when the visitor leaves.
 *
 * It used to fire on arrival, which meant every email said the same thing:
 * someone opened the site. A four-second bounce and a four-minute read that
 * ended on the booking page were indistinguishable. Waiting until the end
 * costs nothing — nobody is watching the inbox in real time — and buys the
 * only part that was ever worth knowing.
 *
 * `sendBeacon` rather than `fetch`, because a page being torn down cancels
 * outstanding requests; a beacon is queued by the browser and survives it.
 *
 * Fired on the first of `visibilitychange -> hidden` or `pagehide`, and once
 * only. `hidden` is the one that reliably fires on iOS, where a tab is often
 * killed without ever seeing `pagehide` — which does mean a visitor who
 * switches apps and comes back is reported at the switch rather than at the
 * true end. One email that undercounts beats no email at all.
 */
const KEY = "visit-alerted";
const MUTE = "visit-alerts-muted";

export function useVisitAlert() {
  useEffect(() => {
    let sent = false;

    let muted = false;
    let already = false;
    try {
      // Your own visits are the ones you least need telling about, and you
      // open this site more than anyone. /?alerts=off silences this browser
      // for good; /?alerts=on undoes it.
      const wanted = new URLSearchParams(window.location.search).get("alerts");
      if (wanted === "off") localStorage.setItem(MUTE, "1");
      if (wanted === "on") localStorage.removeItem(MUTE);

      muted = localStorage.getItem(MUTE) === "1";
      already = sessionStorage.getItem(KEY) === "1";
    } catch {
      return; // storage blocked; an alert is not worth breaking the page for
    }
    if (muted || already) return;

    readSrc(); // capture ?src= now, before any navigation drops it
    logVisitPath(window.location.pathname);

    const hints = async () => {
      try {
        const uad = navigator.userAgentData;
        if (!uad?.getHighEntropyValues) return {};
        const h = await uad.getHighEntropyValues([
          "platformVersion",
          "model",
          "fullVersionList",
        ]);
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

    // Resolved up front: getHighEntropyValues returns a promise, and a page
    // being unloaded will not wait for one.
    let ch = {};
    hints().then((v) => {
      ch = v;
    });

    const send = () => {
      if (sent) return;
      sent = true;
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* worst case it sends twice */
      }

      const body = JSON.stringify({
        page: window.location.pathname + window.location.hash,
        referrer: document.referrer || "direct",
        screen: `${window.screen?.width}x${window.screen?.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...ch,
        ...visitSummary(),
      });

      // A Blob with an explicit type, because sendBeacon otherwise posts
      // text/plain and the function would never parse the body.
      const blob = new Blob([body], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/visit", blob)) {
        // Older browsers, or a beacon the browser declined to queue.
        fetch("/api/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    };

    const onHide = () => {
      if (document.visibilityState === "hidden") send();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", send);

    // A tab left open all afternoon should still report before the machine
    // sleeps and the beacon is lost with it.
    const failsafe = setTimeout(send, 15 * 60 * 1000);

    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", send);
      clearTimeout(failsafe);
    };
  }, []);
}
