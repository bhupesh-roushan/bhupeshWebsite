import { useState, lazy, Suspense } from "react";
import { RevealOnScroll } from "../RevealOnScroll";
import { BentoGrid, BentoCard } from "../ui/BentoGrid";
import { Modal } from "../ui/Modal";
import { journey } from "../../data/portfolio";
import { LuArrowUpRight } from "react-icons/lu";
import { skillGroups } from "../../data/skills";
// Below the fold and self-contained, so it has no claim on the first download.
const JdMatcher = lazy(() =>
  import("../JdMatcher").then((m) => ({ default: m.JdMatcher }))
);

/** Inclusive month span, the way LinkedIn counts it: Apr 2025–May 2026 = 1y 2mo. */
function durationLabel(start, end) {
  if (!start) return null;
  const [sy, sm] = start.split("-").map(Number);
  const now = new Date();
  const [ey, em] = end
    ? end.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const months = (ey - sy) * 12 + (em - sm) + 1;
  if (months < 1) return null;

  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? "s" : ""}`);
  return parts.join(" ");
}

const Chip = ({ children }) => (
  <span
    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5
      px-2.5 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:border-white/25 hover:bg-white/10"
  >
    {children}
  </span>
);

export const About = () => {
  const [activeId, setActiveId] = useState(null);
  const active = journey.find((item) => item.id === activeId) ?? null;

  return (
    <section id="about" className="min-h-screen py-20">
      <RevealOnScroll>
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold text-white">About Me</h2>

          {/* ── Journey ───────────────────────────────────────────
              A stack rather than a grid. Five roles in a bento read as five
              unrelated tiles; dealt as a deck they read in the order they
              happened, which is the one thing a career section is for.

              Each card pins 12px lower than the one before, so the deck
              never fully hides what it covers — the edge of every previous
              role stays visible above the current one. */}
          <div className="mx-auto mb-14 max-w-3xl">
            {journey.map((item, i) => (
              <div
                key={item.id}
                className="journey-card"
                style={{ "--i": i, zIndex: i + 1 }}
              >
              <BentoCard
                accent={item.accent}
                onClick={() => setActiveId(item.id)}
              >
                <div className="flex h-full flex-col p-5">
                  {/* Badge only where it tells you something. A job is the
                      default case, so "Work" was just noise next to a role
                      title that already says as much. */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <img src={item.logo} alt="" className={item.logoClass} />
                    {(item.current || item.kind !== "Work") && (
                      <span
                        className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
                        style={{
                          color: `rgb(${item.accent})`,
                          borderColor: `rgba(${item.accent},0.35)`,
                          backgroundColor: `rgba(${item.accent},0.1)`,
                        }}
                      >
                        {item.current ? "Current" : item.kind}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white">{item.company}</h3>
                  <p className="mt-0.5 text-sm font-medium text-gray-300">{item.role}</p>
                  <p className="mt-1 text-xs font-medium" style={{ color: `rgb(${item.accent})` }}>
                    {item.period}
                    {durationLabel(item.start, item.end) && (
                      <span className="text-gray-500">
                        {" · "}
                        {durationLabel(item.start, item.end)}
                      </span>
                    )}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors group-hover:text-white">
                    View details
                    <LuArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </BentoCard>
              </div>
            ))}
          </div>

          {/* ── Technical skills ────────────────────────────────── */}
          <h3 className="mb-6 text-center text-2xl font-bold text-white">
            Technical Skills
          </h3>

          <BentoGrid>
            {skillGroups.map((group) => (
              <BentoCard key={group.title} className={group.span} accent={group.accent}>
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: `rgb(${group.accent})` }}
                    />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                      {group.title}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Chip key={item.name}>
                        <item.Icon
                          className="text-lg shrink-0"
                          style={{ color: item.color }}
                        />
                        {item.name}
                      </Chip>
                    ))}
                  </div>
                </div>
              </BentoCard>
            ))}
          </BentoGrid>

          {/* Directly under the skills it reads from. At the foot of Contact it
              was a tool with its own subject matter sitting three screens away
              from the list it matches against. */}
          <div className="mt-6">
            {/* Holds the space it will fill, so the skills grid above doesn't
                shift when the chunk arrives. */}
            <Suspense fallback={<div className="h-56" />}>
              <JdMatcher />
            </Suspense>
          </div>
        </div>
      </RevealOnScroll>

      {/* ── Detail modal ──────────────────────────────────────── */}
      <Modal
        open={Boolean(active)}
        onClose={() => setActiveId(null)}
        label={active ? `${active.company} details` : undefined}
      >
        {active && (
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center gap-4 pr-10">
              <img src={active.logo} alt="" className={active.logoClass} />
              <div>
                <h3 className="text-xl font-bold text-white">{active.company}</h3>
                <p className="text-sm text-gray-300">
                  {active.role} · {active.location}
                </p>
                <p className="mt-0.5 text-xs font-medium" style={{ color: `rgb(${active.accent})` }}>
                  {active.period}
                </p>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {active.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg border px-2.5 py-1 text-xs font-medium"
                  style={{
                    color: `rgb(${active.accent})`,
                    borderColor: `rgba(${active.accent},0.3)`,
                    backgroundColor: `rgba(${active.accent},0.08)`,
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>

            <ul className="space-y-4">
              {active.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-gray-300">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: `rgb(${active.accent})` }}
                  />
                  {bullet}
                </li>
              ))}
            </ul>

            {/* How the numbers above were arrived at. A percentage with its
                method attached reads as evidence rather than a claim. */}
            {active.metricsNote && (
              <p className="mt-5 border-l-2 border-white/15 pl-3 text-xs italic leading-relaxed text-gray-400">
                {active.metricsNote}
              </p>
            )}

            {active.link && (
              <a
                href={active.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5
                  px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10"
              >
                {active.link.label}
                <LuArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
};
