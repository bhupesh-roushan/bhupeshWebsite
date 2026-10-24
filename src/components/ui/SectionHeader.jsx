/**
 * The head of a section: a small label, a large title, one line of context.
 *
 * Every section used to open with the same centred 30px heading and nothing
 * else, which made five different sections read as one repeated block. This
 * left-aligns the title (a centred heading over a left-aligned grid never lined
 * up with anything), gives it a fluid size from the type scale in index.css,
 * and lets the label carry position — "01 / About" — the way a printed page
 * numbers its chapters.
 */
export const SectionHeader = ({ index, label, title, children, as: Tag = "h2" }) => (
  <header className="mb-12 max-w-2xl">
    <p className="eyebrow mb-3">
      {index && <span className="text-indigo-400">{index}</span>}
      {index && <span aria-hidden="true"> / </span>}
      {label}
    </p>
    <Tag className="title text-white">{title}</Tag>
    {children && <p className="mt-4 text-base leading-relaxed text-gray-300">{children}</p>}
  </header>
);
