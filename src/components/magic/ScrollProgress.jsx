import { useEffect, useRef } from "react";

/**
 * Magic UI's Scroll Progress: a hairline across the top of the window that
 * fills as the page is read.
 *
 * Browsers with scroll-driven animations run it in CSS (see .scroll-progress in
 * magic.css) with no JavaScript at all. Everywhere else this falls back to one
 * passive scroll listener that writes a transform — no layout, no state, so the
 * page is not re-rendered for every pixel.
 */
const NATIVE = typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: scroll()");

export const ScrollProgress = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (NATIVE) return;
    const el = ref.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="scroll-progress" />;
};
