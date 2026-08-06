import { Link, useParams } from "react-router-dom";
import { LuArrowLeft, LuCircleAlert, LuCheck } from "react-icons/lu";
import { CASE_STUDIES } from "../../data/caseStudies";

/**
 * A case study is its own page, not a modal. It is long enough to want a URL
 * of its own, and it is the thing most worth someone sending to a colleague.
 */
export const CaseStudy = () => {
  const { studyId } = useParams();
  const study = CASE_STUDIES[studyId];

  if (!study) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-32 text-center">
        <p className="text-sm text-gray-400">That write-up doesn&rsquo;t exist.</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 text-sm text-white underline underline-offset-4"
        >
          Back to the site
        </Link>
      </section>
    );
  }

  const accent = `rgb(${study.accent})`;

  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:pt-32">
      <Link
        to="/projects/atlas"
        className="mb-10 inline-flex items-center gap-2 text-xs font-medium text-gray-400 transition-colors hover:text-white"
      >
        <LuArrowLeft className="h-3.5 w-3.5" />
        {study.project}
      </Link>

      <header className="mb-12">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {study.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border px-2 py-0.5 text-[11px] font-medium"
              style={{
                color: accent,
                borderColor: `rgba(${study.accent},0.3)`,
                backgroundColor: `rgba(${study.accent},0.08)`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
          {study.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-gray-300">{study.dek}</p>
        <p className="mt-4 text-xs text-gray-500">
          {study.project} · {study.date} · {study.readingTime} read
        </p>
      </header>

      {study.sections.map((section) => (
        <section key={section.heading} className="mb-11">
          <h2 className="mb-4 text-lg font-bold text-white">{section.heading}</h2>

          {section.body?.map((p, i) => (
            <p key={i} className="mb-4 text-sm leading-[1.75] text-gray-300">
              {p}
            </p>
          ))}

          {/* The measured before/after. This is the whole argument, so it gets
              to be a thing you can look at rather than a sentence to parse. */}
          {section.compare && (
            <figure className="my-6 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              <figcaption className="border-b border-white/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {section.compare.caption}
              </figcaption>
              <div className="divide-y divide-white/5">
                {section.compare.rows.map((row) => (
                  <div key={row.label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3.5">
                    <span className="w-32 shrink-0 text-xs text-gray-400">{row.label}</span>
                    <span
                      className="font-mono text-base font-bold"
                      style={{ color: row.bad ? "#f87171" : accent }}
                    >
                      {row.score}
                    </span>
                    <span className="flex items-start gap-1.5 text-sm italic text-gray-300">
                      {row.bad ? (
                        <LuCircleAlert className="mt-1 h-3.5 w-3.5 shrink-0 text-red-400" />
                      ) : (
                        <LuCheck className="mt-1 h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                      )}
                      &ldquo;{row.quote}&rdquo;
                    </span>
                  </div>
                ))}
              </div>
            </figure>
          )}

          {section.list && (
            <ul className="my-4 space-y-2.5">
              {section.list.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm leading-[1.75] text-gray-300">
                  <span
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {section.after?.map((p, i) => (
            <p key={i} className="mb-4 text-sm leading-[1.75] text-gray-300">
              {p}
            </p>
          ))}
        </section>
      ))}

      <p className="mt-12 border-t border-white/10 pt-6 text-xs leading-relaxed text-gray-500">
        {study.footnote}
      </p>
    </article>
  );
};
