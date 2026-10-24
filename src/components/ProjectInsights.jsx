import { useMemo } from "react";
import { LuBookOpen, LuArrowUpRight } from "react-icons/lu";
import { BentoCard } from "./ui/BentoGrid";
import { accentText } from "../lib/accent";
import { NumberTicker } from "./magic/NumberTicker";
import { BorderBeam } from "./magic/BorderBeam";

// Stacks are typed per project, so the same thing is spelled several ways —
// "Express" and "Express.js", "React.js" and "React 19", "Next.js 15" and "16".
// Counting without folding them together would put one framework in the list
// three times and none of them at the top.
const CANON = [
  [/^react(\.js| \d+)?$/i, "React"],
  [/^next\.js( \d+)?$/i, "Next.js"],
  [/^express(\.js)?$/i, "Express"],
  [/^node(\.js)?$/i, "Node.js"],
  [/^tailwind( css)?$/i, "Tailwind CSS"],
  [/^shadcn( ui)?$/i, "shadcn/ui"],
  [/^redux( toolkit)?$/i, "Redux"],
  [/^(google )?gemini( api)?$/i, "Gemini"],
];
const canon = (name) => CANON.find(([re]) => re.test(name))?.[1] ?? name;

/** Technologies ranked by how many projects use them. Computed, never typed. */
function rankStack(projects) {
  const counts = new Map();
  for (const p of projects) {
    // Once per project: a stack that lists React twice is still one project.
    for (const t of new Set(p.stack.map(canon))) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * Three tiles that are not projects, so the grid stops being seven variations
 * of the same screenshot-and-tags card: a big-number tile, a ranked-bars tile
 * and a pull-quote tile. Every figure and every word on them is read from the
 * project data, so none of it can drift from the cards above — or be invented.
 */
export const ProjectInsights = ({ projects, onOpenStudy }) => {
  const stack = useMemo(() => rankStack(projects), [projects]);
  const top = stack.slice(0, 6);
  const max = top[0]?.count ?? 1;

  const writeUps = projects.reduce((n, p) => n + (p.caseStudies?.length ?? 0), 0);
  const live = projects.filter((p) => p.href).length;

  // The write-up worth opening first: the first project that has one.
  const lead = projects.find((p) => p.caseStudies?.length);
  const study = lead?.caseStudies[0];

  const figures = [
    { value: projects.length, label: "projects" },
    { value: live, label: "live to try" },
    { value: writeUps, label: "write-ups" },
    { value: stack.length, label: "technologies" },
  ];

  return (
    <>
      {/* The numbers. Big type and almost nothing else. */}
      <BentoCard className="lg:col-span-2" accent="99,102,241">
        <div className="flex h-full flex-col p-5">
          <p className="eyebrow mb-4">By the numbers</p>
          <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-5">
            {figures.map((f) => (
              <div key={f.label}>
                <dd className="text-4xl font-bold leading-none tracking-tight text-white tabular-nums sm:text-5xl">
                  <NumberTicker value={f.value} />
                </dd>
                <dt className="mt-1.5 text-xs text-gray-400">{f.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </BentoCard>

      {/* What I reach for — bars, because it is a ranking. */}
      <BentoCard className="lg:col-span-2" accent="34,197,94">
        <div className="flex h-full flex-col p-5">
          <p className="eyebrow mb-4">Most used</p>
          <ul className="flex-1 space-y-2.5">
            {top.map((t) => (
              <li key={t.name}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-gray-200">{t.name}</span>
                  <span className="tabular-nums text-gray-400">
                    {t.count} of {projects.length}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full" style={{ background: "var(--viz-track)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(t.count / max) * 100}%`, background: "var(--series-1)" }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </BentoCard>

      {/* Where to start reading, set as a pull-quote. */}
      {study && (
        <BentoCard
          className="lg:col-span-2"
          accent={lead.accent}
          onClick={() => onOpenStudy(study.id)}
        >
          <BorderBeam accent={lead.accent} duration={12} delay={-3} />
          <div className="flex h-full flex-col p-5">
            <p className="eyebrow mb-4 flex items-center gap-1.5">
              <LuBookOpen className="h-3 w-3" />
              Start reading
            </p>
            <p className="text-xl font-bold leading-snug tracking-tight text-white">
              &ldquo;{study.label}&rdquo;
            </p>
            <p className="mt-3 text-xs leading-relaxed text-gray-400">{study.blurb}</p>
            <div
              className="mt-auto flex items-center gap-1 pt-5 text-xs font-semibold"
              style={{ color: accentText(lead.accent) }}
            >
              Read the write-up
              <LuArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </BentoCard>
      )}
    </>
  );
};
