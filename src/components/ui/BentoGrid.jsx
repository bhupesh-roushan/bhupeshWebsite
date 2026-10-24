import { useRef, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";

/**
 * Aceternity-style bento grid.
 * A 6-column canvas on desktop so tiles can claim varied widths.
 */
export const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Bento tile. Renders as a <button> when `onClick` is supplied so keyboard users
 * get it free.
 *
 * Every tile has the cursor spotlight — Magic UI's Magic Card effect: a soft
 * pool of the card's own accent colour that follows the pointer (or a finger)
 * across the surface. The lead cards add Magic UI's Border Beam — a comet
 * circling the edge — as a child (see Projects and ProjectInsights); it marks
 * importance, not interactivity. A glowing border that chased the cursor was
 * tried and dropped: it said the same thing as the spotlight, less well.
 *
 * `action` is a slot for a link that must live *beside* the tile, not inside it:
 * a clickable tile is a <button>, and an anchor nested in a button is invalid
 * and unreliable to click. It is positioned over the tile's bottom-right corner.
 */
export const BentoCard = ({ className, children, onClick, action, accent = "99,102,241" }) => {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  // "active" rather than "hovered" — it's driven by touch as well.
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
  };

  const handleEnter = () => {
    if (fromTouch()) return;
    setActive(true);
  };

  const endTouch = () => {
    lastTouch.current = Date.now();
    setActive(false);
  };

  // Touch equivalents. Every effect here was hover-driven, so on a phone the
  // cards sat completely inert. Native touch events keep firing through a drag,
  // where pointermove goes quiet as soon as the browser claims the gesture for
  // scrolling.
  const handleTouch = (e) => {
    const t = e.touches[0];
    if (!t) return;
    lastTouch.current = Date.now();
    moveTo(t.clientX, t.clientY);
    setActive(true);
  };

  const Tag = onClick ? "button" : "div";

  return (
    <m.div
      // Driven by state rather than whileHover, so touch raises the card too.
      animate={{ y: active && !reduceMotion ? -4 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn("group relative", className)}
    >
      <Tag
        ref={ref}
        onClick={onClick}
        onMouseMove={handleMove}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setActive(false)}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={endTouch}
        onTouchCancel={endTouch}
        className={cn(
          "relative h-full w-full overflow-hidden rounded-2xl border",
          // Glass: translucent over a blur, on every device. The earlier
          // opaque version was a performance compromise that removed the
          // look entirely — the blur is the point, not a decoration on top
          // of it. /75 rather than the old /03, so the card still reads as a
          // surface if a browser ever declines the filter.
          "bg-surface/75 backdrop-blur-xl text-left",
          "shadow-card transition-colors duration-300",
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
        <div className="relative h-full">{children}</div>
      </Tag>
      {action && <div className="absolute bottom-4 right-4 z-10">{action}</div>}
    </m.div>
  );
};
