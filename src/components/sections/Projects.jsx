import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RevealOnScroll } from "../RevealOnScroll";
import { BentoGrid, BentoCard } from "../ui/BentoGrid";
import { Modal } from "../ui/Modal";
import { projects } from "../../data/portfolio";
import { LuArrowUpRight, LuKeyRound, LuUser, LuCode, LuNetwork } from "react-icons/lu";
import { ArchitectureDiagram } from "../ArchitectureDiagram";
import { DIAGRAMS } from "../../data/diagrams";

export const Projects = () => {
  // The open project lives in the URL, not in state, so /projects/cloudwatch
  // is shareable, the back button closes the modal, and a pasted link opens
  // straight onto the right project.
  const { projectId } = useParams();
  const navigate = useNavigate();
  const active = projects.find((p) => p.id === projectId) ?? null;

  const open = (id) => navigate(`/projects/${id}`);
  const close = () => navigate("/", { replace: false });

  // Arriving directly on a project URL should land on the section, not at the
  // top of the page behind the modal.
  useEffect(() => {
    if (!active) return;
    document.getElementById("projects")?.scrollIntoView({ block: "start" });
  }, [active]);

  return (
    <section id="projects" className="min-h-screen py-20">
      <RevealOnScroll>
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold text-white">
            Featured Projects
          </h2>

          <BentoGrid>
            {projects.map((project) => (
              <BentoCard
                key={project.id}
                className={project.span}
                accent={project.accent}
                onClick={() => open(project.id)}
              >
                {/* Preview on top, copy below — the label used to sit over the
                    screenshot, which capped how many chips could fit before
                    they collided with the image. */}
                <div className="flex h-full flex-col">
                  <div className="relative h-36 shrink-0 overflow-hidden sm:h-40">
                    <img
                      src={project.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(11,11,18,0.95) 0%, rgba(11,11,18,0.25) 55%, rgba(11,11,18,0) 100%)",
                      }}
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
                      <h3 className="text-lg font-bold text-white">{project.title}</h3>
                      {project.period && (
                        <span className="text-[11px] font-medium text-gray-400">
                          {project.period}
                        </span>
                      )}
                    </div>
                    <p
                      className="mb-3 text-xs font-semibold"
                      style={{ color: `rgb(${project.accent})` }}
                    >
                      {project.tagline}
                    </p>

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
            <div className="relative overflow-hidden rounded-t-2xl">
              <img src={active.image} alt="" className="max-h-72 w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b12] to-transparent" />
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-1 flex flex-wrap items-baseline gap-3">
                <h3 className="text-2xl font-bold text-white">{active.title}</h3>
                {active.period && (
                  <span className="text-xs text-gray-400">{active.period}</span>
                )}
              </div>
              <p
                className="mb-5 text-sm font-semibold"
                style={{ color: `rgb(${active.accent})` }}
              >
                {active.tagline}
              </p>

              {active.role && (
                <p className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">
                  <LuUser className="h-3.5 w-3.5 text-gray-400" />
                  {active.role}
                </p>
              )}

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

              {DIAGRAMS[active.id] && (
                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300">
                    <LuNetwork className="h-3.5 w-3.5" />
                    Architecture
                  </div>
                  <ArchitectureDiagram id={active.id} />
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
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
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
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};
