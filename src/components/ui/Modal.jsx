import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";

/**
 * Animated detail modal.
 *
 * Rendered through a portal on purpose: the `.reveal` scroll wrapper applies a
 * CSS transform, which would otherwise become the containing block for any
 * `position: fixed` child and pin the overlay inside the section.
 */
export const Modal = ({ open, onClose, label, children }) => {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex justify-center overflow-y-auto p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative z-10 my-auto w-full max-w-3xl rounded-2xl border border-white/15
              bg-[#0b0b12]/95 shadow-[0_0_60px_-12px_rgba(99,102,241,0.5)]"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
