/**
 * Magic UI's Ripple: concentric rings swelling out from behind an element.
 * Absolutely positioned and centred in its parent, which supplies the size the
 * first ring starts from; each further ring is larger and starts later.
 */
export const Ripple = ({ size = 150, rings = 3, gap = 52 }) => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
    {Array.from({ length: rings }, (_, i) => (
      <span
        key={i}
        className="ripple-ring"
        style={{
          width: size + i * gap,
          height: size + i * gap,
          animationDelay: `${i * 0.9}s`,
        }}
      />
    ))}
  </div>
);
