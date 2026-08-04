import { useEffect, useRef } from "react";
import { allSkills } from "../data/skills";

const COLS = 12;
const ROWS = 8;
const REVEAL_RADIUS = 170;

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
  const layerRef = useRef(null);
  const frame = useRef(0);

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;

    // No hover on coarse pointers, so there's nothing to drive the reveal.
    if (window.matchMedia("(hover: none)").matches) return;

    const section = el.closest("section");
    if (!section) return;

    const hide = () => {
      const mask = "radial-gradient(0px circle at 50% 50%, #000 0%, transparent 100%)";
      el.style.maskImage = mask;
      el.style.webkitMaskImage = mask;
    };

    const onMove = (e) => {
      cancelAnimationFrame(frame.current);
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      frame.current = requestAnimationFrame(() => {
        const mask = `radial-gradient(${REVEAL_RADIUS}px circle at ${x}px ${y}px, #000 0%, rgba(0,0,0,0.6) 50%, transparent 75%)`;
        el.style.maskImage = mask;
        el.style.webkitMaskImage = mask;
      });
    };

    hide();
    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", hide);

    return () => {
      cancelAnimationFrame(frame.current);
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", hide);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
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
