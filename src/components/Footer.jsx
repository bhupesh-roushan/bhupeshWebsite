import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const SOCIALS = [
  { href: "https://www.linkedin.com/in/roushanb", Icon: FaLinkedin, label: "LinkedIn" },
  { href: "https://github.com/bhupesh-roushan", Icon: FaGithub, label: "GitHub" },
  { href: "https://www.instagram.com/roushanwa", Icon: FaInstagram, label: "Instagram" },
  { href: "https://x.com/roushanwa", Icon: FaXTwitter, label: "X" },
];

/**
 * The page footer. It lived at the bottom of the Contact section, which put it
 * inside a <section> — and a <footer> nested in sectioning content is not a
 * contentinfo landmark, so the page had no footer landmark at all. Outside
 * <main>, where it is one.
 *
 * `bg-page` and `pt-16` stand in for the section background and the margin it
 * used to sit under: a margin here would show the root's black through.
 */
export const Footer = () => (
  <footer className="bg-page pt-16">
    <div className="border-t border-white/10 pt-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
        <p className="text-center text-xs text-gray-400 sm:text-left sm:text-sm">
          © {new Date().getFullYear()} Bhupesh Roushan. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          {SOCIALS.map(({ href, Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="tap text-gray-400 transition-colors hover:text-white"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>

      {/* An IP is personal data under India's DPDP Act, and under GDPR for
          any EU visitor, so a site that logs one has to say so. Six words
          discharge that; a paragraph of it on a portfolio just makes the
          page feel like it wants something. */}
      <div className="mx-auto mt-5 max-w-6xl px-4 pb-20 sm:pb-28">
        {/* gray-400: gray-500 measured 4.10:1 here, under the 4.5 AA needs
            at 11px. */}
        <p className="text-center text-[11px] text-gray-400 sm:text-left">
          Visits are logged. No cookies.
        </p>
      </div>
    </div>
  </footer>
);
