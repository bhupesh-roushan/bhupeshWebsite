import { Link } from "react-router-dom";
import { LuArrowUpRight, LuArrowLeft } from "react-icons/lu";
import { CASE_STUDIES } from "../../data/caseStudies";
import { TiltCard } from "../ui/TiltCard";

/**
 * Every write-up in one place.
 *
 * Before this the only route in was: open a project, scroll past the
 * architecture diagram, click. Four pieces behind one modal, with no way to
 * get from any of them to the other three — the most considered thing on the
 * site was also the hardest thing to find on it.
 */
export const WritingIndex = () => {
  const studies = Object.entries(CASE_STUDIES);

  return (
    <section className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:pt-32">
      <Link
        to="/"
        className="mb-10 inline-flex items-center gap-2 text-xs font-medium text-gray-400 transition-colors hover:text-white"
      >
        <LuArrowLeft className="h-3.5 w-3.5" />
        Back to the site
      </Link>

      <h1 className="text-3xl font-bold text-white sm:text-4xl">Writing</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-300">
        Decisions that were harder than they looked, written up from the commits
        that record them. Each one names what was measured and what was rejected.
      </p>

      <ul className="mt-12 space-y-4">
        {studies.map(([id, study]) => (
          <li key={id}>
            <TiltCard>
            <Link
              to={`/writing/${id}`}
              className="group block rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/25 hover:bg-white/[0.05]"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-md border px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    color: `rgb(${study.accent})`,
                    borderColor: `rgba(${study.accent},0.3)`,
                    backgroundColor: `rgba(${study.accent},0.08)`,
                  }}
                >
                  {study.project}
                </span>
                <span className="text-[11px] text-gray-500">
                  {study.date} · {study.readingTime} read
                </span>
              </div>

              <h2 className="flex items-start gap-1.5 text-lg font-bold text-white">
                {study.title}
                <LuArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-gray-500 transition-colors group-hover:text-white" />
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{study.dek}</p>
            </Link>
            </TiltCard>
          </li>
        ))}
      </ul>
    </section>
  );
};
