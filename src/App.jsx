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

/**
 * One page at every route. /projects/:projectId renders exactly the same
 * layout — the param only tells the Projects section which modal to open — so
 * a shared project link lands on the whole portfolio rather than a bare
 * detail page with no way back into the rest of it.
 */
function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Home />
      <About />
      <Projects />
      <Activity />
      <Contact />
    </>
  );
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
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
