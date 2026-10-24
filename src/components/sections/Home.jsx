import { useState, useEffect, useMemo } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LuArrowRight,
  LuDownload,
  LuMail,
  LuChevronDown,
  LuMapPin,
  LuCalendarCheck,
  LuBriefcase,
  LuGitCommitHorizontal,
} from "react-icons/lu";
import bhupesh from "../../assets/bhupesh.webp";
import { hiring } from "../../data/hiring";
import { ago, useLastPush } from "../../lib/liveStatus";
import { BentoGrid, BentoCard } from "../ui/BentoGrid";
import { AuroraText } from "../magic/AuroraText";
import { ShimmerButton } from "../magic/ShimmerButton";
import { NumberTicker } from "../magic/NumberTicker";
import { BorderBeam } from "../magic/BorderBeam";
import { heroRoles } from "../../lib/roleFit";
import { useRole } from "../../hooks/useRole";

const PILL =
  "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-gray-300 sm:text-xs";

const NAME = "Bhupesh Roushan";
// Kept to a similar length so the rotator doesn't visibly jump width between
// lines, and to one noun each — "Builder" sat oddly beside Engineer and
// Developer, and the ampersand read badly at hero size.
const ROLES = [
  "Curriculum Engineer @ Masai",
  "Full Stack Developer",
  "AI Automation Engineer",
  "MERN Stack Developer",
];

const STATS = [
  { value: 3, suffix: "+", label: "Years building" },
  // Seven in the grid below. This said six after the seventh was added, and
  // nothing flagged it: a hand-typed count drifts the moment the list changes.
  { value: 7, label: "Featured projects" },
  { text: "AI", label: "Focused workflows" },
];

// The first role in the list is the current job: "Curriculum Engineer @ Masai".
const [CURRENT_TITLE, CURRENT_ORG] = ROLES[0].split(" @ ");

/** Tiles arrive one after another, a short beat apart, rising a few pixels. */
const rise = (i) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.08 + i * 0.09, duration: 0.5, ease: "easeOut" },
});

