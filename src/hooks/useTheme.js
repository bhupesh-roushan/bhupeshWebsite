import { useSyncExternalStore } from "react";

/** @typedef {"light" | "dark"} Theme */

const KEY = "theme";
const COLORS = { light: "#f6f7fb", dark: "#0a0a0a" }; // the browser UI colour, per theme

const listeners = new Set();

/**
 * The theme actually on the page — set before first paint by the inline script in index.html.
 * @returns {Theme}
 */
const current = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

/**
 * @param {Theme} theme
 * @param {{ animate: boolean }} options
 */
function apply(theme, { animate }) {
  const root = document.documentElement;

  // Ease the change, unless the visitor asked for less motion. The class is
  // removed again so it can never slow down an unrelated hover or scroll.
  if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("theme-fade");
    window.setTimeout(() => root.classList.remove("theme-fade"), 320);
  }

  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COLORS[theme]);
  listeners.forEach((fn) => fn());
}

/**
 * A choice the visitor made, which is remembered; the default is not stored.
 * @param {Theme} theme
 */
function choose(theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* private mode — the choice lasts for the page, which is the best available */
  }
  apply(theme, { animate: true });
}

/** @param {() => void} fn */
const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/**
 * [theme, toggle]. One store shared by every toggle on the page, so the navbar
 * and the mobile menu can never disagree about which theme is on.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, current, () => "dark");
  return [theme, () => choose(theme === "light" ? "dark" : "light")];
}
