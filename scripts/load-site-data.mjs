/**
 * Load the site's data modules from plain Node.
 *
 * portfolio.js imports its screenshots (`import atlas from "../assets/atlas.webp"`)
 * and skills.js imports icon components. Vite resolves those; Node cannot, so the
 * build scripts used to pattern-match the source instead — and every pattern was
 * one edit away from reading a nested key as a project (see the note on ENTRY_ID
 * in prerender-projects.mjs).
 *
 * This keeps the data as the single source: it rewrites each import to a stub
 * binding and evaluates the rest of the module as written. Nothing here reads a
 * value the app doesn't, and a new import that isn't covered fails loudly rather
 * than leaving a ReferenceError for later.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Default imports (images) become their path; named imports (icons) become null. */
function stubImports(code, file) {
  const out = code
    .replace(/^import\s+(\w+)\s+from\s+"([^"]+)";?[ \t]*$/gm, (_, name, from) => `const ${name} = ${JSON.stringify(from)};`)
    .replace(/^import\s*\{([^}]*)\}\s*from\s+"[^"]+";?[ \t]*$/gm, (_, names) =>
      names
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean)
        .map((n) => `const ${n} = null;`)
        .join(" ")
    );
  if (/^import\s/m.test(out)) {
    throw new Error(`load-site-data: ${file} has an import form the stubber doesn't handle`);
  }
  return out;
}

async function loadModule(relPath) {
  const code = stubImports(readFileSync(resolve(root, relPath), "utf8"), relPath);
  // A data: URL, so nothing is written to disk and the module can't resolve
  // anything relative to a path that no longer exists.
  return import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
}

export async function loadSiteData() {
  const [portfolio, skills, hiring, caseStudies] = await Promise.all([
    loadModule("src/data/portfolio.js"),
    loadModule("src/data/skills.js"),
    loadModule("src/data/hiring.js"),
    // Dependency-free, so a normal import is enough and keeps the stack traces useful.
    import(pathToFileURL(resolve(root, "src/data/caseStudies.js")).href),
  ]);
  return {
    projects: portfolio.projects,
    journey: portfolio.journey,
    skillGroups: skills.skillGroups,
    hiring: hiring.hiring,
    email: hiring.EMAIL,
    caseStudies: caseStudies.CASE_STUDIES,
  };
}
