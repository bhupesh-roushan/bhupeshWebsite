const LEVEL_COLORS = [
  "rgba(255,255,255,0.06)",
  "#0e4429",
  "#006d32",
  "#26a641",
  "#39d353",
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
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="inline-flex flex-col gap-1">
          <div className="flex gap-[3px]">
            {monthLabels.map((label, i) => (
              <div key={i} className="w-[11px] shrink-0">
                {label && (
                  <span className="text-[9px] leading-none text-gray-500">{label}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={
                      day
                        ? `${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`
                        : undefined
                    }
                    className="h-[11px] w-[11px] rounded-[2px]"
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

      <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] text-gray-500">
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
