import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LuArrowRight,
  LuDownload,
  LuMail,
  LuChevronDown,
  LuMapPin,
} from "react-icons/lu";
import { TechBackdrop } from "../TechBackdrop";
import bhupesh from "../../assets/bhupesh.webp";

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
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState(reduceMotion ? NAME : "");
  const [roleIndex, setRoleIndex] = useState(0);

  // Typewriter for the name — quick enough that it never delays the first read.
  useEffect(() => {
    if (reduceMotion) {
      setTyped(NAME);
      return;
    }
    if (typed.length >= NAME.length) return;
    const t = setTimeout(() => setTyped(NAME.slice(0, typed.length + 1)), 65);
    return () => clearTimeout(t);
  }, [typed, reduceMotion]);

  // Role rotator
  useEffect(() => {
    const t = setInterval(() => setRoleIndex((i) => (i + 1) % ROLES.length), 2600);
    return () => clearInterval(t);
  }, []);

  const typingDone = typed.length >= NAME.length;

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24 sm:py-28"
    >
      {/* What the 3.9MB video was: a centred elliptical glow with a twin core,
          black through #020f18 to a #174a6a teal, drifting so slowly that two
          seconds of footage differed by less than one part in 255. All of that
          is three radial gradients and a long keyframe — so it now costs about
          a kilobyte of CSS, paints on the first frame instead of after a
          multi-megabyte download, and looks the same on a phone as on fibre. */}
      <div className="hero-aurora absolute inset-0 z-0" aria-hidden="true">
        <span className="hero-aurora__core" />
        <span className="hero-aurora__halo" />
        <span className="hero-aurora__drift" />
      </div>

      {/* The flat 35% black scrim is gone. It existed to tame bright footage
          we no longer load, and over a backdrop that is already dark by
          construction it just crushed the colour out — measured against the
          original video, the teal fell from 20% of the frame to 11%.
          The vertical gradient stays: it darkens the top and bottom bands
          where the headline and stats sit, which is the part that was ever
          about legibility. */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-transparent to-[#0a0a0a]" />
      <div
        className="absolute inset-0 z-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 10%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 72%)",
        }}
      />

      {/* Tech logos behind the copy, lit up around the cursor */}
      <TechBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        {/* Avatar */}
        <motion.div
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
        </motion.div>

        {/* Location, in the theme's own palette. This slot used to hold a
            pulsing green "Open to new opportunities" pill, which read as
            asking rather than stating. */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-gray-300 backdrop-blur-sm sm:text-xs"
        >
          <LuMapPin className="h-3.5 w-3.5 text-indigo-400" />
          Bangalore, India
        </motion.div>

        {/* Name */}
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="text-gray-300">Hi, I&apos;m </span>
          {/* Indigo to blue, the same run as the CTA and the nav pill. It used
              to end in pink, which matched nothing else on the page. */}
          <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-sky-300 bg-clip-text text-transparent">
            {typed}
          </span>
          {!typingDone && <span className="animate-pulse text-indigo-400">|</span>}
        </h1>

        {/* Rotating role */}
        <div className="mb-5 flex h-7 items-center justify-center sm:h-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={roleIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="text-sm font-semibold text-white sm:text-lg md:text-xl"
            >
              {ROLES[roleIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto mb-7 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base"
        >
          I build scalable web applications and AI-powered workflows — turning
          complex, manual processes into fast, reliable products people
          actually enjoy using.
        </motion.p>

        {/* CTAs — visible at every breakpoint */}
        <motion.div
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
        </motion.div>

        {/* Stats */}
        <motion.div
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
        </motion.div>

      </div>

      {/* Scroll cue */}
      <motion.a
        href="#about"
        aria-label="Scroll to About"
        animate={reduceMotion ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 text-gray-400 transition-colors hover:text-white sm:block"
      >
        <LuChevronDown className="h-6 w-6" />
      </motion.a>
    </section>
  );
};
