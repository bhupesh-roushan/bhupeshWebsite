import { useState } from "react";
import { RevealOnScroll } from "../RevealOnScroll";
import { BentoGrid, BentoCard } from "../ui/BentoGrid";
import { Modal } from "../ui/Modal";
import { projects } from "../../data/portfolio";
import { LuArrowUpRight, LuKeyRound } from "react-icons/lu";

export const Projects = () => {
  const [activeId, setActiveId] = useState(null);
  const active = projects.find((p) => p.id === activeId) ?? null;

  return (
    <section id="projects" className="min-h-screen py-20">
      <RevealOnScroll>
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">
            Featured Projects
          </h2>
          <p className="mb-10 text-center text-sm text-gray-400">
            Tap a project for the full breakdown and demo credentials.
          </p>

          <BentoGrid className="lg:auto-rows-[15rem]">
            {projects.map((project) => (
              <BentoCard
                key={project.id}
                className={project.span}
                accent={project.accent}
                onClick={() => setActiveId(project.id)}
              >
                <div className="relative flex h-full min-h-[15rem] flex-col justify-end lg:min-h-0">
                  {/* preview */}
                  <img
                    src={project.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* soft wash so the screenshot sits back from the UI */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(11,11,18,0.85) 0%, rgba(11,11,18,0.35) 55%, rgba(11,11,18,0.05) 100%)",
                    }}
                  />

                  {/* label — carries its own scrim, so legibility never depends
                      on how tall the card happens to be */}
                  <div
                    className="relative px-5 pb-5 pt-14"
                    style={{
                      background:
                        "linear-gradient(to top, #0b0b12 0%, #0b0b12 62%, rgba(11,11,18,0) 100%)",
                    }}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
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
                      {project.stack.slice(0, project.featured ? 6 : 3).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.stack.length > (project.featured ? 6 : 3) && (
                        <span className="text-[11px] text-gray-500">
                          +{project.stack.length - (project.featured ? 6 : 3)}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors group-hover:text-white">
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
        onClose={() => setActiveId(null)}
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

              <a
                href={active.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold
                  text-white transition-transform hover:scale-[1.03]"
                style={{
                  backgroundColor: `rgba(${active.accent},0.18)`,
                  border: `1px solid rgba(${active.accent},0.4)`,
                }}
              >
                Visit live site
                <LuArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};
