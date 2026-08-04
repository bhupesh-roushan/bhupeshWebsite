import { useRef, useState } from "react";
import { motion } from "framer-motion";
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
 * Bento tile with a cursor-tracking spotlight and a hover glow border.
 * Renders as a <button> when `onClick` is supplied so keyboard users get it free.
 */
export const BentoCard = ({ className, children, onClick, accent = "99,102,241" }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const Tag = onClick ? "button" : "div";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn("group relative", className)}
    >
      <Tag
        ref={ref}
        onClick={onClick}
        onMouseMove={handleMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative h-full w-full overflow-hidden rounded-2xl border border-white/10",
          "bg-white/[0.03] backdrop-blur-sm text-left",
          "transition-colors duration-300 hover:border-white/20",
          onClick && "cursor-pointer"
        )}
      >
        {/* cursor spotlight */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(340px circle at ${pos.x}px ${pos.y}px, rgba(${accent},0.16), transparent 70%)`,
          }}
        />
        {/* top edge highlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${accent},0.9), transparent)`,
          }}
        />
        <div className="relative h-full">{children}</div>
      </Tag>
    </motion.div>
  );
};
