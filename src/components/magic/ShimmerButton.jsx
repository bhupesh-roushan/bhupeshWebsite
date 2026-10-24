/**
 * Magic UI's Shimmer Button: a call to action with a band of light that sweeps
 * across it on a loop (see .shimmer-btn in magic.css).
 *
 * Renders an <a> when given an `href` and a <button> otherwise, so the same
 * look serves both "go there" and "do this" without a wrapper element. The
 * gradient is the site's own indigo-to-blue — the same run as the nav pill —
 * and the text stays white in both themes (solid fill, so the light theme's
 * ink-for-white swap must not apply: see the `.from-indigo-500` rule in
 * index.css).
 */
export const ShimmerButton = ({ href, className = "", children, ...rest }) => {
  const cls = `shimmer-btn group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.04] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 ${className}`;
  return href ? (
    <a href={href} className={cls} {...rest}>
      {children}
    </a>
  ) : (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
};
