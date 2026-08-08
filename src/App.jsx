import { useState } from "react";
import "./App.css";
import { LoadingScreen } from "./components/LoadingScreen";
import { Navbar } from "./components/Navbar";
import { MobileMenu } from "./components/MobileMenu";
import { Home } from "./components/sections/Home";
import { About } from "./components/sections/About";
import { Projects } from "./components/sections/Projects";
import { Activity } from "./components/sections/Activity";
import "./index.css";
import { Contact } from "./components/sections/Contact";
import { ToastContainer } from "react-toastify";
import { Analytics } from "@vercel/analytics/react";
import { Routes, Route } from "react-router-dom";
import { useVisitAlert } from "./hooks/useVisitAlert";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useStackOffsets } from "./hooks/useStackOffsets";
import { CaseStudy } from "./components/sections/CaseStudy";
import { WritingIndex } from "./components/sections/WritingIndex";

const SECTIONS = [
  { name: "Home", Component: Home },
  { name: "About", Component: About },
  { name: "Projects", Component: Projects },
  { name: "Activity", Component: Activity },
  { name: "Contact", Component: Contact },
];

/**
 * One page at every route. /projects/:projectId renders exactly the same
 * layout — the param only tells the Projects section which modal to open — so
 * a shared project link lands on the whole portfolio rather than a bare
 * detail page with no way back into the rest of it.
 */
function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  useStackOffsets();
  return (
    <>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      {/* One boundary per section, not one around the lot: a section that
          throws should cost you that section, not the whole page. */}
      {SECTIONS.map(({ name, Component }, i) => (
        <ErrorBoundary key={name} name={name}>
          {i === 0 ? (
            <Component />
          ) : (
            // Everything after the hero stacks. Sticky at top: 0 with a rising
            // z-index, so each panel parks under the viewport edge and the next
            // one scrolls over it. The hero is excluded — it is the thing being
            // covered, and stacking it would pin it over its own successor.
            <div className="stack-panel" style={{ zIndex: i }}>
              <Component />
            </div>
          )}
        </ErrorBoundary>
      ))}
    </>
  );
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useVisitAlert();

  return (
    <>
      {!isLoaded && <LoadingScreen onComplete={() => setIsLoaded(true)} />}{" "}
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
                  <WritingIndex />
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
                  <CaseStudy />
                </ErrorBoundary>
              </>
            }
          />
          {/* Anything else still gets the portfolio rather than a blank screen */}
          <Route path="*" element={<Page />} />
        </Routes>
        <Analytics />
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </>
  );
}

export default App;
