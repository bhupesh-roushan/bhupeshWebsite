/**
 * Reading time, counted from the text rather than typed beside it.
 *
 * The write-ups used to carry a hand-written "5 min" each, which is correct on
 * the day it is written and wrong after the first edit — and an edit to a case
 * study is exactly when nobody remembers to update a number two screens away.
 * Plain data and no imports on purpose: the build script loads this same file
 * to put the figure in the feeds, so the page and the feed cannot disagree.
 */
const WORDS_PER_MINUTE = 220;

const words = (text) => (String(text).match(/\S+/g) ?? []).length;

/** Every word a reader is actually shown, in the order the page shows them. */
export function studyWords(study) {
  let total = words(study.title) + words(study.dek);
  for (const section of study.sections ?? []) {
    total += words(section.heading);
    for (const p of section.body ?? []) total += words(p);
    for (const p of section.after ?? []) total += words(p);
    for (const item of section.list ?? []) total += words(item);
    if (section.compare) {
      total += words(section.compare.caption);
      for (const row of section.compare.rows) total += words(row.label) + words(row.score) + words(row.quote);
    }
  }
  return total;
}

/** "4 min" — never below one, since "0 min read" reads as an error. */
export function readingTime(study) {
  const minutes = Math.max(1, Math.round(studyWords(study) / WORDS_PER_MINUTE));
  return `${minutes} min`;
}
