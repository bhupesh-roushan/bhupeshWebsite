import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useTilt } from "../../hooks/useTilt";

/**
 * Aceternity-style bento grid.
 * A 6-column canvas on desktop so tiles can claim varied widths.
 */
export const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4",
        // The shared 3D space. Perspective has to live on the parent — set on
        // each card instead, every card gets its own vanishing point and the
        // grid tilts like a sheet of unrelated panels rather than one surface.
        "[perspective:1400px]",
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Bento tile with a cursor-tracking spotlight and a hover glow border.
 * Renders as a <button> when `onClick` is supplied so keyboard users get it free.
 */
export const BentoCard = ({ className, children, onClick, accent = "99,102,241" }) => {
  const reduceMotion = useReducedMotion();
  const { ref: tiltRef, apply: tilt, reset: untilt } = useTilt({ max: 6, lift: 12 });
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  // "active" rather than "hovered" — it's now driven by touch as well.
  const [active, setActive] = useState(false);

  const moveTo = (clientX, clientY) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: clientX - rect.left, y: clientY - rect.top });
  };

  // After a tap the browser replays synthetic mouseenter/mousemove on the
  // touched element for compatibility. Without this guard those fire straight
  // after touchend and switch the card back on, so it never released.
  const lastTouch = useRef(0);
  const fromTouch = () => Date.now() - lastTouch.current < 700;

  const handleMove = (e) => {
    if (fromTouch()) return;
    moveTo(e.clientX, e.clientY);
    tilt(e.clientX, e.clientY);
  };

  const handleEnter = () => {
    if (fromTouch()) return;
    setActive(true);
  };

  const endTouch = () => {
    lastTouch.current = Date.now();
    setActive(false);
    untilt();
  };

  // Touch equivalents. Every effect here was hover-driven, so on a phone the
  // cards sat completely inert — no spotlight, no edge glow, no lift. Native
  // touch events keep firing through a drag, where pointermove goes quiet as
  // soon as the browser claims the gesture for scrolling.
  const handleTouch = (e) => {
    const t = e.touches[0];
    if (!t) return;
    lastTouch.current = Date.now();
    moveTo(t.clientX, t.clientY);
    tilt(t.clientX, t.clientY);
    setActive(true);
  };

  const Tag = onClick ? "button" : "div";

  return (
    <motion.div
      // Driven by state rather than whileHover, so touch raises the card too.
      animate={{ y: active && !reduceMotion ? -4 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn("group relative [transform-style:preserve-3d]", className)}
    >
      <Tag
        ref={(node) => {
          ref.current = node;
          tiltRef.current = node;
        }}
        onClick={onClick}
        onMouseMove={handleMove}
        onMouseEnter={handleEnter}
        onMouseLeave={() => {
          setActive(false);
          untilt();
        }}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={endTouch}
        onTouchCancel={endTouch}
        className={cn(
          "relative h-full w-full overflow-hidden rounded-2xl border",
          "bg-white/[0.03] backdrop-blur-sm text-left",
          // Transform is written per-frame by the tilt hook, so it must not be
          // in the transition list — animating it would fight the pointer and
          // lag a frame behind it. Colour still eases.
          "transition-colors duration-300 will-change-transform",
          active ? "border-white/20" : "border-white/10",
          onClick && "cursor-pointer"
        )}
      >
        {/* spotlight — follows cursor or finger */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: active ? 1 : 0,
            background: `radial-gradient(340px circle at ${pos.x}px ${pos.y}px, rgba(${accent},0.16), transparent 70%)`,
          }}
        />
        {/* top edge highlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300"
          style={{
            opacity: active ? 1 : 0,
            background: `linear-gradient(90deg, transparent, rgba(${accent},0.9), transparent)`,
          }}
        />
        <div className="relative h-full [transform:translateZ(28px)] [transform-style:preserve-3d]">
          {children}
        </div>
      </Tag>
    </motion.div>
  );
};
