import { useState, useEffect } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LuArrowRight,
  LuDownload,
  LuMail,
  LuChevronDown,
  LuMapPin,
  LuCalendarCheck,
} from "react-icons/lu";
import bhupesh from "../../assets/bhupesh.webp";
import { hiring } from "../../data/hiring";
import { ago, useLastPush } from "../../lib/liveStatus";

const PILL =
  "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-gray-300 backdrop-blur-sm sm:text-xs";

const NAME = "Bhupesh Roushan";
// Kept to a similar length so the centred rotator doesn't visibly jump width
// between lines, and to one noun each — "Builder" sat oddly beside Engineer
// and Developer, and the ampersand read badly at hero size.
const ROLES = [
  "Curriculum Engineer @ Masai",
  "Full Stack Developer",
  "AI Automation Engineer",
  "MERN Stack Developer",
];

const STATS = [
  { value: "3+", label: "Years building" },
  { value: "6", label: "Featured projects" },
  { value: "AI", label: "Focused workflows" },
];

export const Home = () => {
  const lastPush = useLastPush();
  const reduceMotion = useReducedMotion();
  const [roleIndex, setRoleIndex] = useState(0);

  // Role rotator. The one piece of motion kept in the headline: it carries
  // information (four roles in one line) rather than decoration.
  useEffect(() => {
    if (reduceMotion) return;
    const t = setInterval(() => setRoleIndex((i) => (i + 1) % ROLES.length), 2600);
    return () => clearInterval(t);
  }, [reduceMotion]);

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-28"
    >
      {/* Aceternity's Aurora Background. It replaced a 3.9MB looping video —
          the page now paints this on the first frame instead of after a
          multi-megabyte download. It is the hero's one background: the dotted
          grid, the cursor-lit logo field, the pointer parallax and the
          typewriter that used to sit on top of it are gone. Each was fine alone;
          together they made the first screen compete with its own headline. */}
      <div className="aurora z-0" aria-hidden="true">
        <div className="aurora__layer" />
      </div>

      {/* Only 40% at the top. The aurora's mask puts its brightest bands along
          the top edge, which is exactly where this gradient was darkest; the
          bottom fades to the page colour so the hero joins the next section. */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-transparent to-page" />

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        {/* Avatar */}
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-6 w-fit"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-blue-500 to-sky-400 opacity-70 blur-[6px]" />
            <img
              src={bhupesh}
              alt="Bhupesh Roushan"
              className="relative h-28 w-28 rounded-full object-cover ring-2 ring-white/20 sm:h-32 sm:w-32 md:h-36 md:w-36"
            />
          </div>
        </m.div>

        {/* Status row: where, and — when there is something true to say — when
            I'm available and when I last pushed. Every item is a statement of
            fact in the theme's own palette; this slot used to hold a pulsing
            green "Open to new opportunities" pill, which read as asking rather
            than stating. */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-5 flex flex-wrap items-center justify-center gap-2"
        >
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
          {lastPush && (
            <a
              href={`https://github.com/bhupesh-roushan/${lastPush.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Most recent push to a public repository. Most of my work is in private repos, so this undercounts."
              className={`${PILL} transition-colors hover:border-white/30 hover:text-white`}
            >
              {/* Green inside a week, grey after — a dot that is always green
                  would claim activity the date underneath contradicts. */}
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  Date.now() - new Date(lastPush.at) < 7 * 864e5 ? "bg-emerald-400" : "bg-gray-500"
                }`}
              />
              Last public push {ago(lastPush.at)} · {lastPush.repo}
            </a>
          )}
        </m.div>

        {/* Name */}
        <h1 className="display mb-5 font-bold">
          <span className="text-gray-300">Hi, I&apos;m </span>
          {/* Indigo to blue, the same run as the CTA and the nav pill. */}
          <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-sky-300 bg-clip-text text-transparent">
            {NAME}
          </span>
        </h1>

        {/* Rotating role */}
        <div className="mb-5 flex h-7 items-center justify-center sm:h-8">
          <AnimatePresence mode="wait">
            <m.p
              key={roleIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="text-sm font-semibold text-white sm:text-lg md:text-xl"
            >
              {ROLES[roleIndex]}
            </m.p>
          </AnimatePresence>
        </div>

        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto mb-7 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base"
        >
          I build scalable web applications and AI-powered workflows — turning
          complex, manual processes into fast, reliable products people
          actually enjoy using.
        </m.p>

        {/* CTAs — visible at every breakpoint */}
        <m.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap"
        >
          <a
            href="#projects"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.04] sm:w-auto"
          >
            View Projects
            <LuArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="/Bhupesh-Roushan-Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10 sm:w-auto"
          >
            <LuDownload className="h-4 w-4" />
            Resume
          </a>
          {/* Below md only — from md up the navbar exposes Contact directly,
              so this would just duplicate it. */}
          <a
            href="#contact"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10 sm:w-auto md:hidden"
          >
            <LuMail className="h-4 w-4" />
            Contact
          </a>
        </m.div>

        {/* Stats */}
        <m.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mx-auto flex max-w-lg items-stretch justify-center divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
        >
          {STATS.map((s) => (
            <div key={s.label} className="flex-1 px-3 py-3 sm:px-6">
              <div className="text-lg font-bold text-white sm:text-2xl">{s.value}</div>
              <div className="text-[11px] text-gray-400 sm:text-xs">{s.label}</div>
            </div>
          ))}
        </m.div>

      </div>

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
