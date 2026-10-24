import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { IoClose } from "react-icons/io5";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Animated detail modal.
 *
 * Rendered through a portal on purpose: the `.reveal` scroll wrapper applies a
 * CSS transform, which would otherwise become the containing block for any
 * `position: fixed` child and pin the overlay inside the section.
 */
export const Modal = ({ open, onClose, label, children }) => {
  const panelRef = useRef(null);
  const reduceMotion = useReducedMotion();
  // Callers pass a fresh onClose on every render. Left in the effect's
  // dependencies it re-ran the whole open sequence each time — returning focus
  // to the page behind, then pulling it back to the close button — whenever the
  // parent re-rendered, which stepping between projects does. Read through a
  // ref, the effect depends on `open` alone.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    // Remember where focus came from so it can go back on close — otherwise a
    // keyboard user is dumped at the top of the document.
    const opener = document.activeElement;

    const onKey = (e) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      // Trap Tab inside the panel. Without this you tab straight out of the
      // dialog and onto the page behind it, which is still scrolled-locked and
      // visually covered — you're navigating something you can't see.
      const items = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus in, so the first Tab lands inside rather than in the page.
    const id = requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector(FOCUSABLE) ?? panelRef.current;
      target?.focus();
    });

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* The scrim is a sibling of the scroller, not a child of it. The
              scroller needs `perspective` for the tilt, and perspective makes
              it the containing block for fixed descendants — so a scrim inside
              it scrolled away with the panel, and past one screen of scrolling
              the page behind went sharp again. */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

          <div
            className="absolute inset-0 flex justify-center overflow-y-auto p-4 sm:p-8 [perspective:1200px]"
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <m.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={label}
              tabIndex={-1}
              // Comes in tilted and settles flat, so it reads as rising out of
              // the page rather than growing on top of it. rotateX only — adding
              // Y makes a full-width panel look like it is swinging on a hinge.
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateX: 12, y: 40, scale: 0.97 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateX: 6, y: 16, scale: 0.98 }}
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : { type: "spring", stiffness: 260, damping: 26 }
              }
              style={{ transformOrigin: "50% 0%" }}
              // Translucent over its own blur, so the page behind reads as
              // frosted rather than either sharp or hidden. The blur is what
              // makes this legible at /80 — without one it would be the
              // see-through panel this replaced.
              className="relative z-10 my-auto w-full max-w-3xl rounded-2xl border border-white/15
                bg-panel/80 backdrop-blur-2xl shadow-[0_0_60px_-12px_rgba(99,102,241,0.5)]"
            >
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/40 p-2
                  text-gray-300 transition-colors hover:border-white/30 hover:text-white cursor-pointer"
              >
                <IoClose className="h-5 w-5" />
              </button>

              {children}
            </m.div>
          </div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
