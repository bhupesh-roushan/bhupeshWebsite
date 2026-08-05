/**
 * Request-flow diagrams, drawn from each repo's real layout rather than an
 * idealised sketch — the route folders, lib/helper wrappers, auth middleware
 * and models that actually exist in the source.
 *
 * Layer-based rather than hand-placed: adding a project is a few lines of data,
 * and every diagram stays on the same grid and spacing.
 */

import { DIAGRAMS } from "../data/diagrams";

const W = 880;
const BORDER = "#2a2a3a";
const SURFACE = "#12121a";
const TEXT = "#e2e8f0";
const MUTED = "#94a3b8";
const ACCENT = "#818cf8";

const BOX_H = 58;
const GAP_Y = 34;
const TOP = 16;

const EDGE = 13; // outer margin, set by the widest row a diagram can hold
const GUTTER = 26;
const INNER = W - EDGE * 2;

/**
 * Every row spans the same left and right edge, splitting the width between
 * however many boxes it holds. A single-box row used to be capped at 300 of
 * 880 units regardless of the space available, so the top of a diagram sat
 * as a third-width stub above full-width columns and read as unfinished.
 *
 * Centres are unchanged by this — only widths grow — so all the connector
 * geometry below still lands where it did.
 */
const layout = (count, i) => {
  const width = (INNER - GUTTER * (count - 1)) / count;
  const x = EDGE + i * (width + GUTTER);
  return { x, width, centre: x + width / 2 };
};

const Box = ({ x, y, w, h, title, sub, accent }) => (
  <g>
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx="10"
      fill={SURFACE}
      stroke={accent ? ACCENT : BORDER}
      strokeWidth={accent ? 1.5 : 1}
    />
    <text
      x={x + w / 2}
      y={sub ? y + h / 2 - 4 : y + h / 2 + 5}
      textAnchor="middle"
      fill={accent ? ACCENT : TEXT}
      fontSize="15"
      fontWeight="600"
    >
      {title}
    </text>
    {sub && (
      <text x={x + w / 2} y={y + h / 2 + 16} textAnchor="middle" fill={MUTED} fontSize="12.5">
        {sub}
      </text>
    )}
  </g>
);

export const ArchitectureDiagram = ({ id }) => {
  const spec = DIAGRAMS[id];
  if (!spec) return null;

  const { layers, store } = spec;
  const rowY = layers.map((_, i) => TOP + i * (BOX_H + GAP_Y));
  const storeY = rowY[rowY.length - 1] + BOX_H + GAP_Y + 6;
  const height = storeY + 34 + 8;
  const marker = `arrow-${id}`;

  return (
    // Scrolls sideways rather than shrinking below a legible size. Squeezed
    // into a phone-width modal the whole 880-unit frame scales to ~0.32, which
    // puts the box labels under 5px — a diagram nobody can read.
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="h-auto w-full min-w-[640px]"
        role="img"
        aria-label={`${id} architecture: ${layers
          .map((l) => l.map((b) => b.title).join(", "))
          .join(" then ")}, persisting to ${store}.`}
      >
        <defs>
          <marker
            id={marker}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={BORDER} />
          </marker>
        </defs>

        {layers.map((row, li) => {
          const y = rowY[li];
          const next = layers[li + 1];
          return (
            <g key={li}>
              {row.map((box, bi) => {
                const { x, width } = layout(row.length, bi);
                return <Box key={bi} x={x} y={y} w={width} h={BOX_H} {...box} />;
              })}

              {next && (
                <g>
                  {/* Fan out through a shared bus when the counts differ, so the
                      lines can't imply a one-to-one mapping that isn't there.
                      It has to span both rows: sized to the lower row alone, a
                      3-into-2 fan left the outer column's connector hanging in
                      space, short of a bus that stopped before it. */}
                  {row.length !== next.length && (
                    <line
                      x1={Math.min(
                        layout(row.length, 0).centre,
                        layout(next.length, 0).centre
                      )}
                      y1={y + BOX_H + GAP_Y / 2}
                      x2={Math.max(
                        layout(row.length, row.length - 1).centre,
                        layout(next.length, next.length - 1).centre
                      )}
                      y2={y + BOX_H + GAP_Y / 2}
                      stroke={BORDER}
                      strokeWidth="1.5"
                    />
                  )}
                  {row.map((_, bi) => (
                    <line
                      key={`d${bi}`}
                      x1={layout(row.length, bi).centre}
                      y1={y + BOX_H}
                      x2={layout(row.length, bi).centre}
                      y2={y + BOX_H + GAP_Y / 2}
                      stroke={BORDER}
                      strokeWidth="1.5"
                    />
                  ))}
                  {next.map((_, bi) => (
                    <line
                      key={`u${bi}`}
                      x1={layout(next.length, bi).centre}
                      y1={y + BOX_H + GAP_Y / 2}
                      x2={layout(next.length, bi).centre}
                      y2={rowY[li + 1] - 2}
                      stroke={BORDER}
                      strokeWidth="1.5"
                      markerEnd={`url(#${marker})`}
                    />
                  ))}
                </g>
              )}
            </g>
          );
        })}

        {/* Persistence collects from every path — a single arrow off the middle
            column would read as "only that one writes to the database". */}
        {(() => {
          const last = layers[layers.length - 1];
          const y = rowY[rowY.length - 1] + BOX_H;
          const busY = y + GAP_Y / 2;
          return (
            <g>
              {last.map((_, bi) => (
                <line
                  key={bi}
                  x1={layout(last.length, bi).centre}
                  y1={y}
                  x2={layout(last.length, bi).centre}
                  y2={busY}
                  stroke={BORDER}
                  strokeWidth="1.5"
                />
              ))}
              <line
                x1={layout(last.length, 0).centre}
                y1={busY}
                x2={layout(last.length, last.length - 1).centre}
                y2={busY}
                stroke={BORDER}
                strokeWidth="1.5"
              />
              <line
                x1={W / 2}
                y1={busY}
                x2={W / 2}
                y2={storeY - 2}
                stroke={BORDER}
                strokeWidth="1.5"
                markerEnd={`url(#${marker})`}
              />
              <Box x={EDGE} y={storeY} w={INNER} h={32} title={store} />
            </g>
          );
        })()}
      </svg>
    </div>
  );
};
