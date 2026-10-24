import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LuSearch,
  LuCornerDownLeft,
  LuHouse,
  LuUser,
  LuFolderGit2,
  LuActivity,
  LuMail,
  LuBookOpen,
  LuSunMoon,
  LuDownload,
  LuCopy,
  LuCalendarCheck,
  LuGithub,
  LuLinkedin,
} from "react-icons/lu";
import { projects } from "../data/portfolio";
import { CASE_STUDIES } from "../data/caseStudies";
import { hiring, EMAIL } from "../data/hiring";
import { useTheme } from "../hooks/useTheme";
import { notify } from "../lib/toast";

const SECTIONS = [
  { id: "home", label: "Home", Icon: LuHouse },
  { id: "about", label: "About", Icon: LuUser },
  { id: "projects", label: "Projects", Icon: LuFolderGit2 },
  { id: "activity", label: "Activity", Icon: LuActivity },
  { id: "contact", label: "Contact", Icon: LuMail },
];

/** Every query word must appear somewhere in the label or its keywords. */
const matches = (item, query) => {
  const hay = `${item.label} ${item.keywords ?? ""}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
};

/**
 * ⌘K / Ctrl+K — jump anywhere, or do the three things people come here to do.
 *
 * It exists because the site is one long page plus a few routes, and the
 * quickest way to a specific project or write-up was scrolling to find it. It
 * is loaded on first use, so the code costs nothing until it is asked for.
 */
export default function CommandPalette({ onClose }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [, toggleTheme] = useTheme();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const goToSection = (id) => {
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (pathname === "/") return scroll();
    navigate("/");
    // The home sections load a moment after the route does; wait for the target.
    let tries = 0;
    const wait = () => {
      if (document.getElementById(id) || tries++ > 40) return scroll();
      setTimeout(wait, 50);
    };
    wait();
  };

  const items = useMemo(() => {
    const list = [
      ...SECTIONS.map((s) => ({
        group: "Sections",
        label: s.label,
        Icon: s.Icon,
        hint: "Go to",
        run: () => goToSection(s.id),
      })),
      ...projects.map((p) => ({
        group: "Projects",
        label: p.title,
        keywords: `${p.tagline} ${p.stack.join(" ")}`,
        Icon: LuFolderGit2,
        hint: p.tagline,
        run: () => navigate(`/projects/${p.id}`),
      })),
      { group: "Writing", label: "All writing", Icon: LuBookOpen, hint: "Index", run: () => navigate("/writing", { viewTransition: true }) },
      ...Object.entries(CASE_STUDIES).map(([id, s]) => ({
        group: "Writing",
        label: s.title,
        keywords: `${s.project} ${s.tags.join(" ")}`,
        Icon: LuBookOpen,
        hint: s.project,
        run: () => navigate(`/writing/${id}`, { viewTransition: true }),
      })),
      { group: "Actions", label: "Switch theme", keywords: "light dark mode", Icon: LuSunMoon, hint: "Light / dark", run: toggleTheme },
      { group: "Actions", label: "Open résumé", keywords: "cv pdf download", Icon: LuDownload, hint: "PDF", run: () => window.open("/Bhupesh-Roushan-Resume.pdf", "_blank", "noopener") },
      {
        group: "Actions",
        label: "Copy email address",
        keywords: "contact mail",
        Icon: LuCopy,
        hint: EMAIL,
        run: async () => {
          try {
            await navigator.clipboard.writeText(EMAIL);
            notify("success", "Email address copied");
          } catch {
            notify("error", "Couldn't copy — it's " + EMAIL);
          }
        },
      },
      ...(hiring.bookingUrl
        ? [{ group: "Actions", label: "Book a call", keywords: "schedule meeting", Icon: LuCalendarCheck, hint: "15 min", run: () => window.open(hiring.bookingUrl, "_blank", "noopener") }]
        : []),
      { group: "Links", label: "GitHub", Icon: LuGithub, hint: "bhupesh-roushan", run: () => window.open("https://github.com/bhupesh-roushan", "_blank", "noopener") },
      { group: "Links", label: "LinkedIn", Icon: LuLinkedin, hint: "in/roushanb", run: () => window.open("https://www.linkedin.com/in/roushanb", "_blank", "noopener") },
    ];
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const results = useMemo(() => items.filter((i) => matches(i, query)), [items, query]);

  // Keep the highlight on a real row as the list shrinks under it.
  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    const opener = document.activeElement;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [index, results]);

  const choose = (item) => {
    onClose();
    // After the dialog has closed and returned focus, so the action isn't undone by it.
    setTimeout(() => item.run(), 0);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter" && results[index]) {
      e.preventDefault();
      choose(results[index]);
    } else if (e.key === "Tab") {
      e.preventDefault(); // one control; Tab has nowhere inside to go
    }
  };

  let lastGroup = null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-start justify-center px-4 pt-[14vh]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-panel/95 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <LuSearch className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[index] ? `palette-${index}` : undefined}
            placeholder="Search projects, writing, actions…"
            className="h-14 w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-gray-400 sm:block">esc</kbd>
        </div>

        <ul id="palette-list" role="listbox" ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-gray-400">Nothing matches &ldquo;{query}&rdquo;.</li>
          )}
          {results.map((item, i) => {
            const header = item.group !== lastGroup;
            lastGroup = item.group;
            const selected = i === index;
            return (
              <li key={`${item.group}-${item.label}`} role="presentation">
                {header && (
                  <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{item.group}</p>
                )}
                <div
                  id={`palette-${i}`}
                  role="option"
                  aria-selected={selected}
                  onMouseMove={() => setIndex(i)}
                  onClick={() => choose(item)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                    selected ? "bg-white/10 text-white" : "text-gray-300"
                  }`}
                >
                  <item.Icon className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.hint && <span className="hidden max-w-[40%] truncate text-xs text-gray-500 sm:block">{item.hint}</span>}
                  {selected && <LuCornerDownLeft className="h-3.5 w-3.5 shrink-0 text-gray-400" />}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4 border-t border-white/10 px-4 py-2.5 text-[11px] text-gray-500">
          <span><kbd className="font-sans">↑↓</kbd> move</span>
          <span><kbd className="font-sans">↵</kbd> open</span>
          <span><kbd className="font-sans">esc</kbd> close</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
