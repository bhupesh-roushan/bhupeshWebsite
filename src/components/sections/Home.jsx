import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LuArrowRight,
  LuDownload,
  LuMail,
  LuChevronDown,
  LuMapPin,
} from "react-icons/lu";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import video from "../../assets/video.mp4";
import bhupesh from "../../assets/bhupesh.png";

const NAME = "Bhupesh Roushan";
const ROLES = [
  "Curriculum Engineer @ Masai",
  "Full Stack Developer",
  "GenAI & Automation Builder",
  "MERN Stack Engineer",
];

const SOCIALS = [
  { href: "https://www.linkedin.com/in/roushanb", Icon: FaLinkedin, label: "LinkedIn" },
  { href: "https://github.com/bhupesh-roushan", Icon: FaGithub, label: "GitHub" },
  { href: "https://www.instagram.com/roushanwa", Icon: FaInstagram, label: "Instagram" },
  { href: "https://x.com/roushanwa", Icon: FaXTwitter, label: "X" },
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
      {/* Background video — playsInline is required or iOS refuses to autoplay inline */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src={video} type="video/mp4" />
      </video>

      {/* Legibility + depth over the footage */}
      <div className="absolute inset-0 z-0 bg-black/65" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/85 via-black/45 to-[#0a0a0a]" />
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

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-6 w-fit"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-blue-500 to-pink-500 opacity-70 blur-[6px]" />
            <img
              src={bhupesh}
              alt="Bhupesh Roushan"
              className="relative h-28 w-28 rounded-full object-cover ring-2 ring-white/20 sm:h-32 sm:w-32 md:h-36 md:w-36"
            />
          </div>
        </motion.div>

        {/* Availability */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-300 sm:text-xs"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Open to new opportunities
        </motion.div>

        {/* Name */}
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="text-gray-300">Hi, I&apos;m </span>
          <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
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
            href="https://drive.google.com/file/d/1keKGwBKNUqwGsR6L1PjvGuidGCIvxodd/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10 sm:w-auto"
          >
            <LuDownload className="h-4 w-4" />
            Resume
          </a>
          <a
            href="#contact"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10 sm:w-auto"
          >
            <LuMail className="h-4 w-4" />
            Contact
          </a>
        </motion.div>

        {/* Socials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-8 flex items-center justify-center gap-5"
        >
          {SOCIALS.map(({ href, Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-gray-400 transition-all hover:scale-110 hover:text-white"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
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

        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <LuMapPin className="h-3.5 w-3.5" />
          Bangalore, India
        </p>
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
