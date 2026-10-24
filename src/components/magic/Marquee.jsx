/**
 * Magic UI's Marquee: a row that drifts sideways forever, pausing under the
 * pointer (see .marquee in magic.css).
 *
 * The children are rendered twice — the second copy is `aria-hidden` and hidden
 * outright for anyone who asked for reduced motion — so assistive tech reads
 * each item once, and the loop has no seam. `duration` is seconds for one full
 * lap; a longer row wants a longer duration or it races.
 */
export const Marquee = ({ children, reverse = false, duration = 40, gap = "0.75rem", className = "", ...rest }) => (
  <div
    className={`marquee ${reverse ? "marquee--reverse" : ""} ${className}`}
    style={{ "--marquee-duration": `${duration}s`, "--marquee-gap": gap }}
    {...rest}
  >
    <div className="marquee__track">
      <div className="flex shrink-0 items-center" style={{ gap }}>
        {children}
      </div>
      <div className="marquee__dup flex shrink-0 items-center" style={{ gap }} aria-hidden="true">
        {children}
      </div>
    </div>
  </div>
);
