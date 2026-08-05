import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { allSkills } from "../data/skills";

const COLS = 12;
const ROWS = 8;
const REVEAL_RADIUS = 170;
const TOUCH_RADIUS = 120;

// Applied inline so the layer is masked from the very first paint. Waiting for
// the effect left a frame where every icon was visible, and on touch devices —
// where the effect bails early — they stayed visible for good.
const HIDDEN_MASK = "radial-gradient(0px circle at 50% 50%, #000 0%, transparent 100%)";

// Deterministic offsets keyed by index. Random ones would reshuffle on every
// re-render, and this sits inside a hero that re-renders on a 2.6s rotator.
const jitterX = (i) => ((i * 37) % 7) - 3;
const jitterY = (i) => ((i * 53) % 7) - 3;

// 96 slots over 47 skills, so the set tiles roughly twice. Walking the list
// with a stride coprime to its length cycles through every skill before
// repeating any, which keeps duplicates from landing next to each other.
const STRIDE = 7;

const PLACED = Array.from({ length: COLS * ROWS }, (_, i) => {
  const skill = allSkills[(i * STRIDE) % allSkills.length];
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return {
    ...skill,
    key: `${skill.name}-${i}`,
    x: ((col + 0.5) / COLS) * 100 + jitterX(i),
    y: ((row + 0.5) / ROWS) * 100 + jitterY(i),
    size: 26 + ((i * 17) % 14), // 26–39px
  };
});

/**
 * Every skill scattered across the hero, invisible until the cursor passes
 * over them. One layer, revealed through a radial mask that follows the
 * pointer — with no pointer the mask is zero-radius, so nothing shows.
 */
export const TechBackdrop = () => {
  const reduceMotion = useReducedMotion();
  const layerRef = useRef(null);
  const frame = useRef(0);

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;
    // A spotlight chasing the pointer is exactly the kind of incidental motion
    // this setting asks us to drop; the icons simply stay hidden.
    if (reduceMotion) return;

    const section = el.closest("section");
    if (!section) return;

    const hide = () => {
      // Cancel first. A pointermove queues the reveal on the next frame, and on
      // touch the final move and the lift land in the same frame — without this
      // that queued frame repaints the circle straight after hiding it, so the
      // icons never went away when the finger came off.
      cancelAnimationFrame(frame.current);
      el.style.maskImage = HIDDEN_MASK;
      el.style.webkitMaskImage = HIDDEN_MASK;
    };

    const revealAt = (clientX, clientY, radius) => {
      cancelAnimationFrame(frame.current);
      const rect = section.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      frame.current = requestAnimationFrame(() => {
        const mask = `radial-gradient(${radius}px circle at ${x}px ${y}px, #000 0%, rgba(0,0,0,0.6) 50%, transparent 75%)`;
        el.style.maskImage = mask;
        el.style.webkitMaskImage = mask;
      });
    };

    const onMouseMove = (e) => revealAt(e.clientX, e.clientY, REVEAL_RADIUS);

    // Native touch events, not pointer events. Once the browser claims a drag
    // for scrolling it fires pointercancel and stops sending pointermove — so
    // the reveal only ever landed on a tap. touchmove keeps firing throughout
    // the gesture, which is what lets the circle track the finger.
    // A tighter radius too: 170px on a 390px screen lights up half the hero.
    const onTouch = (e) => {
      const t = e.touches[0];
      if (t) revealAt(t.clientX, t.clientY, TOUCH_RADIUS);
    };

    hide();
    section.addEventListener("mousemove", onMouseMove, { passive: true });
    section.addEventListener("mouseleave", hide);
    section.addEventListener("touchstart", onTouch, { passive: true });
    section.addEventListener("touchmove", onTouch, { passive: true });
    section.addEventListener("touchend", hide, { passive: true });
    section.addEventListener("touchcancel", hide, { passive: true });

    return () => {
      cancelAnimationFrame(frame.current);
      section.removeEventListener("mousemove", onMouseMove);
      section.removeEventListener("mouseleave", hide);
      section.removeEventListener("touchstart", onTouch);
      section.removeEventListener("touchmove", onTouch);
      section.removeEventListener("touchend", hide);
      section.removeEventListener("touchcancel", hide);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      style={{ maskImage: HIDDEN_MASK, WebkitMaskImage: HIDDEN_MASK }}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {PLACED.map(({ Icon, color, x, y, size, key }) => (
        <Icon
          key={key}
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            color,
            opacity: 0.75,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
};
