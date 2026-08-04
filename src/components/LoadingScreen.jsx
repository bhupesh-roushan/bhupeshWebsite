import { useEffect, useRef, useState } from "react";
import icon from "../assets/logo.svg";
import bhupesh from "../assets/bhupesh.webp";
import masai from "../assets/masai.jpg";
import adda from "../assets/adda.png";
import hudl from "../assets/hudl.png";
import varcons from "../assets/varcons.png";
import bms from "../assets/bms.png";

// Only what the first two screens actually need. The project screenshots
// (~2.5MB combined) and the 15MB hero video are deliberately left out — they
// sit below the fold and stream in on their own, so gating the intro on them
// just makes people stare at a progress bar. Measured on a cold, throttled
// cache, including them held the loader up for 7s.
const ASSETS = [icon, bhupesh, masai, adda, hudl, varcons, bms];

const MIN_VISIBLE_MS = 1100; // don't let the intro flash on a warm cache
const FAILSAFE_MS = 4000; // never trap someone behind the loader

export const LoadingScreen = ({ onComplete }) => {
  const [loaded, setLoaded] = useState(0);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const finished = useRef(false);
  const total = ASSETS.length;

  // Real preloading — progress reflects assets that actually settled.
  useEffect(() => {
    let cancelled = false;
    let settled = 0;
    const started = performance.now();

    const bump = () => {
      settled += 1;
      if (!cancelled) setLoaded(settled);
    };

    ASSETS.forEach((src) => {
      const img = new Image();
      img.onload = bump;
      img.onerror = bump; // a broken asset must not stall the intro
      img.src = src;
    });

    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      setExiting(true);
      setTimeout(onComplete, 450);
    };

    const tick = setInterval(() => {
      const elapsed = performance.now() - started;
      if (settled >= total && elapsed >= MIN_VISIBLE_MS) {
        clearInterval(tick);
        finish();
      }
    }, 80);

    const failsafe = setTimeout(finish, FAILSAFE_MS);

    return () => {
      cancelled = true;
      clearInterval(tick);
      clearTimeout(failsafe);
    };
  }, [onComplete, total]);

  // Ease the displayed number toward the real ratio so it never jumps.
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        const target = total ? (loaded / total) * 100 : 100;
        if (p >= target - 0.5) return target;
        return p + Math.max(0.6, (target - p) * 0.1);
      });
    }, 30);
    return () => clearInterval(id);
  }, [loaded, total]);

  const pct = Math.round(progress);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#08080c] px-6
        transition-opacity duration-500 ${exiting ? "opacity-0" : "opacity-100"}`}
    >
      <div className="flex w-full max-w-[220px] flex-col items-center">
        <img src={icon} alt="" className="mb-5 h-12 w-auto" />

        <p className="mb-6 font-mono text-sm font-bold text-white">
          Bhupesh<span className="text-indigo-500">.website</span>
        </p>

        <div
          className="h-px w-full overflow-hidden bg-white/15"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading"
        >
          <div
            className="h-full bg-indigo-400 transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="mt-3 font-mono text-[11px] tabular-nums text-gray-500">
          {pct}%
        </span>
      </div>
    </div>
  );
};
