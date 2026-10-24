/**
 * Magic UI's Aurora Text: lettering filled with a slowly drifting gradient
 * (see .aurora-text in magic.css). Inline, so it sits inside a heading without
 * changing its layout.
 */
export const AuroraText = ({ children, className = "" }) => (
  <span className={`aurora-text ${className}`}>{children}</span>
);