export const Home = () => {
  const lastPush = useLastPush();
  const reduceMotion = useReducedMotion();
  const [roleIndex, setRoleIndex] = useState(0);
  // In a role view (?role=) that role leads the rotation; otherwise ROLES as is.
  const { role } = useRole();
  const roles = useMemo(() => heroRoles(ROLES, role), [role]);
  useEffect(() => setRoleIndex(0), [role]);

  // Role rotator. The one piece of motion kept in the headline: it carries
  // information (four roles in one line) rather than decoration.
  useEffect(() => {
    if (reduceMotion) return;
    const t = setInterval(() => setRoleIndex((i) => (i + 1) % roles.length), 2600);
    return () => clearInterval(t);
  }, [reduceMotion, roles.length]);

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-28"
    >
      {/* Aceternity's Aurora Background. It replaced a 3.9MB looping video —
          the page now paints this on the first frame instead of after a
          multi-megabyte download. It is the hero's one background. */}
      <div className="aurora z-0" aria-hidden="true">
        <div className="aurora__layer" />
      </div>

      {/* Only 40% at the top. The aurora's mask puts its brightest bands along
          the top edge, which is exactly where this gradient was darkest; the
          bottom fades to the page colour so the hero joins the next section. */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-transparent to-page" />

      {/* The hero as a bento grid — the same language as every section below it,
          instead of a centred stack that looked like nothing else on the page.
          One headline tile, one photo, and three small tiles that answer the
          first three questions a visitor has: how long, doing what now, open to
          what. Everything in them is read from data already on the site. */}
      <BentoGrid className="relative z-10 mx-auto w-full max-w-6xl">
        {/* ── Headline ──────────────────────────────────────────── */}
        <m.div {...rise(0)} className="lg:col-span-6">
          <BentoCard className="h-full" accent="99,102,241">
            {/* The lead tile wears the comet, like the cards that matter most
                further down. */}
            <BorderBeam accent="99,102,241" duration={12} />
            {/* Words on the left, the portrait on the right: one tile, not two. On a
                phone the portrait comes first and small, so it does not cost a
                screen of scrolling. */}
            <div className="grid h-full items-center gap-6 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14 lg:px-12">
              <div className="relative z-10 flex flex-col justify-center">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className={PILL}>
                  <LuMapPin className="h-3.5 w-3.5 text-indigo-400" />
                  Bangalore, India
                </span>
                {hiring.availability && (
                  <span className={PILL}>
                    <LuCalendarCheck className="h-3.5 w-3.5 text-emerald-400" />
                    {hiring.availability}
                  </span>
                )}
              </div>

              <h1 className="mb-4 font-bold leading-[1.02] tracking-tight">
                <span className="block text-[clamp(1.1rem,0.9rem+1vw,1.6rem)] font-medium text-gray-300">
                  Hi, I&apos;m
                </span>
                <span className="block text-[clamp(2.4rem,1.2rem+4.6vw,4.4rem)]">
                  <AuroraText>{NAME}</AuroraText>
                </span>
              </h1>

              {/* Rotating role */}
              <div className="mb-4 flex h-7 items-center sm:h-8">
                <AnimatePresence mode="wait">
                  <m.p
                    key={roleIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="text-base font-semibold text-white sm:text-lg md:text-xl"
                  >
                    {roles[roleIndex % roles.length]}
                  </m.p>
                </AnimatePresence>
              </div>

              <p className="mb-7 max-w-xl text-sm leading-relaxed text-gray-300 sm:text-base">
                I build scalable web applications and AI-powered workflows — turning
                complex, manual processes into fast, reliable products people
                actually enjoy using.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ShimmerButton href="#projects" className="w-full sm:w-auto">
                  View Projects
                  <LuArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </ShimmerButton>
                <a
                  href="/Bhupesh-Roushan-Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/10 sm:w-auto"
                >
                  <LuDownload className="h-4 w-4" />
                  Resume
                </a>
                {/* Below md only — from md up the navbar exposes Contact directly,
                    so this would just duplicate it. */}
                <a
                  href="#contact"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/10 sm:w-auto md:hidden"
                >
                  <LuMail className="h-4 w-4" />
                  Contact
                </a>
              </div>
              </div>

              <div className="relative order-first shrink-0 lg:order-last">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-blue-500 to-sky-400 opacity-70 blur-[6px]" />
                <img
                  src={bhupesh}
                  alt="Bhupesh Roushan"
                  className="relative h-20 w-20 rounded-full object-cover ring-2 ring-white/20 sm:h-24 sm:w-24 lg:h-60 lg:w-60"
                />
              </div>
            </div>
          </BentoCard>
        </m.div>

        {/* ── How long ──────────────────────────────────────────── */}
        <m.div {...rise(1)} className="lg:col-span-2">
          <BentoCard className="h-full" accent="168,85,247">
            <div className="flex h-full flex-col p-5">
              <p className="eyebrow mb-4">By the numbers</p>
              <dl className="grid flex-1 grid-cols-3 gap-2">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <dd className="text-2xl font-bold leading-none text-white sm:text-3xl">
                      {s.text ?? (
                        <>
                          <NumberTicker value={s.value} />
                          {s.suffix}
                        </>
                      )}
                    </dd>
                    <dt className="mt-1.5 text-[11px] leading-snug text-gray-400">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </BentoCard>
        </m.div>

        {/* ── Right now ─────────────────────────────────────────── */}
        <m.div {...rise(2)} className="lg:col-span-2">
          <BentoCard className="h-full" accent="45,212,191">
            <div className="flex h-full flex-col p-5">
              <p className="eyebrow mb-4">Right now</p>
              <p className="text-lg font-bold leading-tight text-white">{CURRENT_TITLE}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-300">
                <LuBriefcase className="h-3.5 w-3.5 text-gray-400" />
                {CURRENT_ORG}
              </p>
              {/* Only when GitHub answered: a status that can't be fetched
                  disappears rather than showing a broken line. */}
              {lastPush && (
                <a
                  href={`https://github.com/bhupesh-roushan/${lastPush.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Most recent push to a public repository. Most of my work is in private repos, so this undercounts."
                  className="mt-auto flex items-start gap-2 pt-4 text-xs text-gray-400 transition-colors hover:text-white"
                >
                  <LuGitCommitHorizontal className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Last public push {ago(lastPush.at)}
                    <span className="block truncate text-gray-500">{lastPush.repo}</span>
                  </span>
                </a>
              )}
            </div>
          </BentoCard>
        </m.div>

        {/* ── Open to ───────────────────────────────────────────── */}
        <m.div {...rise(3)} className="md:col-span-2 lg:col-span-2">
          <BentoCard className="h-full" accent="236,72,153">
            <div className="flex h-full flex-col p-5">
              <p className="eyebrow mb-4">Open to</p>
              <ul className="flex flex-wrap gap-1.5">
                {hiring.openTo.map((role) => (
                  <li
                    key={role}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-gray-200"
                  >
                    {role}
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-4 text-xs text-gray-400">{hiring.workMode}</p>
            </div>
          </BentoCard>
        </m.div>
      </BentoGrid>

      {/* Scroll cue — still, now. It used to bounce forever, which is movement
          at the edge of the eye on the one screen meant to be read. */}
      <a
        href="#about"
        aria-label="Scroll to About"
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 text-gray-400 transition-colors hover:text-white sm:block"
      >
        <LuChevronDown className="h-6 w-6" />
      </a>
    </section>
  );
};
