/**
 * Magic UI's Border Beam: a comet of light circling a card's border.
 *
 * Reserved for the cards that matter most — the two featured projects and the
 * "start reading" tile. A beam on every card is a grid that never sits still,
 * and one that only the lead cards wear says which they are.
 *
 * Put it inside a `position: relative` element with its own border radius.
 * `radius` has to match that radius in pixels, because the motion path (see
 * .border-beam in magic.css) is drawn in pixels, not inherited; the comet would
 * otherwise cut the corners. The ring carries the radius itself too, since its
 * parent here is a plain wrapper and the mask would otherwise square the corners.
 *
 * `accent` is the card's "r,g,b", so the beam is the card's colour fading into
 * the site's sky blue. `delay` (seconds, negative to start mid-lap) staggers
 * several beams so they never move in step.
 */
export const BorderBeam = ({ accent = "99,102,241", size = 70, duration = 9, delay = 0, radius = 16, width = 1.5 }) => (
  <div
    aria-hidden="true"
    className="border-beam"
    style={{
      "--beam-from": `rgb(${accent})`,
      "--beam-to": "#38bdf8",
      "--beam-size": `${size}px`,
      "--beam-duration": `${duration}s`,
      "--beam-delay": `${delay}s`,
      "--beam-radius": `${radius}px`,
      "--beam-width": `${width}px`,
      borderRadius: radius,
    }}
  />
);
