import { useMemo } from "react";
import { LuUserSearch, LuX } from "react-icons/lu";
import { projects } from "../data/portfolio";
import { rankProjects } from "../lib/roleFit";

/**
 * The banner's visible half. Split from RoleBanner because it needs the
 * project data to count matches, and that data has no business in the first
 * download for the many visitors who arrive without a role.
 */
export default function RoleBannerBody({ role, onClear }) {
  const matchCount = useMemo(() => rankProjects(projects, role).matchCount, [role]);

  return (
    <div className="border-b border-indigo-400/25 bg-indigo-500/10 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-x-3 gap-y-1 px-4 py-1.5 text-xs text-gray-200 sm:text-[13px]">
        <LuUserSearch className="hidden h-3.5 w-3.5 shrink-0 text-indigo-300 sm:block" />
        <p className="min-w-0">
          Showing the <strong className="font-semibold text-white">{role.label}</strong> view
          {" — "}
          {matchCount} of {projects.length} projects match.
        </p>
        <button
          type="button"
          onClick={onClear}
          aria-label={`Clear the ${role.label} view`}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold text-indigo-300 underline-offset-2 transition-colors hover:bg-white/10 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
        >
          Clear
          <LuX className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
