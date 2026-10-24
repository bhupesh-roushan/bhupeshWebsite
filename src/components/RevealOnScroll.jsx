import { useEffect, useRef } from "react";

// Chrome and Safari run the reveal in CSS, scrubbed by the scroll position (see
// .reveal-sd in index.css). Everything else gets the observer below, which
// fades the same block in once it is 10% on screen.
const NATIVE =
  typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: view()");

export const RevealOnScroll = ({ children }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (NATIVE) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current.classList.add("visible");
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10px 0px" }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={NATIVE ? "reveal-sd" : "reveal"}>
      {children}
    </div>
  );
};
