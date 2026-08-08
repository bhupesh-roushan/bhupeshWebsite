import { useEffect, useRef } from "react";

/**
 * How much of the article is behind you.
 *
 * Width is written to the node inside a rAF rather than held in state: this
 * updates on every scroll event, and re-rendering a case study's whole section
 * tree to move a 2px bar would be the expensive way to draw a rectangle.
 *
 * Measured against the article, not the document, so the footer and the
 * "more writing" block don't count as unread prose.
 */
export const ReadingProgress = ({ targetRef }) => {
  const bar = useRef(null);
  const frame = useRef(0);

  useEffect(() => {
    const update = () => {
      frame.current = 0;
      const el = targetRef.current;
      if (!el || !bar.current) return;
      const start = el.offsetTop;
      const distance = el.offsetHeight - window.innerHeight;
      const done = distance <= 0 ? 1 : (window.scrollY - start) / distance;
      bar.current.style.transform = `scaleX(${Math.min(Math.max(done, 0), 1)})`;
    };

    const onScroll = () => {
      if (!frame.current) frame.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetRef]);

  return (
    // Under the navbar's z-50 so it never covers the menu, and aria-hidden
    // because it reports nothing a screen reader cannot already tell from
    // position in the document.
    <div className="fixed inset-x-0 top-0 z-40 h-0.5 bg-transparent" aria-hidden="true">
      <div
        ref={bar}
        className="h-full origin-left bg-gradient-to-r from-indigo-500 to-sky-400"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
};
