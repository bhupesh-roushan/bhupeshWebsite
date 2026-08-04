import { useEffect, useState } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import { FaGithub } from "react-icons/fa";

const USER = "bhupesh-roushan";

// Public proxy over GitHub's contribution graph. GitHub's own contribution
// counts live only in the GraphQL API, which requires a token — and a static
// site can't hold one without shipping it in the bundle. This endpoint needs
// no auth, with the tradeoff that it sees public contributions only, so the
// total reads lower than the one on the profile page.
const ENDPOINT = `https://github-contributions-api.jogruber.de/v4/${USER}?y=last`;

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

export const GithubHeatmap = () => {
  const [state, setState] = useState({ status: "loading", days: [], total: 0 });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(ENDPOINT, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Drop future dates so the grid ends at today rather than trailing
        // a run of empty cells.
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const days = (json.contributions ?? []).filter(
          (d) => parseDay(d.date) <= today
        );

        const total =
          typeof json.total?.lastYear === "number"
            ? json.total.lastYear
            : days.reduce((sum, d) => sum + d.count, 0);

        setState({ status: "ready", days, total });
      } catch (err) {
        if (err.name !== "AbortError") setState({ status: "error", days: [], total: 0 });
      }
    })();

    return () => controller.abort();
  }, []);

  // A third-party endpoint can go down; a broken panel is worse than none.
  if (state.status === "error") return null;

  const weeks = toWeeks(state.days);

  // Label a column when its month differs from the column before it.
  const monthLabels = weeks.map((week, i) => {
    const first = week.find(Boolean);
    if (!first) return null;
    const month = parseDay(first.date).getMonth();
    if (i === 0) return null;
    const prev = weeks[i - 1]?.find(Boolean);
    if (prev && parseDay(prev.date).getMonth() === month) return null;
    return MONTHS[month];
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FaGithub className="h-5 w-5 text-white" />
          <div>
            <h4 className="text-sm font-bold text-white">GitHub Activity</h4>
            <p className="text-[11px] text-gray-400">
              {state.status === "loading"
                ? "Loading contributions…"
                : `${state.total} public contributions in the last year`}
            </p>
          </div>
        </div>

        <a
          href={`https://github.com/${USER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-gray-300 transition-colors hover:border-white/30 hover:text-white"
        >
          @{USER}
          <LuArrowUpRight className="h-3 w-3" />
        </a>
      </div>

      {state.status === "loading" ? (
        <div className="h-[108px] animate-pulse rounded-lg bg-white/5" />
      ) : (
        <>
          {/* 53 columns never fit a phone — scroll the grid, not the page. */}
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <div className="inline-flex flex-col gap-1">
              <div className="flex gap-[3px]">
                {monthLabels.map((label, i) => (
                  <div key={i} className="w-[11px] shrink-0">
                    {label && (
                      <span className="text-[9px] leading-none text-gray-500">
                        {label}
                      </span>
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
      )}
    </div>
  );
};
