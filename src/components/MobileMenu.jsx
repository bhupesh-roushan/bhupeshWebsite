import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { LuCalendarCheck } from "react-icons/lu";
import { hiring } from "../data/hiring";

const LINKS = [
  // Rooted, not bare fragments. On /writing a bare "#about" resolves against
  // that page — which has no sections — so every menu item was inert there.
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/#contact", label: "Contact" },
];

const SOCIALS = [
  { href: "https://www.linkedin.com/in/roushanb", Icon: FaLinkedin, label: "LinkedIn" },
  { href: "https://github.com/bhupesh-roushan", Icon: FaGithub, label: "GitHub" },
  { href: "https://www.instagram.com/roushanwa", Icon: FaInstagram, label: "Instagram" },
  { href: "https://x.com/roushanwa", Icon: FaXTwitter, label: "X" },
];

export const MobileMenu = ({ menuOpen, setMenuOpen }) => {
  return (
    <div
      // z-40 sits under the navbar (z-50) so the toggle button stays clickable.
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-2
        bg-[#0a0a0a]/98 backdrop-blur-xl transition-all duration-300 ease-in-out md:hidden
        ${menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
    >
      {LINKS.map((link, i) => (
        <a
          key={link.href}
          href={link.href}
          onClick={() => setMenuOpen(false)}
          style={{ transitionDelay: menuOpen ? `${i * 60}ms` : "0ms" }}
          className={`my-3 text-2xl font-semibold text-white transition-all duration-300
            hover:text-indigo-400
            ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          {link.label}
        </a>
      ))}

      {/* The navbar's booking button is hidden below md, so it lives here */}
      {hiring.bookingUrl && (
        <a
          href={hiring.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMenuOpen(false)}
          style={{ transitionDelay: menuOpen ? "220ms" : "0ms" }}
          className={`mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300
            ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <LuCalendarCheck className="h-4 w-4" />
          Book a call
        </a>
      )}

      <div
        className={`mt-8 flex items-center gap-6 transition-all duration-300
          ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        style={{ transitionDelay: menuOpen ? "300ms" : "0ms" }}
      >
        {SOCIALS.map(({ href, Icon, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <Icon className="h-6 w-6" />
          </a>
        ))}
      </div>
    </div>
  );
};
