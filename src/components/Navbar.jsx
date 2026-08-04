import { useEffect, useState } from "react";
import icon from "../assets/icon.svg";
import { LuLinkedin, LuMenu, LuX } from "react-icons/lu";
import { FaGithub, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

const SOCIALS = [
  { href: "https://www.linkedin.com/in/roushanb", Icon: LuLinkedin, label: "LinkedIn", className: "text-blue-500" },
  { href: "https://github.com/bhupesh-roushan", Icon: FaGithub, label: "GitHub" },
  { href: "https://www.instagram.com/roushanwa", Icon: FaInstagram, label: "Instagram" },
  { href: "https://x.com/roushanwa", Icon: FaXTwitter, label: "X" },
];

export const Navbar = ({ menuOpen, setMenuOpen }) => {
  const [indiaTime, setIndiaTime] = useState("");

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

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/80 shadow-lg backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Brand */}
          <a href="#home" className="flex shrink-0 items-center gap-2">
            <img src={icon} alt="" className="h-8 w-8 sm:h-10 sm:w-10" />
            <span className="font-mono text-sm font-bold text-white sm:text-lg">
              Bhupesh<span className="text-indigo-500">.website</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-white transition-colors hover:text-indigo-400 lg:text-base"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            {/* Socials — only once there's room for them */}
            <div className="hidden items-center gap-4 lg:flex">
              {SOCIALS.map(({ href, Icon, label, className }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`transition-all hover:scale-110 ${className ?? "text-white"}`}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            <p className="hidden text-xs tabular-nums text-gray-300 sm:block lg:text-sm">
              {indiaTime}
            </p>

            {/* Mobile menu trigger */}
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
