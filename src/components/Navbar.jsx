import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { m } from "framer-motion";
import { LuLinkedin, LuMenu, LuX, LuCalendarCheck, LuSearch } from "react-icons/lu";
import { hiring } from "../data/hiring";
import { FaGithub, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  // Activity sits between Projects and Contact and had no entry, so the bar
  // held "Projects" through the whole section and then appeared to jump.
  { id: "activity", label: "Activity" },
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
  // Same for /insights: a page of its own, so no section link should look current.
  const onInsights = pathname.startsWith("/insights");
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

  /**
   * Scroll spy, by position rather than intersection.
   *
   * IntersectionObserver cannot describe a stack. Sticky panels overlap, so
   * several sections intersect the same band at once, and the callback only
   * fires on a *change* — scrolling back up over a section that was already
   * intersecting produces no event at all, which is why the bar froze on the
   * way back. Whichever entry happened to fire last also won, so the highlight
   * could land on a section buried under the one you were looking at.
   *
   * What the visitor sees is simply the last panel to have reached the top, so
   * that is what this measures: the final section whose top edge has passed
   * the reference line. Reading positions is O(sections) on a rAF, which for
   * five elements is cheaper than the observer it replaces.
   */
  useEffect(() => {
    if (onWriting || onInsights) return;
    const ids = LINKS.filter((l) => l.id).map((l) => l.id);
    let frame = 0;

    const pick = () => {
      frame = 0;
      // Just below the bar: the line the eye treats as the top of the page.
      const line = 96;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // The last section can be too short to ever reach the line; at the
      // bottom of the page it is unambiguously the one being read.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        current = ids[ids.length - 1];
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(pick);
    };

    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onWriting, onInsights]);

  return (
    <nav
      // Named, because the write-ups carry two more <nav>s (contents, more
      // writing) and landmarks of the same kind must be told apart.
      aria-label="Primary"
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        scrolled
          // Frosted once off the hero: the page shows through, blurred. It
          // was briefly opaque while backdrop-filter was disabled on touch,
          // which is not the look — a solid bar over a moving page reads as
          // a lid rather than as glass.
          ? "border-b border-white/10 bg-page/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      {/* Exactly the sections' content width: they are max-w-6xl (72rem) inside
          their own px-4, so this is 72rem + that padding (74rem) with the same px-4
          inside it. The bar's edges then land on the content's edges. */}
      <div className="mx-auto max-w-[74rem] px-4">
        {/* Links on the left, actions on the right, a plain flex row.
            This was a 1fr / auto / 1fr grid that centred the links between a logo
            and the actions. With the logo gone there is nothing to balance, and the
            grid was worse than useless: the actions are wider than a third of the
            bar, so the right track grew to fit them, squeezed the left one, and
            pushed the "centred" links well off centre — an obvious tilt once the
            logo was no longer there to hide it. Below md the links are not shown
            and `ml-auto` keeps the actions on the right. */}
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Links */}
          <div className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm md:flex lg:gap-1">
            {LINKS.map((link) => {
              // On a writing page the route link is what's current; elsewhere
              // the scroll spy decides.
              const isActive = link.to ? onWriting : !onWriting && !onInsights && active === link.id;
              const cls = `relative rounded-full px-2 py-1.5 text-[13px] transition-colors lg:px-4 lg:text-sm ${
                // gray-300, not 400: over the hero's brightest aurora bands the
                // lighter grey measured 3.4:1 in the dark theme.
                isActive ? "text-white" : "text-gray-300 hover:text-white"
              }`;
              const inner = (
                <>
                  {isActive && (
                    <m.span
                      layoutId="nav-active-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-indigo-500/25 ring-1 ring-indigo-400/40"
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </>
              );
              return link.to ? (
                <Link key={link.to} to={link.to} viewTransition className={cls} aria-current={isActive ? "page" : undefined}>
                  {inner}
                </Link>
              ) : (
                <a key={link.id} href={`/#${link.id}`} className={cls} aria-current={isActive ? "location" : undefined}>
                  {inner}
                </a>
              );
            })}
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-3 lg:gap-4">
            <div className="hidden items-center gap-4 min-[1200px]:flex">
              {SOCIALS.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="tap text-gray-400 transition-all hover:scale-110 hover:text-white"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
              <span className="h-5 w-px bg-white/15" />
            </div>

            {/* Booking CTA. From md up — at 768 the bar is already tight, so
                the clock steps aside for it there and returns at lg. Phones get
                it in the menu instead.

                h-9 on this and on the clock, rather than vertical padding.
                A padded height is whatever the tallest thing inside makes it —
                an icon and one text size here, two text sizes there — so the
                two pills came out 44px and 42px and sat 1px off each other at
                both edges. */}
            {hiring.bookingUrl && (
              <a
                href={hiring.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Book a call"
                className="hidden h-9 w-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-indigo-500 text-xs font-semibold text-white transition-colors hover:bg-indigo-400 md:inline-flex lg:w-auto lg:px-3.5"
              >
                <LuCalendarCheck className="h-3.5 w-3.5" />
                {/* Icon alone from md to lg: with the theme switch added, the
                    label is what no longer fits at 768–1023. */}
                <span className="hidden lg:inline">Book a call</span>
              </a>
            )}

            {/* Clock. From 1200px, not lg: between 1024 and 1200 the links, the
                call button and the clock together are wider than the bar, so the
                clock ran off the edge or squeezed the logo. Never wrapped, either —
                a shrinking pill broke "11:58 pm" across two lines. */}
            <div className="hidden h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 sm:max-md:flex min-[1200px]:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs tabular-nums text-gray-300">{indiaTime}</span>
              {/* gray-300: gray-500 measured 4.01:1 on the page background and
                  gray-400 3.5:1 over the aurora, both under the 4.5 needed at 11px. */}
              <span className="hidden text-[11px] text-gray-300 min-[1200px]:inline">IST</span>
            </div>

            {/* Search / ⌘K. Wide screens only — below 1200px the bar has no
                room for it, and the shortcut still works there. */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-palette"))}
              aria-label="Search the site (Command K)"
              title="Search (⌘K)"
              className="hidden h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-gray-300 transition-colors hover:border-white/30 hover:text-white min-[1200px]:inline-flex"
            >
              <LuSearch className="h-3.5 w-3.5" />
              <kbd className="font-sans text-[10px] text-gray-400">⌘K</kbd>
            </button>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              data-menu-toggle
              className="cursor-pointer rounded-md p-2.5 text-white transition-colors hover:bg-white/10 md:hidden"
            >
              {menuOpen ? <LuX className="h-6 w-6" /> : <LuMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
