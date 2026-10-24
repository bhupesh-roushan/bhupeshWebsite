import { LuSun, LuMoon } from "react-icons/lu";
import { useTheme } from "../hooks/useTheme";

/**
 * Light / dark switch.
 *
 * The icon shows where you will go, not where you are — a sun while it is dark —
 * which is the convention and the one that makes the button read as an action.
 * The name says the same thing in words for a screen reader.
 */
export const ThemeToggle = ({ className = "" }) => {
  const [theme, toggle] = useTheme();
  const next = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-colors hover:border-white/30 hover:text-white ${className}`}
    >
      {theme === "light" ? <LuMoon className="h-4 w-4" /> : <LuSun className="h-4 w-4" />}
    </button>
  );
};
