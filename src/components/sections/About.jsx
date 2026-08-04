import { useState } from "react";
import { RevealOnScroll } from "../RevealOnScroll";
import { BentoGrid, BentoCard } from "../ui/BentoGrid";
import { Modal } from "../ui/Modal";
import { journey } from "../../data/portfolio";
import {
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaReact,
  FaNodeJs,
  FaGitAlt,
  FaGithub,
  FaFigma,
} from "react-icons/fa";
import {
  SiRedux,
  SiTailwindcss,
  SiBootstrap,
  SiNextdotjs,
  SiFramer,
  SiExpress,
  SiMongodb,
  SiPostman,
  SiVercel,
  SiRender,
  SiNetlify,
  SiSupabase,
  SiMongoose,
  SiPython,
  SiMysql,
  SiIntellijidea,
  SiTypescript,
  SiDocker,
  SiBlackmagicdesign,
  SiLinux,
  SiThealgorithms,
  SiLangchain,
} from "react-icons/si";
import { GrMysql } from "react-icons/gr";
import { DiVisualstudio } from "react-icons/di";
import { TbApi, TbDatabaseSearch, TbDatabase, TbRobot } from "react-icons/tb";
import { FaJava } from "react-icons/fa6";
import { LiaLaptopCodeSolid } from "react-icons/lia";
import { PiSpinner, PiMagicWandFill } from "react-icons/pi";
import { MdDataObject, MdOutlineSecurity } from "react-icons/md";
import { LuComputer, LuChartNetwork, LuArrowUpRight } from "react-icons/lu";
import { CgWebsite } from "react-icons/cg";

const iconClass = "text-lg shrink-0";

