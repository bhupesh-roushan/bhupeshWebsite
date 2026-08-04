import { useEffect, useRef } from "react";
import { FaReact, FaNodeJs, FaJava, FaGitAlt } from "react-icons/fa";
import {
  SiTypescript,
  SiJavascript,
  SiMongodb,
  SiTailwindcss,
  SiNextdotjs,
  SiExpress,
  SiRedux,
  SiVercel,
  SiLangchain,
  SiFramer,
  SiDocker,
  SiPython,
} from "react-icons/si";
import { TbRobot } from "react-icons/tb";

// Fixed positions rather than random ones, so the layout is stable across
// renders instead of shuffling on every state change. Percentages keep it
// responsive, and the middle band is left sparse so the icons never crowd
// the headline sitting on top of them.
const TECH = [
  { Icon: FaReact, color: "#61DAFB", x: 7, y: 16, size: 46 },
  { Icon: SiTypescript, color: "#3178C6", x: 20, y: 42, size: 34 },
  { Icon: FaNodeJs, color: "#83CD29", x: 12, y: 68, size: 42 },
  { Icon: SiTailwindcss, color: "#38BDF8", x: 27, y: 86, size: 38 },
  { Icon: SiMongodb, color: "#47A248", x: 4, y: 45, size: 32 },
  { Icon: SiRedux, color: "#764ABC", x: 24, y: 8, size: 30 },
  { Icon: SiJavascript, color: "#F7DF1E", x: 35, y: 62, size: 28 },
  { Icon: SiLangchain, color: "#1C3C3C", x: 33, y: 24, size: 30 },

  { Icon: SiNextdotjs, color: "#FFFFFF", x: 92, y: 20, size: 44 },
  { Icon: SiExpress, color: "#CCCCCC", x: 78, y: 45, size: 34 },
  { Icon: SiDocker, color: "#2496ED", x: 88, y: 70, size: 42 },
  { Icon: SiPython, color: "#3776AB", x: 71, y: 84, size: 36 },
  { Icon: FaJava, color: "#E76F00", x: 96, y: 48, size: 32 },
  { Icon: TbRobot, color: "#A855F7", x: 66, y: 14, size: 34 },
  { Icon: SiVercel, color: "#FFFFFF", x: 63, y: 66, size: 26 },
  { Icon: FaGitAlt, color: "#F05032", x: 82, y: 8, size: 30 },
  { Icon: SiFramer, color: "#EC4899", x: 75, y: 28, size: 26 },
];

const REVEAL_RADIUS = 190;

const Icons = ({ opacity }) => (
  <>
    {TECH.map(({ Icon, color, x, y, size }, i) => (
      <Icon
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          color,
          opacity,
          transform: "translate(-50%, -50%)",
        }}
      />
    ))}
  </>
);

/**
 * Tech logos scattered behind the hero: barely there by default, lit up around
 * the cursor. Two identical layers — a dim base and a bright one revealed
 * through a radial mask that follows the pointer.
 */
export const TechBackdrop = () => {
  const revealRef = useRef(null);
  const frame = useRef(0);

  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;

    // Coarse pointers have no hover, so leave the dim layer as the whole story.
    if (window.matchMedia("(hover: none)").matches) return;

    const section = el.closest("section");
    if (!section) return;

    const setMask = (x, y) => {
      const mask = `radial-gradient(${REVEAL_RADIUS}px circle at ${x}px ${y}px, #000 0%, rgba(0,0,0,0.55) 45%, transparent 72%)`;
      el.style.maskImage = mask;
      el.style.webkitMaskImage = mask;
    };

    const onMove = (e) => {
      // Coalesce to one update per frame; mousemove fires far more often.
      cancelAnimationFrame(frame.current);
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      frame.current = requestAnimationFrame(() => setMask(x, y));
    };

    const onLeave = () => {
      el.style.maskImage = "radial-gradient(0px circle at 50% 50%, #000, transparent)";
      el.style.webkitMaskImage = el.style.maskImage;
    };

    onLeave();
    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(frame.current);
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Icons opacity={0.05} />
      </div>
      <div
        ref={revealRef}
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity duration-300"
      >
        <Icons opacity={0.55} />
      </div>
    </>
  );
};
