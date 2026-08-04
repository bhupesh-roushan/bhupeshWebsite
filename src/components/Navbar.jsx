import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import icon from "../assets/logo.svg";
import { LuLinkedin, LuMenu, LuX } from "react-icons/lu";
import { FaGithub, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

const SOCIALS = [
  { href: "https://www.linkedin.com/in/roushanb", Icon: LuLinkedin, label: "LinkedIn" },
  { href: "https://github.com/bhupesh-roushan", Icon: FaGithub, label: "GitHub" },
  { href: "https://www.instagram.com/roushanwa", Icon: FaInstagram, label: "Instagram" },
  { href: "https://x.com/roushanwa", Icon: FaXTwitter, label: "X" },
];

export const Navbar = ({ menuOpen, setMenuOpen }) => {
  const [indiaTime, setIndiaTime] = useState("");
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  useEffect(() => {
    const updateTime = () =>
      setIndiaTime(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Solid bar once we're off the hero, transparent while over it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll spy — the section crossing the upper-middle band wins.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-[#0a0a0a]/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Flex on mobile, grid from md. The links container is display:none
            below md, which drops it out of grid flow entirely — as a grid the
            actions would fall into the middle column and leave a dead 1fr on
            the right. From md up, 1fr/auto/1fr keeps the links optically
            centred however wide the brand or actions get. */}
        <div className="flex h-16 items-center justify-between gap-3 md:grid md:grid-cols-[1fr_auto_1fr]">
          {/* Brand */}
          <a href="#home" className="flex w-fit items-center gap-2 justify-self-start">
            {/* w-auto, not a square box — the mark is 32x48 and would squash */}
            <img src={icon} alt="" className="h-7 w-auto sm:h-8" />
            <span className="font-mono text-sm font-bold text-white sm:text-base">
              bhupesh<span className="text-indigo-500">.blog</span>
            </span>
          </a>

          {/* Links */}
          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm md:flex">
            {LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`relative rounded-full px-3.5 py-1.5 text-sm transition-colors lg:px-4 ${
                  active === link.id ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {active === link.id && (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-indigo-500/25 ring-1 ring-indigo-400/40"
                  />
                )}
                <span className="relative">{link.label}</span>
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-self-end lg:gap-4">
            <div className="hidden items-center gap-4 lg:flex">
              {SOCIALS.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-gray-400 transition-all hover:scale-110 hover:text-white"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
              <span className="h-5 w-px bg-white/15" />
            </div>

            {/* Clock */}
            <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs tabular-nums text-gray-300">{indiaTime}</span>
              <span className="hidden text-[11px] text-gray-500 lg:inline">IST</span>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="cursor-pointer rounded-md p-1.5 text-white transition-colors hover:bg-white/10 md:hidden"
            >
              {menuOpen ? <LuX className="h-6 w-6" /> : <LuMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
