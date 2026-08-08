import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import icon from "../assets/logo.svg";
import { LuLinkedin, LuMenu, LuX, LuCalendarCheck } from "react-icons/lu";
import { hiring } from "../data/hiring";
import { FaGithub, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  // A route, not a section, so it needs a Link rather than a hash anchor —
  // and `to` is what marks it as such below.
  { to: "/writing", label: "Writing" },
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
  // The scroll spy watches section ids, and the writing pages have none — so
  // "home" stayed selected there and the pill sat on the wrong link the whole
  // time you were reading.
  const { pathname } = useLocation();
  const onWriting = pathname.startsWith("/writing");
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
          {/* A route, not an anchor. As href="#home" this resolved against the
              current page, so on /writing the logo pointed at /writing#home —
              a link to nowhere, on the one element everyone expects to be a
              way home. */}
          <Link to="/" className="flex w-fit items-center gap-2 justify-self-start">
            {/* w-auto, not a square box — the mark is 32x48 and would squash */}
            {/* Dimensions declared so the row cannot reflow once the logo loads. */}
            <img src={icon} alt="" width="32" height="32" className="h-7 w-auto sm:h-8" />
            <span className="font-mono text-sm font-bold text-white sm:text-base">
              bhupesh<span className="text-indigo-500">.blog</span>
            </span>
          </Link>

          {/* Links */}
          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm md:flex">
            {LINKS.map((link) => {
              // On a writing page the route link is what's current; elsewhere
              // the scroll spy decides.
              const isActive = link.to ? onWriting : !onWriting && active === link.id;
              const cls = `relative rounded-full px-3.5 py-1.5 text-sm transition-colors lg:px-4 ${
                isActive ? "text-white" : "text-gray-400 hover:text-white"
              }`;
              const inner = (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-indigo-500/25 ring-1 ring-indigo-400/40"
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </>
              );
              return link.to ? (
                <Link key={link.to} to={link.to} className={cls}>
                  {inner}
                </Link>
              ) : (
                <a key={link.id} href={`/#${link.id}`} className={cls}>
                  {inner}
                </a>
              );
            })}
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

            {/* Booking CTA. From md up — at 768 the bar is already tight, so
                the clock steps aside for it there and returns at lg. Phones get
                it in the menu instead. */}
            {hiring.bookingUrl && (
              <a
                href={hiring.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-full bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-400 md:inline-flex"
              >
                <LuCalendarCheck className="h-3.5 w-3.5" />
                Book a call
              </a>
            )}

            {/* Clock */}
            <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 sm:flex md:hidden lg:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs tabular-nums text-gray-300">{indiaTime}</span>
              {/* gray-400: gray-500 measures 4.01:1 on the page background, under the
                  4.5 needed at 11px. */}
              <span className="hidden text-[11px] text-gray-400 lg:inline">IST</span>
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
