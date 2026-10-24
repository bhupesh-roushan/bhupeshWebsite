import { clsx } from "clsx";

// clsx alone, not clsx + tailwind-merge. The merge step is 27KB of conflict
// tables for a problem none of these call sites has: every caller passes
// classes for different properties (a grid span onto a card, a layout class
// onto a wrapper), so there is never a later class overriding an earlier one.
// If that ever changes, this is the one place to put twMerge back.
export function cn(...inputs) {
  return clsx(inputs);
}
