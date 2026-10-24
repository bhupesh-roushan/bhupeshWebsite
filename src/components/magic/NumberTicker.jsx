import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const ease = (t) => 1 - Math.pow(1 - t, 3); // ease-out cubic

/**
 * Magic UI's Number Ticker: a figure that counts up to its value the first time
 * it scrolls into view.
 *
 * Written without a spring library — a requestAnimationFrame loop over a fixed
 * duration — because the figures here are small integers, and a physics spring
 * is a hundred kilobytes of machinery for a count from 0 to 7.
 *
 * What is announced and what is seen are different on purpose: the visible
 * digits change sixty times a second, so they are hidden from assistive tech,
 * and a visually-hidden copy carries the final value from the start.
 */
export const NumberTicker = ({ value, duration = 1100, className = "", format }) => {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const [shown, setShown] = useState(reduceMotion ? value : 0);
  const fmt = format ?? ((n) => new Intl.NumberFormat("en").format(n));

  useEffect(() => {
    if (reduceMotion) {
      setShown(value);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const run = () => {
      const start = performance.now();
      const from = 0;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        setShown(Math.round(from + (value - from) * ease(t)));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // Counts when it is actually seen, not on page load — a tile three screens
    // down would otherwise finish counting before anyone could watch it.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, reduceMotion]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      <span className="sr-only">{fmt(value)}</span>
      <span aria-hidden="true">{fmt(shown)}</span>
    </span>
  );
};
