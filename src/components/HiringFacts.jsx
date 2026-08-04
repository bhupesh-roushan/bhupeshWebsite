import { hiring } from "../data/hiring";
import {
  LuClock,
  LuMapPin,
  LuBriefcase,
  LuCalendarCheck,
  LuFileText,
  LuArrowUpRight,
} from "react-icons/lu";

/**
 * The questions a recruiter emails to ask before they can do anything with a
 * candidate. Answering them on the page removes a round-trip.
 */
export const HiringFacts = () => {
  const rows = [
    { Icon: LuClock, label: "Notice period", value: hiring.noticePeriod },
    { Icon: LuMapPin, label: "Work mode", value: hiring.workMode },
    { Icon: LuBriefcase, label: "Experience", value: hiring.experience },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        For recruiters
      </h3>

      <dl className="space-y-3">
        {rows.map(({ Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="h-4 w-4 shrink-0 text-indigo-300" />
            <div className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wider text-gray-500">
                {label}
              </dt>
              <dd className="text-sm text-white">{value}</dd>
            </div>
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
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-medium text-gray-300 transition-colors hover:border-white/30 hover:text-white"
        >
          Plain text
        </a>
        {hiring.bookingUrl && (
          <a
            href={hiring.bookingUrl}
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
