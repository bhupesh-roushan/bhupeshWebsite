import { cn } from "../../lib/utils";
import { useTilt } from "../../hooks/useTilt";

/**
 * The bento card's depth without its grid, for the writing lists.
 *
 * A plain wrapper rather than a variant of BentoCard: those carry a spotlight,
 * an edge highlight and touch bookkeeping that a text link has no use for, and
 * inheriting all of it to get one transform would be the expensive way round.
 */
export const TiltCard = ({ className, children, ...rest }) => {
  const { ref, apply, reset } = useTilt({ max: 4, lift: 8 });

  return (
    <div className="[perspective:1200px]">
      <div
        ref={ref}
        onMouseMove={(e) => apply(e.clientX, e.clientY)}
        onMouseLeave={reset}
        className={cn("will-change-transform", className)}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
};
