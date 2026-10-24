// The roles a recruiter can ask the page to be read as — `?role=backend`.
//
// Each role is a list of technologies, grouped. A project's stack and a skill's
// name are compared against these lists (see lib/roleFit.js), so everything the
// page then says — which project comes first, which skill is lit — is a count of
// overlaps with data already on the page. Nothing here describes the owner; it
// only describes what each kind of job tends to ask for, and is the thing to
// edit if the page ranks a role differently from how you would.
//
// `label` is exactly one of `hiring.openTo`, so the banner and the hero say the
// same thing the "open to" list does.
//
// `breadth` is for roles where range is the point: a project that touches
// several groups scores a point per group on top of its matches. Without it a
// long stack of one kind (six frontend libraries) would outrank a project that
// actually spans the role.

/** @type {import("./types").Role[]} */
export const ROLES = [
  {
    slug: "sde",
    label: "Software Development Engineer",
    breadth: true,
    groups: [
      { name: "Languages", keywords: ["JavaScript", "TypeScript", "Java", "Python"] },
      { name: "Web", keywords: ["React", "Next.js", "Node.js", "Express", "REST API"] },
      { name: "Data", keywords: ["MongoDB", "MySQL", "SQL", "Redis"] },
      {
        name: "Fundamentals",
        keywords: ["DSA", "DBMS", "OOPs", "Operating Systems", "Computer Networks", "System Design"],
      },
      { name: "Delivery", keywords: ["Docker", "Git", "BullMQ"] },
    ],
  },
  {
    slug: "fullstack",
    label: "Full Stack Developer",
    breadth: true,
    // MERN Stack is listed in all three because it names all three layers.
    groups: [
      {
        name: "Frontend",
        keywords: ["React", "Next.js", "TypeScript", "Redux", "Context API", "MERN Stack"],
      },
      {
        name: "Server",
        keywords: ["Node.js", "Express", "REST API", "JWT", "Socket.io", "MERN Stack"],
      },
      {
        name: "Data",
        keywords: ["MongoDB", "Mongoose", "MySQL", "SQL", "PostgreSQL", "Supabase", "Redis", "MERN Stack"],
      },
    ],
  },
  {
    slug: "backend",
    label: "Backend Engineer",
    groups: [
      { name: "Runtime", keywords: ["Node.js", "Express", "Java"] },
      { name: "APIs & auth", keywords: ["REST API", "JWT", "Socket.io"] },
      { name: "Data", keywords: ["MongoDB", "Mongoose", "MySQL", "SQL", "PostgreSQL", "Supabase", "Redis"] },
      { name: "Queues & ops", keywords: ["BullMQ", "Docker", "System Design"] },
    ],
  },
  {
    slug: "ai",
    label: "GenAI / AI Automation Engineer",
    groups: [
      {
        name: "Models & APIs",
        keywords: ["Gemini", "Claude", "OpenAI", "OpenRouter", "vLLM", "Ollama", "Codex", "LLM APIs"],
      },
      {
        name: "Techniques",
        keywords: ["AI Agents", "Prompt Engineering", "RAG", "Embeddings", "LangChain", "ChromaDB"],
      },
    ],
  },
];

/**
 * The role for a `?role=` value, or null — unknown values are ignored, never an error.
 * @param {unknown} value  whatever the URL or storage held, including nothing
 */
export function roleBySlug(value) {
  const slug = String(value ?? "").trim().toLowerCase();
  return ROLES.find((r) => r.slug === slug) ?? null;
}
