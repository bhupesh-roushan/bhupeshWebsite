import { useState, useEffect, lazy, Suspense } from "react";
import { LazyMotion } from "framer-motion";
import "./App.css";
import { LoadingScreen } from "./components/LoadingScreen";
import { Navbar } from "./components/Navbar";
import { MobileMenu } from "./components/MobileMenu";
import { Home } from "./components/sections/Home";
import "./index.css";
import { Analytics } from "@vercel/analytics/react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useVisitAlert } from "./hooks/useVisitAlert";
import { collectPageview } from "./lib/collect";
import { readSrc } from "./lib/visitLog";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ScrollProgress } from "./components/magic/ScrollProgress";

// Only the hero is in the entry chunk. Everything below it is fetched as its own
// chunk straight after first paint (see `prefetch`), so the page that has to be
// parsed before anything shows is a fraction of the size — and by the time
// someone scrolls to About it has long since arrived.
const load = {
  About: () => import("./components/sections/About").then((m) => ({ default: m.About })),
  Projects: () => import("./components/sections/Projects").then((m) => ({ default: m.Projects })),
  Activity: () => import("./components/sections/Activity").then((m) => ({ default: m.Activity })),
  Contact: () => import("./components/sections/Contact").then((m) => ({ default: m.Contact })),
};

// Routes nobody lands on from the home page unless they follow a link, and the
// writing data (15KB) comes with them rather than with the entry.
const CaseStudy = lazy(() =>
  import("./components/sections/CaseStudy").then((m) => ({ default: m.CaseStudy }))
);
const WritingIndex = lazy(() =>
  import("./components/sections/WritingIndex").then((m) => ({ default: m.WritingIndex }))
);
// Only fetched the first time it is asked for (⌘K, or the navbar button).
const CommandPalette = lazy(() => import("./components/CommandPalette"));

const Insights = lazy(() =>
  import("./components/sections/Insights").then((m) => ({ default: m.Insights }))
);

const SECTIONS = [
  { name: "Home", Component: Home },
  { name: "About", Component: lazy(load.About) },
  { name: "Projects", Component: lazy(load.Projects) },
  { name: "Activity", Component: lazy(load.Activity) },
  { name: "Contact", Component: lazy(load.Contact) },
];

/** Starts every section download once the browser has nothing better to do. */
function usePrefetch() {
  useEffect(() => {
    const run = () => Object.values(load).forEach((fn) => fn());
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(run, 300);
    return () => clearTimeout(id);
  }, []);
}

/**
 * Holds a lazy section's place — and its id, so a #contact link that arrives
 * before the chunk does still has an element to land on. Full viewport height
 * so the panel stack measures a plausible size rather than collapsing and
 * jumping when the real content swaps in.
 */
const SectionFallback = ({ name }) => (
  <section id={name.toLowerCase()} className="min-h-screen" aria-busy="true" />
);

/** One counted view per route change. The stats page itself is not counted — checking the numbers shouldn't move them. */
function usePageviews() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith("/insights")) return;
    collectPageview(pathname, readSrc());
  }, [pathname]);
}

const RouteFallback = () => <div className="min-h-screen" aria-busy="true" />;

/**
 * One page at every route. /projects/:projectId renders exactly the same
 * layout — the param only tells the Projects section which modal to open — so
 * a shared project link lands on the whole portfolio rather than a bare
 * detail page with no way back into the rest of it.
 */
function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  usePrefetch();
  return (
    <>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      {/* One boundary per section, not one around the lot: a section that
          throws should cost you that section, not the whole page. */}
      {SECTIONS.map(({ name, Component }, i) => (
        <ErrorBoundary key={name} name={name}>
          {/* Sections follow one another; every second one carries a faint tint
              (see .page-section in index.css). */}
          <div
            className={`page-section ${i === 0 ? "page-section--base" : ""} ${
              i % 2 ? "page-section--alt dot-pattern" : ""
            }`}
          >
            <Suspense fallback={<SectionFallback name={name} />}>
              <Component />
            </Suspense>
          </div>
        </ErrorBoundary>
      ))}
    </>
  );
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  useVisitAlert();
  usePageviews();

  // ⌘K / Ctrl+K from anywhere, and a window event so the navbar button can open
  // it without the palette's state being threaded through three components.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    const open = () => setPaletteOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-palette", open);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-palette", open);
    };
  }, []);

  return (
    <LazyMotion features={() => import("./lib/motionFeatures").then((m) => m.default)} strict>
      {!isLoaded && <LoadingScreen onComplete={() => setIsLoaded(true)} />}{" "}
      <ScrollProgress />
      <div
        className={`min-h-screen transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } bg-black text-white`}
      >
        <Routes>
          <Route path="/" element={<Page />} />
          <Route path="/projects/:projectId" element={<Page />} />
          {/* Its own page rather than a section: long-form, worth a URL, and
              the thing most likely to be sent to someone else. */}
          <Route
            path="/writing"
            element={
              <>
                <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
                <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
                <ErrorBoundary name="WritingIndex">
                  <Suspense fallback={<RouteFallback />}>
                    <WritingIndex />
                  </Suspense>
                </ErrorBoundary>
              </>
            }
          />
          <Route
            path="/writing/:studyId"
            element={
              <>
                <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
                <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
                <ErrorBoundary name="CaseStudy">
                  <Suspense fallback={<RouteFallback />}>
                    <CaseStudy />
                  </Suspense>
                </ErrorBoundary>
              </>
            }
          />
          <Route
            path="/insights"
            element={
              <>
                <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
                <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
                <ErrorBoundary name="Insights">
                  <Suspense fallback={<RouteFallback />}>
                    <Insights />
                  </Suspense>
                </ErrorBoundary>
              </>
            }
          />
          {/* Anything else still gets the portfolio rather than a blank screen */}
          <Route path="*" element={<Page />} />
        </Routes>
        <Analytics />
        {paletteOpen && (
          <Suspense fallback={null}>
            <CommandPalette onClose={() => setPaletteOpen(false)} />
          </Suspense>
        )}
      </div>
    </LazyMotion>
  );
}

export default App;
