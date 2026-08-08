import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Pointer-tracked 3D tilt for a card.
 *
 * Writes `transform` straight to the node through a ref rather than through
 * React state: this runs on every pointer move, and a setState per frame would
 * re-render the card's whole subtree — for the projects grid that is seven
 * cards' worth of chips and images, sixty times a second.
 *
 * Coalesced into one requestAnimationFrame, because a pointermove can fire
 * more often than the display refreshes and the extra work is thrown away.
 *
 * `rotate3d` and a small `translateZ` rather than a scale: scaling a card
 * resamples its text, which on a dense grid reads as a blur. Rotation keeps
 * the glyphs on their own pixels.
 */
export function useTilt({ max = 7, lift = 14 } = {}) {
  const ref = useRef(null);
  const frame = useRef(0);
  const reduceMotion = useReducedMotion();

  const apply = useCallback(
    (clientX, clientY) => {
      if (reduceMotion) return;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const node = ref.current;
        const rect = node?.getBoundingClientRect();
        if (!rect || !rect.width) return;

        // -1..1 from the centre, so the card leans away from the pointer the
        // way a physical panel pressed at one corner would.
        const px = (clientX - rect.left) / rect.width - 0.5;
        const py = (clientY - rect.top) / rect.height - 0.5;

        node.style.transform =
          `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) ` +
          `rotateY(${(px * max).toFixed(2)}deg) translateZ(${lift}px)`;
      });
    },
    [max, lift, reduceMotion]
  );

  const reset = useCallback(() => {
    cancelAnimationFrame(frame.current);
    const node = ref.current;
    if (node) node.style.transform = "";
  }, []);

  // A queued frame that lands after unmount would write to a detached node.
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return { ref, apply, reset, reduceMotion };
}
