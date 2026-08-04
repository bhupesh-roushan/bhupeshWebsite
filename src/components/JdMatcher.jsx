import { useMemo, useState } from "react";
import { allSkills } from "../data/skills";
import { LuSearch, LuCheck, LuX } from "react-icons/lu";

// Plain keyword overlap, computed in the browser. No API key, no cost, and
// nothing that can invent a skill that isn't on the list.
//
// Aliases exist because job descriptions rarely use the same wording as a CV:
// a JD says "Node", "ReactJS" or "LLM", the skill list says "Node.js",
// "React.js", "LLM APIs".
const ALIASES = {
  "React.js": ["react", "reactjs", "react.js"],
  "Next.js": ["next", "nextjs", "next.js"],
  "Node.js": ["node", "nodejs", "node.js"],
  "Express.js": ["express", "expressjs"],
  "REST APIs": ["rest", "restful", "rest api", "api"],
  TypeScript: ["typescript", "ts"],
  JavaScript: ["javascript", "js", "es6"],
  MongoDB: ["mongo", "mongodb"],
  MySQL: ["mysql", "sql"],
  "Tailwind CSS": ["tailwind", "tailwindcss"],
  "LLM APIs": ["llm", "openai", "gemini", "claude", "anthropic", "gpt"],
  RAG: ["rag", "retrieval augmented", "retrieval-augmented"],
  LangChain: ["langchain", "lang chain"],
  "AI Agents": ["agent", "agents", "agentic"],
  "Prompt Engineering": ["prompt", "prompting"],
  Embeddings: ["embedding", "embeddings", "vector"],
  ChromaDB: ["chroma", "chromadb", "vector db", "vector database"],
  "JWT Auth": ["jwt", "auth", "authentication", "authorization"],
  Docker: ["docker", "container"],
  "System Design": ["system design", "hld", "lld", "architecture"],
  DSA: ["dsa", "data structures", "algorithms"],
  "Supabase (BaaS)": ["supabase"],
  Python: ["python"],
  Java: ["java"],
  Git: ["git"],
  GitHub: ["github"],
  Redux: ["redux"],
  Figma: ["figma"],
  Postman: ["postman"],
  Vercel: ["vercel"],
  "Operating Systems": ["operating system", "os"],
  "Computer Networks": ["networking", "computer networks"],
};

const termsFor = (name) =>
  ALIASES[name] ?? [name.toLowerCase().replace(/\s*\(.*\)\s*/, "").trim()];

// Word-boundary match so "os" doesn't fire inside "across" and "go" inside
// "algorithm". Escapes regex metacharacters in things like "Node.js".
const mentions = (haystack, term) => {
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, "i").test(haystack);
};

export const JdMatcher = () => {
  const [jd, setJd] = useState("");

  const result = useMemo(() => {
    const text = jd.toLowerCase();
    if (text.trim().length < 40) return null;

    const matched = [];
    const missing = [];
    allSkills.forEach((skill) => {
      const hit = termsFor(skill.name).some((t) => mentions(text, t));
      (hit ? matched : missing).push(skill);
    });

    // Deduplicate: a few skills share an Icon across groups (TbApi appears
    // three times), and repeats would read as padding.
    const seen = new Set();
    const unique = matched.filter((s) => !seen.has(s.name) && seen.add(s.name));

    return { matched: unique, total: allSkills.length, missing };
  }, [jd]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-2 flex items-center gap-2.5">
        <LuSearch className="h-4 w-4 text-indigo-300" />
        <h3 className="text-sm font-bold text-white">Role fit check</h3>
      </div>
      <p className="mb-4 text-xs text-gray-400">
        Paste a job description — it&apos;s matched against my skill list in your
        browser. Nothing is uploaded.
      </p>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        rows={4}
        placeholder="Paste the job description here..."
        className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-indigo-500 focus:outline-none"
      />

      {result && (
        <div className="mt-5">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {result.matched.length}
            </span>
            <span className="text-xs text-gray-400">
              of my {result.total} listed skills appear in this role
            </span>
          </div>

          {result.matched.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {result.matched.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200"
                >
                  <LuCheck className="h-3 w-3" />
                  {s.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <LuX className="h-3.5 w-3.5" />
              No direct overlap — worth a conversation anyway.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
