import { useEffect, useRef, useState } from "react";
import icon from "../assets/icon.svg";
import bhupesh from "../assets/bhupesh.png";
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

const STEPS = [
  { at: 5, label: "initializing runtime" },
  { at: 30, label: "fetching assets" },
  { at: 65, label: "decoding images" },
  { at: 90, label: "mounting components" },
  { at: 100, label: "ready" },
];

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
      {/* faint grid, same visual language as the hero */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 5%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 5%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-7 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-indigo-500/25 blur-xl" />
            <img src={icon} alt="" className="relative h-14 w-14 animate-pulse" />
          </div>
        </div>

        <p className="mb-6 text-center font-mono text-sm text-gray-300 sm:text-lg">
          <span className="text-indigo-400">&lt;</span>
          Hi, I&apos;m Bhupesh
          <span className="text-indigo-400">/&gt;</span>
          <span className="ml-1 animate-blink text-indigo-400">|</span>
        </p>

        {/* Boot log */}
        <div className="mb-5 space-y-1.5 font-mono text-[11px] sm:text-xs">
          {STEPS.map((step) => {
            const reached = pct >= step.at;
            return (
              <div
                key={step.label}
                className={`flex items-center gap-2 transition-colors duration-300 ${
                  reached ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <span className={reached ? "text-emerald-400" : "text-gray-700"}>
                  {reached ? "✓" : "▸"}
                </span>
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Real progress */}
        <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-gray-400 sm:text-xs">
          <span>
            {Math.min(loaded, total)} / {total} assets
          </span>
          <span className="tabular-nums text-white">{pct}%</span>
        </div>

        <div
          className="h-[3px] w-full overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading assets"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-400 to-pink-400
              shadow-[0_0_12px_rgba(99,102,241,0.8)] transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