const skillGroups = [
  {
    title: "Frontend",
    span: "lg:col-span-3",
    accent: "56,189,248",
    items: [
      { name: "HTML", icon: <FaHtml5 className={`${iconClass} text-orange-500`} /> },
      { name: "CSS", icon: <FaCss3Alt className={`${iconClass} text-blue-400`} /> },
      { name: "React.js", icon: <FaReact className={`${iconClass} text-blue-500`} /> },
      { name: "Context API", icon: <TbApi className={`${iconClass} text-blue-500`} /> },
      { name: "Redux", icon: <SiRedux className={`${iconClass} text-red-500`} /> },
      { name: "Tailwind CSS", icon: <SiTailwindcss className={`${iconClass} text-cyan-500`} /> },
      { name: "Bootstrap", icon: <SiBootstrap className={`${iconClass} text-purple-500`} /> },
      { name: "Next.js", icon: <SiNextdotjs className={`${iconClass} text-white`} /> },
      { name: "Framer Motion", icon: <SiFramer className={`${iconClass} text-pink-500`} /> },
    ],
  },
  {
    title: "Backend",
    span: "lg:col-span-3",
    accent: "34,197,94",
    items: [
      { name: "Node.js", icon: <FaNodeJs className={`${iconClass} text-green-500`} /> },
      { name: "Express.js", icon: <SiExpress className={`${iconClass} text-yellow-400`} /> },
      { name: "REST APIs", icon: <TbApi className={`${iconClass} text-blue-500`} /> },
      { name: "Supabase (BaaS)", icon: <SiSupabase className={`${iconClass} text-green-500`} /> },
      { name: "JWT Auth", icon: <PiSpinner className={`${iconClass} text-pink-500`} /> },
    ],
  },
  {
    title: "GenAI",
    span: "lg:col-span-4",
    accent: "168,85,247",
    highlight: true,
    items: [
      { name: "LangChain", icon: <SiLangchain className={`${iconClass} text-green-500`} /> },
      { name: "RAG", icon: <TbDatabaseSearch className={`${iconClass} text-cyan-500`} /> },
      { name: "ChromaDB", icon: <TbDatabase className={`${iconClass} text-orange-500`} /> },
      { name: "Embeddings", icon: <LuChartNetwork className={`${iconClass} text-purple-500`} /> },
      { name: "LLM APIs", icon: <TbApi className={`${iconClass} text-blue-500`} /> },
      { name: "Prompt Engineering", icon: <PiMagicWandFill className={`${iconClass} text-pink-500`} /> },
      { name: "AI Agents", icon: <TbRobot className={`${iconClass} text-yellow-500`} /> },
    ],
  },
  {
    title: "Languages",
    span: "lg:col-span-2",
    accent: "249,115,22",
    items: [
      { name: "Java", icon: <FaJava className={`${iconClass} text-red-500`} /> },
      { name: "JavaScript", icon: <FaJs className={`${iconClass} text-yellow-500`} /> },
      { name: "TypeScript", icon: <SiTypescript className={`${iconClass} text-blue-500`} /> },
      { name: "Python", icon: <SiPython className={`${iconClass} text-blue-500`} /> },
      { name: "C", icon: <LiaLaptopCodeSolid className={`${iconClass} text-green-500`} /> },
    ],
  },
  {
    title: "Concepts",
    span: "lg:col-span-4",
    accent: "99,102,241",
    items: [
      { name: "OOPs", icon: <MdDataObject className={`${iconClass} text-green-500`} /> },
      { name: "System Design", icon: <SiBlackmagicdesign className={`${iconClass} text-red-500`} /> },
      { name: "Computer Networks", icon: <LuComputer className={`${iconClass} text-white`} /> },
      { name: "Network Security", icon: <MdOutlineSecurity className={`${iconClass} text-orange-500`} /> },
      { name: "Operating Systems", icon: <SiLinux className={`${iconClass} text-blue-500`} /> },
      { name: "Software Engineering", icon: <CgWebsite className={`${iconClass} text-yellow-500`} /> },
      { name: "DSA", icon: <SiThealgorithms className={`${iconClass} text-cyan-500`} /> },
    ],
  },
  {
    title: "Databases",
    span: "lg:col-span-2",
    accent: "16,185,129",
    items: [
      { name: "MongoDB", icon: <SiMongodb className={`${iconClass} text-green-500`} /> },
      { name: "Mongoose", icon: <SiMongoose className={`${iconClass} text-white`} /> },
      { name: "MySQL", icon: <GrMysql className={`${iconClass} text-blue-500`} /> },
    ],
  },
  {
    title: "Tools & Others",
    span: "lg:col-span-6",
    accent: "236,72,153",
    items: [
      { name: "Git", icon: <FaGitAlt className={`${iconClass} text-red-500`} /> },
      { name: "GitHub", icon: <FaGithub className={`${iconClass} text-white`} /> },
      { name: "Docker", icon: <SiDocker className={`${iconClass} text-blue-500`} /> },
      { name: "VS Code", icon: <DiVisualstudio className={`${iconClass} text-blue-500`} /> },
      { name: "Figma", icon: <FaFigma className={`${iconClass} text-pink-500`} /> },
      { name: "Postman", icon: <SiPostman className={`${iconClass} text-orange-500`} /> },
      { name: "MySQL Workbench", icon: <SiMysql className={`${iconClass} text-blue-500`} /> },
      { name: "IntelliJ IDEA", icon: <SiIntellijidea className={`${iconClass} text-pink-500`} /> },
      { name: "Vercel", icon: <SiVercel className={`${iconClass} text-white`} /> },
      { name: "Render", icon: <SiRender className={`${iconClass} text-white`} /> },
      { name: "Netlify", icon: <SiNetlify className={`${iconClass} text-white`} /> },
    ],
  },
];

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
          <h2 className="mb-2 text-center text-3xl font-bold text-white">About Me</h2>
          <p className="mb-10 text-center text-sm text-gray-400">
            Tap any card to see the full story.
          </p>

          {/* ── Journey ─────────────────────────────────────────── */}
          <BentoGrid className="mb-14">
            {journey.map((item) => (
              <BentoCard
                key={item.id}
                className={item.span}
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

                  <div className="mt-auto flex items-center gap-1 pt-5 text-xs font-medium text-gray-500 transition-colors group-hover:text-white">
                    View details
                    <LuArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </BentoCard>
            ))}
          </BentoGrid>

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
                    {group.highlight && (
                      <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[11px] font-semibold text-purple-300">
                        New
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Chip key={item.name}>
                        {item.icon}
                        {item.name}
                      </Chip>
                    ))}
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
