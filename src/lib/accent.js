/**
 * An accent colour, safe to use as *text*.
 *
 * Each project and role carries a bright accent ("45,212,191" teal, "241,224,90"
 * yellow) chosen to glow on near-black. As a fill or a tinted border that works
 * on any background; as the colour of a label it fails on white — pale yellow
 * text on a pale page is unreadable. So text uses this: the accent mixed with
 * black by the theme's --accent-ink, which is 100% in dark (the accent exactly
 * as written) and about half in light (the same hue, deep enough to read).
 *
 * Takes the "r,g,b" string the data already stores.
 */
export const accentText = (rgb) =>
  `color-mix(in srgb, rgb(${rgb}) var(--accent-ink, 100%), black)`;
