import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LuArrowLeft, LuShieldCheck, LuDatabase } from "react-icons/lu";
import { NumberTicker } from "../magic/NumberTicker";

const RANGES = [7, 30, 90];
const nf = new Intl.NumberFormat("en");
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const countryName = (() => {
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    return (code) => dn.of(code) ?? code;
  } catch {
    return (code) => code;
  }
})();

/** Round a maximum up to 1, 2 or 5 × 10ⁿ so the axis ticks are clean numbers. */
function niceMax(v) {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

const dayLabel = (iso, opts = { month: "short", day: "numeric" }) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en", { ...opts, timeZone: "UTC" });

/** Headline figure. A tile, not a chart: one number needs no axes. */
const Stat = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
    <p className="mt-1.5 text-3xl font-bold tabular-nums text-white">
      <NumberTicker value={value} />
    </p>
    {hint && <p className="mt-1 text-[11px] leading-snug text-gray-400">{hint}</p>}
  </div>
);

/**
 * Daily views as columns. Plain flex rather than SVG so the labels stay at a
 * real font size on a phone instead of scaling down with a viewBox.
 */
const DailyChart = ({ series }) => {
  const [hover, setHover] = useState(null);
  const max = niceMax(Math.max(0, ...series.map((d) => d.views)));
  const ticks = [max, max / 2, 0];
  const n = series.length;
  const point = hover === null ? null : series[hover];

  return (
    <div className="viz-root">
      <div className="relative flex gap-2" style={{ height: 180 }}>
        {/* Axis values sit in their own column, so no bar ever runs under one. */}
        <div className="flex w-8 flex-col justify-between text-right text-[10px] tabular-nums text-gray-400" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{compact.format(t)}</span>
          ))}
        </div>

        <div className="relative flex-1" onMouseLeave={() => setHover(null)}>
          {/* Hairline, solid, recessive. */}
          {[0, 50, 100].map((p) => (
            <div key={p} className="absolute inset-x-0 h-px" style={{ top: `${p}%`, background: "var(--viz-grid)" }} aria-hidden="true" />
          ))}

          <div className="absolute inset-0 flex items-end" style={{ gap: n > 45 ? 1 : 2 }}>
            {series.map((d, i) => (
              // The whole slot is the hover target, not just the bar — a 4px
              // column is hopeless to aim at, and a zero day should still answer.
              <div
                key={d.date}
                className="flex h-full flex-1 items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onTouchStart={() => setHover(i)}
              >
                <div
                  style={{
                    height: `${(d.views / max) * 100}%`,
                    maxWidth: 24,
                    width: "100%",
                    background: "var(--series-1)",
                    // Rounded at the data end, square on the baseline.
                    borderRadius: "4px 4px 0 0",
                    opacity: hover === null || hover === i ? 1 : 0.45,
                    transition: "opacity 120ms",
                  }}
                />
              </div>
            ))}
          </div>

          {point && (
            <div
              role="status"
              className="pointer-events-none absolute z-10 rounded-lg border border-white/15 bg-[var(--surface-solid)] px-3 py-2 text-xs text-white shadow-lg"
              style={{
                left: `${((hover + 0.5) / n) * 100}%`,
                top: 0,
                transform: `translateX(${hover < n * 0.2 ? "0%" : hover > n * 0.8 ? "-100%" : "-50%"})`,
              }}
            >
              <p className="font-semibold">{dayLabel(point.date, { weekday: "short", month: "short", day: "numeric" })}</p>
              <p className="mt-0.5 tabular-nums text-gray-200">{nf.format(point.views)} views</p>
              <p className="tabular-nums text-gray-300">{nf.format(point.visitors)} visitors</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex justify-between pl-10 text-[10px] text-gray-400" aria-hidden="true">
        <span>{dayLabel(series[0].date)}</span>
        <span>{dayLabel(series[Math.floor(n / 2)].date)}</span>
        <span>{dayLabel(series[n - 1].date)}</span>
      </div>

      {/* The same numbers as text — for a screen reader, and for anyone who
          wants the exact figure rather than a bar's height. */}
      <details className="mt-4 text-xs text-gray-400">
        <summary className="cursor-pointer select-none hover:text-white">View as table</summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-white/10">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[var(--surface-solid)] text-[11px] uppercase tracking-wider text-gray-300">
              <tr><th className="px-3 py-2">Day</th><th className="px-3 py-2 text-right">Views</th><th className="px-3 py-2 text-right">Visitors</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5 tabular-nums">
              {[...series].reverse().map((d) => (
                <tr key={d.date}>
                  <td className="px-3 py-1.5 text-gray-300">{dayLabel(d.date, { year: "numeric", month: "short", day: "numeric" })}</td>
                  <td className="px-3 py-1.5 text-right text-white">{nf.format(d.views)}</td>
                  <td className="px-3 py-1.5 text-right text-white">{nf.format(d.visitors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};

/** A ranked list as horizontal bars. Value at the tip; names in text colour. */
const Ranked = ({ title, rows, format = (s) => s, empty = "Nothing recorded yet." }) => {
  const top = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="viz-root rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-300">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-400">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.name}>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="min-w-0 truncate text-gray-200">{format(r.name)}</span>
                <span className="shrink-0 font-semibold tabular-nums text-white">{nf.format(r.count)}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full" style={{ background: "var(--viz-track)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(r.count / top) * 100}%`, background: "var(--series-1)" }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const Notice = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
    <div className="mb-2 flex items-center gap-2.5 text-sm font-bold text-white">
      <Icon className="h-4 w-4 text-indigo-300" />
      {title}
    </div>
    <div className="space-y-2 text-sm leading-relaxed text-gray-300">{children}</div>
  </div>
);

export const Insights = () => {
  const [days, setDays] = useState(30);
  // "loading" | "ready" | "off" | "error"
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: "loading" });
    fetch(`/api/stats?days=${days}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => setState(d.configured === false ? { status: "off" } : { status: "ready", data: d }))
      .catch((e) => e.name !== "AbortError" && setState({ status: "error" }));
    return () => ctrl.abort();
  }, [days]);

  const data = state.data;
  const empty = useMemo(() => data && data.totals.views === 0 && data.totals.projectOpens === 0, [data]);

  return (
    <section className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:pt-32">
      <Link
        to="/"
        className="mb-10 inline-flex items-center gap-2 text-xs font-medium text-gray-400 transition-colors hover:text-white"
      >
        <LuArrowLeft className="h-3.5 w-3.5" />
        Back to the site
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="title text-white">Insights</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-300">
            What visitors actually do on this site — which projects get opened, what gets read, where
            people arrive from. Totals only, and live.
          </p>
        </div>

        <div role="group" aria-label="Time range" className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDays(r)}
              aria-pressed={days === r}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                days === r ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8" aria-live="polite">
        {state.status === "loading" && (
          <div className="space-y-4" aria-busy="true">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />)}
            </div>
            <div className="h-60 animate-pulse rounded-2xl bg-white/5" />
          </div>
        )}

        {state.status === "off" && (
          <Notice icon={LuDatabase} title="No store is connected yet">
            <p>
              Counting needs somewhere to keep the totals, and none is attached to this deployment, so
              nothing is being recorded and there is nothing to show.
            </p>
            <p className="text-gray-400">
              To switch it on: add the <strong className="text-gray-200">Upstash Redis</strong> integration to
              the Vercel project (Storage → Marketplace). It sets the connection variables itself; redeploy
              and this page fills in as visits arrive.
            </p>
          </Notice>
        )}

        {state.status === "error" && (
          <Notice icon={LuDatabase} title="Couldn't load the numbers">
            <p>The stats service didn&rsquo;t answer. Try again in a moment.</p>
          </Notice>
        )}

        {state.status === "ready" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Page views" value={data.totals.views} hint={`Last ${data.days} days`} />
              <Stat label="Visitor-days" value={data.totals.visitorDays} hint="Distinct visitors each day, added up" />
              <Stat label="Projects opened" value={data.totals.projectOpens} />
              <Stat label="Write-ups opened" value={data.totals.writeUps} />
            </div>

            {empty ? (
              <Notice icon={LuDatabase} title="Counting has started — nothing in this range yet">
                <p>The store is connected and listening. The first visits will appear here within a few minutes.</p>
              </Notice>
            ) : (
              <>
                <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                  <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-300">Views per day</h2>
                  <DailyChart series={data.series} />
                </section>

                <div className="grid gap-5 md:grid-cols-2">
                  <Ranked title="Most-opened projects" rows={data.projects} />
                  <Ranked title="Write-ups opened" rows={data.studies} />
                  <Ranked title="Where visitors come from" rows={data.referrers} empty="Mostly direct visits so far." />
                  <Ranked title="Pages" rows={data.pages} format={(p) => (p === "/" ? "Home" : p)} />
                  <Ranked title="Devices" rows={data.devices} />
                  <Ranked title="Countries" rows={data.countries} format={countryName} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Stat label="Résumé downloads" value={data.totals.resume} />
                  <Stat label="Call-booking clicks" value={data.totals.booking} />
                  <Stat label="Messages sent" value={data.totals.contact} />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-10">
        <Notice icon={LuShieldCheck} title="How this is counted">
          <p>
            No cookies, no fingerprinting, and no IP address or browser string is stored. Each hit adds one
            to a per-day total — a page, a project name, the referring site&rsquo;s host, a device class, a
            country.
          </p>
          <p className="text-gray-400">
            &ldquo;Distinct visitors&rdquo; is a hash of IP and browser mixed with the date, kept only in a
            structure that can estimate a count but cannot list or look anyone up — and since the date is in
            the hash, nobody can be followed from one day to the next. Browsers that send Do Not Track or
            Global Privacy Control aren&rsquo;t counted at all.
          </p>
        </Notice>
      </div>
    </section>
  );
};
