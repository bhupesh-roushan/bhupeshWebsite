import { hiring } from "../data/hiring";
import { track } from "@vercel/analytics";
import { LuCalendarCheck, LuFileText, LuArrowUpRight } from "react-icons/lu";

/**
 * The questions a recruiter emails to ask before they can do anything with a
 * candidate. Answering them on the page removes a round-trip.
 */
export const HiringFacts = () => {
  const rows = [
    { label: "Notice period", value: hiring.noticePeriod },
    { label: "Work mode", value: hiring.workMode },
    { label: "Experience", value: hiring.experience },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        For recruiters
      </h3>

      {/* One left edge for the whole card. The icons sat in a 28px gutter that
          only these rows had, so "Notice period" started 28px right of "For
          recruiters" and "Open to" — every other block in the card is flush.
          Aligning the labels was the fix; the icons were what pushed them out,
          and a clock beside the words "Notice period" was never carrying any
          meaning the words didn't already. */}
      <dl className="space-y-3">
        {rows.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[11px] uppercase tracking-wider text-gray-500">{label}</dt>
            <dd className="mt-0.5 text-sm text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="mb-2 text-[11px] uppercase tracking-wider text-gray-500">
          Open to
        </p>
        <div className="flex flex-wrap gap-1.5">
          {hiring.openTo.map((role) => (
            <span
              key={role}
              className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[11px] text-indigo-200"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="/Bhupesh-Roushan-Resume.pdf"
          onClick={() => track("resume_download", { format: "pdf" })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-medium text-gray-300 transition-colors hover:border-white/30 hover:text-white"
        >
          <LuFileText className="h-3.5 w-3.5" />
          Résumé (PDF)
        </a>
        {/* Plain text as well — plenty of applicant tracking systems mangle
            PDF layouts, and a .txt always parses. */}
        <a
          href="/resume.txt"
          onClick={() => track("resume_download", { format: "txt" })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-medium text-gray-300 transition-colors hover:border-white/30 hover:text-white"
        >
          Plain text
        </a>
        {hiring.bookingUrl && (
          <a
            href={hiring.bookingUrl}
            onClick={() => track("booking_click")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-500/25"
          >
            <LuCalendarCheck className="h-3.5 w-3.5" />
            Book 15 min
            <LuArrowUpRight className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
};
