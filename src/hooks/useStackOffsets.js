import { useEffect } from "react";

/**
 * Makes a sticky stack safe for panels taller than the viewport.
 *
 * With `top: 0`, a panel pins the moment its top edge reaches the viewport
 * top — so a 1700px panel in a 900px window pins with 800px of itself still
 * unread, and the next panel then scrolls over the part you never saw.
 *
 * Setting `top` to (viewportHeight - panelHeight) for tall panels moves the
 * pin point to the end of the panel instead: it scrolls all the way through,
 * and only pins once its bottom edge reaches the bottom of the window. Short
 * panels keep `top: 0`, where there is nothing to scroll past.
 *
 * CSS cannot express this — `top` percentages resolve against the containing
 * block, not the element — so it is measured here and re-measured on resize,
 * since the answer depends on a viewport height that changes.
 */
export function useStackOffsets(selector = ".stack-panel") {
  useEffect(() => {
    const panels = () => Array.from(document.querySelectorAll(selector));

    const measure = () => {
      for (const el of panels()) {
        const overflow = el.offsetHeight - window.innerHeight;
        el.style.top = overflow > 0 ? `${-overflow}px` : "0px";
      }
    };

    measure();

    // Content reflows as images and fonts land, and each changes the height
    // this depends on.
    const ro = new ResizeObserver(measure);
    panels().forEach((el) => ro.observe(el));
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [selector]);
}
