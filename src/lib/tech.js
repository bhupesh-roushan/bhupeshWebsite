// Technology names are typed by hand in three places — project stacks, the
// skills grid and the role keyword lists — and they never agree: "Node.js" and
// "Node", "React 19" and "React.js", "REST API" and "REST APIs". Comparing them
// as written would miss most of the real overlap, so each is reduced to a
// lower-case key and the keys are compared instead.

// Spellings the rules below can't fold on their own.
/** @type {Record<string, string>} */
const ALIASES = {
  "google gemini": "gemini",
  "shadcn ui": "shadcn",
  "jwt auth": "jwt",
  postgres: "postgresql",
  "data structures & algorithms": "dsa",
  "data structures and algorithms": "dsa",
  "object oriented programming": "oops",
};

/**
 * A stable comparison key for a technology name.
 * @param {unknown} name  hand-typed, so it may be missing
 */
export function techKey(name) {
  let key = String(name ?? "")
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, " ") // "Supabase (BaaS)" -> "supabase"
    .trim()
    // A version is a property of the project, not a different technology.
    .replace(/\s+v?\d+(\.\d+)*$/, "") // "Next.js 15" -> "next.js"
    .replace(/\.js$/, "") // "Node.js" -> "node"
    // "Claude API", "OpenAI API", "REST APIs" are the thing the API belongs to.
    .replace(/\s+apis?$/, "");
  key = key.replace(/\s+/g, " ");
  return ALIASES[key] ?? key;
}
