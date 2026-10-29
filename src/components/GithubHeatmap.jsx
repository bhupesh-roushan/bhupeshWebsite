// Theme tokens, so the greens step the right way on each background: darker is
// "more" on a light page and lighter is "more" on a dark one.
const LEVEL_COLORS = [
  "var(--heat-0)",
  "var(--heat-1)",
  "var(--heat-2)",
  "var(--heat-3)",
  "var(--heat-4)",
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const parseDay = (iso) => new Date(`${iso}T00:00:00`);

/** Bucket a flat list of days into Sunday-started week columns. */
function toWeeks(days) {
  const weeks = [];
  let current = new Array(7).fill(null);

  days.forEach((day) => {
    const dow = parseDay(day.date).getDay();
    current[dow] = day;
    if (dow === 6) {
      weeks.push(current);
      current = new Array(7).fill(null);
    }
  });
  if (current.some(Boolean)) weeks.push(current);
  return weeks;
}

/** Presentational only — the section above owns fetching. */
export const GithubHeatmap = ({ days }) => {
  const weeks = toWeeks(days);
  const total = days.reduce((n, d) => n + d.count, 0);

  // Label a column when its month differs from the column before it.
  const monthLabels = weeks.map((week, i) => {
    const first = week.find(Boolean);
    if (!first || i === 0) return null;
    const month = parseDay(first.date).getMonth();
    const prev = weeks[i - 1]?.find(Boolean);
    if (prev && parseDay(prev.date).getMonth() === month) return null;
    return MONTHS[month];
  });

  return (
    <>
      {/* 53 columns never fit a phone — scroll the grid, not the page. */}
      <div
        className="-mx-1 overflow-x-auto px-1 pb-1"
        // A grid of 371 unlabelled squares means nothing to a screen reader, and
        // the per-day `title`s are mouse-only. The total says what it shows.
        // Focusable so a keyboard can scroll it where it overflows.
        tabIndex={0}
        role="img"
        aria-label={`Contribution calendar for the last year: ${total} contributions.`}
      >
        {/* The squares share the card's width instead of being a fixed 11px, so
            the calendar fills its card the way GitHub's own does — at 11px a
            full year was 740px wide and left the right third of a wide card
            empty. Capped at 19px a column (cell plus gap) so it never balloons,
            and floored at 14px so a phone scrolls sideways rather than
            squeezing the squares into dots. */}
        <div
          className="flex flex-col gap-1"
          style={{ "--cols": weeks.length, minWidth: `calc(${weeks.length} * 14px)`, maxWidth: `calc(${weeks.length} * 19px)` }}
        >
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(var(--cols), minmax(0, 1fr))" }}>
            {monthLabels.map((label, i) => (
              <div key={i} className="min-w-0">
                {label && (
                  <span className="whitespace-nowrap text-[9px] leading-none text-gray-500">{label}</span>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(var(--cols), minmax(0, 1fr))" }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex min-w-0 flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={
                      day
                        ? `${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`
                        : undefined
                    }
                    className="aspect-square w-full rounded-[2px]"
                    style={{
                      backgroundColor: day
                        ? LEVEL_COLORS[day.level] ?? LEVEL_COLORS[0]
                        : "transparent",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] text-gray-500" aria-hidden="true">
        <span>Less</span>
        {LEVEL_COLORS.map((c) => (
          <span
            key={c}
            className="h-[10px] w-[10px] rounded-[2px]"
            style={{ backgroundColor: c }}
          />
        ))}
        <span>More</span>
      </div>
    </>
  );
};
