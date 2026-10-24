import { useEffect, lazy, Suspense } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { track } from "@vercel/analytics";
import { logVisitEvent, logVisitPath } from "../../lib/visitLog";
import { RevealOnScroll } from "../RevealOnScroll";
import { BentoGrid, BentoCard } from "../ui/BentoGrid";
import { Modal } from "../ui/Modal";
import { ProjectInsights } from "../ProjectInsights";
import { projects } from "../../data/portfolio";
import {
  LuArrowUpRight,
  LuKeyRound,
  LuUser,
  LuCode,
  LuNetwork,
  LuLock,
  LuBuilding2,
  LuBookOpen,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import { DIAGRAMS } from "../../data/diagrams";
import { accentText } from "../../lib/accent";
import { SectionHeader } from "../ui/SectionHeader";

// Only reachable once a project modal is open, so it has no business being in
// the first download. DIAGRAMS itself stays eager — it's plain data, and the
// card grid needs to know which projects have one.
const ArchitectureDiagram = lazy(() =>
  import("../ArchitectureDiagram").then((m) => ({ default: m.ArchitectureDiagram }))
);

// Hover previews. Pointer-only and motion-respecting: a touch screen has no
// hover to start one, and someone who asked for less motion gets the still.
function playPreview(media, src) {
  const video = media.querySelector("video");
  if (!video || !src || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!video.getAttribute("src")) video.src = src;
  video.play().catch(() => {});
}

function stopPreview(media) {
  const video = media.querySelector("video");
  if (video) video.pause();
}

export const Projects = () => {
  // The open project lives in the URL, not in state, so /projects/cloudwatch
  // is shareable, the back button closes the modal, and a pasted link opens
  // straight onto the right project.
  const { projectId } = useParams();
  const navigate = useNavigate();
  const active = projects.find((p) => p.id === projectId) ?? null;

  // Neighbours, wrapping at both ends. Seven projects is few enough that
  // running off the end and stopping feels like a fault rather than a limit.
  const index = projects.findIndex((p) => p.id === projectId);
  const prev = index >= 0 ? projects[(index - 1 + projects.length) % projects.length] : null;
  const next = index >= 0 ? projects[(index + 1) % projects.length] : null;

  // Which projects actually get opened is the one thing the page can tell you
  // that a CV can't. Vercel Analytics is cookieless and stores no identifiers,
  // so this counts events, not people.
  const open = (id) => {
    track("project_open", { project: id });
    logVisitEvent("project_open", id);
    logVisitPath(`/projects/${id}`);
    navigate(`/projects/${id}`);
  };
  const close = () => navigate("/", { replace: false });

  // Arriving directly on a project URL should land on the section, not at the
  // top of the page behind the modal.
  useEffect(() => {
    if (!active) return;
    document.getElementById("projects")?.scrollIntoView({ block: "start" });
  }, [active]);

  /**
   * Arrow keys move between projects while a modal is open.
   *
   * `replace` rather than push: without it, stepping through five projects
   * buries the page you came from under five history entries, and Back stops
   * meaning "leave the modal".
   *
   * Escape is the Modal's to handle, and this deliberately ignores anything
   * typed into a field — there is none in this modal today, but a shortcut
   * that eats keystrokes is a bad thing to leave lying around.
   */
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
      if (e.key === "ArrowRight" && next) navigate(`/projects/${next.id}`, { replace: true });
      if (e.key === "ArrowLeft" && prev) navigate(`/projects/${prev.id}`, { replace: true });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, next, prev, navigate]);

  return (
    <section id="projects" className="py-20 sm:py-28">
      <RevealOnScroll>
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader index="02" label="Projects" title="Featured Projects">
            Things I&apos;ve built. Open one for the architecture, the numbers and the write-ups.
          </SectionHeader>

          <BentoGrid>
            {projects.map((project) => (
              <BentoCard
                key={project.id}
                className={project.span}
                accent={project.accent}
                onClick={() => open(project.id)}
                // The thing a visitor most wants from a project card, one click
                // from the grid: the running product. It sits beside the tile
                // rather than in it (see BentoCard's `action`).
                action={
                  project.href && (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} — live demo (opens in a new tab)`}
                      onClick={() => {
                        track("live_demo_click", { project: project.id });
                      }}
                      className="inline-flex h-8 items-center gap-1 rounded-full border px-3 text-[11px] font-semibold text-white transition-transform hover:scale-105"
                      style={{
                        backgroundColor: `rgba(${project.accent},0.18)`,
                        borderColor: `rgba(${project.accent},0.45)`,
                      }}
                    >
                      Live demo
                      <LuArrowUpRight className="h-3 w-3" />
                    </a>
                  )
                }
              >
                {/* Preview on top, copy below — the label used to sit over the
                    screenshot, which capped how many chips could fit before
                    they collided with the image. */}
                <div className="flex h-full flex-col">
                  {/* Optional: internal work may have no shippable screenshot,
                      and inventing one would be a picture of a product nobody
                      can open. Those cards start at the title instead. */}
                  {project.image && (
                    <div
                      className="relative h-36 shrink-0 overflow-hidden sm:h-40"
                      onPointerEnter={(e) => playPreview(e.currentTarget, project.video)}
                      onPointerLeave={(e) => stopPreview(e.currentTarget)}
                    >
                      <img
                        src={project.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* A short muted loop, where one has been recorded. Its src is
                          set on first hover rather than in the markup, so a grid
                          of them downloads nothing until someone points at one. */}
                      {project.video && (
                        <video
                          muted
                          loop
                          playsInline
                          preload="none"
                          aria-hidden="true"
                          className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        />
                      )}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, color-mix(in srgb, var(--color-panel) 95%, transparent) 0%, color-mix(in srgb, var(--color-panel) 25%, transparent) 55%, transparent 100%)",
                        }}
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
                      <h3 className="text-lg font-bold text-white">{project.title}</h3>
                      {project.period && (
                        <span className="text-[11px] font-medium text-gray-400">
                          {project.period}
                        </span>
                      )}
                      {project.access && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                          <LuLock className="h-2.5 w-2.5" />
                          Private
                        </span>
                      )}
                    </div>
                    <p
                      className="mb-3 text-xs font-semibold"
                      style={{ color: accentText(project.accent) }}
                    >
                      {project.tagline}
                    </p>

                    {/* Carries the space an absent screenshot would have taken,
                        and says more than the screenshot would have. */}
                    {project.summary && (
                      <p className="mb-3 text-xs leading-relaxed text-gray-400">
                        {project.summary}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center gap-1 pt-4 text-xs font-medium text-gray-500 transition-colors group-hover:text-white">
                      View details
                      <LuArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </BentoCard>
            ))}

            {/* Three tiles that are not projects: the numbers, the stack, a
                write-up to start with. All read from the data above. */}
            <ProjectInsights
              projects={projects}
              onOpenStudy={(id) => {
                track("case_study_open", { study: id });
                logVisitEvent("case_study_open", id);
                navigate(`/writing/${id}`, { viewTransition: true });
              }}
            />
          </BentoGrid>
        </div>
      </RevealOnScroll>

      {/* ── Detail modal ──────────────────────────────────────── */}
      <Modal
        open={Boolean(active)}
        onClose={close}
        label={active ? `${active.title} details` : undefined}
      >
        {active && (
          <div>
            {active.image && (
              <div className="relative overflow-hidden rounded-t-2xl">
                <img src={active.image} alt="" className="max-h-72 w-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-panel to-transparent" />
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="mb-1 flex flex-wrap items-baseline gap-3">
                <h3 className="text-2xl font-bold text-white">{active.title}</h3>
                {active.period && (
                  <span className="text-xs text-gray-400">{active.period}</span>
                )}
              </div>
              <p
                className="mb-5 text-sm font-semibold"
                style={{ color: accentText(active.accent) }}
              >
                {active.tagline}
              </p>

              <div className="mb-5 flex flex-wrap gap-2">
                {active.role && (
                  <p className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">
                    <LuUser className="h-3.5 w-3.5 text-gray-400" />
                    {active.role}
                  </p>
                )}
                {active.org && (
                  <p className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">
                    <LuBuilding2 className="h-3.5 w-3.5 text-gray-400" />
                    {active.org}
                  </p>
                )}
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {active.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border px-2.5 py-1 text-xs font-medium"
                    style={{
                      color: accentText(active.accent),
                      borderColor: `rgba(${active.accent},0.3)`,
                      backgroundColor: `rgba(${active.accent},0.08)`,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* The case in three lines, before the detail. A reader deciding
                  whether this project is worth the next two screens gets the
                  problem, the approach and any recorded numbers up front. */}
              {active.story && (
                <section
                  aria-label="Case study summary"
                  className="mb-7 rounded-xl border p-4 sm:p-5"
                  style={{
                    borderColor: `rgba(${active.accent},0.28)`,
                    backgroundColor: `rgba(${active.accent},0.05)`,
                  }}
                >
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt
                        className="mb-1 text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: accentText(active.accent) }}
                      >
                        The problem
                      </dt>
                      <dd className="text-sm leading-relaxed text-gray-300">{active.story.problem}</dd>
                    </div>
                    <div>
                      <dt
                        className="mb-1 text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: accentText(active.accent) }}
                      >
                        The approach
                      </dt>
                      <dd className="text-sm leading-relaxed text-gray-300">{active.story.approach}</dd>
                    </div>
                  </dl>

                  {active.story.outcome?.length > 0 && (
                    <ul className="mt-4 grid grid-cols-2 gap-2.5 border-t border-white/10 pt-4 sm:grid-cols-3 lg:grid-cols-4">
                      {active.story.outcome.map((o) => (
                        <li key={o.label} className="min-w-0">
                          <span className="block text-xl font-bold text-white">{o.value}</span>
                          <span className="block text-[11px] leading-snug text-gray-400">{o.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

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

              {DIAGRAMS[active.id] && (
                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300">
                    <LuNetwork className="h-3.5 w-3.5" />
                    Architecture
                  </div>
                  {/* Reserves the height it will occupy, so the modal doesn't
                      jump when the chunk lands. */}
                  <Suspense fallback={<div className="h-64" />}>
                    <ArchitectureDiagram id={active.id} />
                  </Suspense>
                </div>
              )}

              {/* Straight to the files that back up the claims above —
                  reviewers rarely go hunting through a repo on their own. */}
              {active.codeLinks?.length > 0 && (
                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300">
                    <LuCode className="h-3.5 w-3.5" />
                    Read the code
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {active.codeLinks.map((c) => (
                      <a
                        key={c.href}
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-gray-300 transition-colors hover:border-white/30 hover:text-white"
                      >
                        {c.label}
                        <LuArrowUpRight className="h-3 w-3 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {active.credentials && (
                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300">
                    <LuKeyRound className="h-3.5 w-3.5" />
                    Demo Credentials
                  </div>
                  <dl className="space-y-1.5">
                    {active.credentials.map((cred) => (
                      <div key={cred.label} className="flex flex-wrap gap-2 text-sm">
                        <dt className="font-semibold text-pink-400">{cred.label}:</dt>
                        <dd className="font-mono text-xs text-gray-300 sm:text-sm">
                          {cred.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* One flex row with a gap, rather than two inline-flex anchors
                  nudged apart by ml-2/mt-6. The margins let the pair drift out
                  of alignment and broke spacing whenever they wrapped. Both
                  buttons share a height and a border width so they match — the
                  accent only changes colour, never the box. */}
              {/* Write-ups, where they exist. Boxed like the code links
                  because they serve the same purpose: proof you can go and
                  read rather than a claim you have to take. */}
              {active.caseStudies?.length > 0 && (
                <div className="mt-6 space-y-2.5">
                  {active.caseStudies.map((cs) => (
                    <Link
                      key={cs.id}
                      to={`/writing/${cs.id}`}
                      onClick={() => {
                        track("case_study_open", { study: cs.id });
                        logVisitEvent("case_study_open", cs.id);
                      }}
                      className="flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-white/[0.06]"
                      style={{
                        borderColor: `rgba(${active.accent},0.3)`,
                        backgroundColor: `rgba(${active.accent},0.06)`,
                      }}
                    >
                      <LuBookOpen
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: accentText(active.accent) }}
                      />
                      <span>
                        <span className="block text-sm font-semibold text-white">
                          {cs.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-gray-400">
                          {cs.blurb}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Says why there is nothing to click, instead of leaving a gap
                  that reads as an omission. */}
              {active.access && (
                <p className="mt-6 flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs leading-relaxed text-gray-400">
                  <LuLock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" />
                  {active.access}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                {active.href && (
                  <a
                    href={active.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
                    style={{
                      backgroundColor: `rgba(${active.accent},0.18)`,
                      borderColor: `rgba(${active.accent},0.4)`,
                    }}
                  >
                    Visit live site
                    <LuArrowUpRight className="h-4 w-4" />
                  </a>
                )}

                {active.repo && (
                  <a
                    href={active.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-semibold text-gray-200 transition-colors hover:border-white/30 hover:text-white"
                  >
                    <LuCode className="h-4 w-4" />
                    Source
                  </a>
                )}
              </div>

              {/* Visible, because a keyboard shortcut nobody can see is a
                  shortcut nobody uses — and these are the only way a mouse
                  user moves between projects without closing the modal. */}
              {prev && next && (
                <nav className="mt-8 flex items-stretch gap-2 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => navigate(`/projects/${prev.id}`, { replace: true })}
                    className="group flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-left transition-colors hover:border-white/25 hover:bg-white/[0.06]"
                  >
                    <LuChevronLeft className="h-4 w-4 shrink-0 text-gray-500 transition-colors group-hover:text-white" />
                    <span className="min-w-0">
                      <span className="block text-[10px] uppercase tracking-wider text-gray-500">
                        Previous
                      </span>
                      <span className="block truncate text-xs font-semibold text-gray-200">
                        {prev.title}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/projects/${next.id}`, { replace: true })}
                    className="group flex flex-1 items-center justify-end gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-right transition-colors hover:border-white/25 hover:bg-white/[0.06]"
                  >
                    <span className="min-w-0">
                      <span className="block text-[10px] uppercase tracking-wider text-gray-500">
                        Next
                      </span>
                      <span className="block truncate text-xs font-semibold text-gray-200">
                        {next.title}
                      </span>
                    </span>
                    <LuChevronRight className="h-4 w-4 shrink-0 text-gray-500 transition-colors group-hover:text-white" />
                  </button>
                </nav>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};
