/**
 * Build /resume.txt from the same data the site renders.
 *
 * It used to be hand-written, which meant every edit to portfolio.js silently
 * desynced the plain-text résumé — the version an applicant tracking system
 * reads would quietly disagree with the version a human reads.
 *
 * The data modules import images, which Node can't resolve, so esbuild (already
 * a Vite dependency) bundles them first with asset imports stubbed to strings.
 * That's why this reads the real exports instead of regex-scraping the source.
 */
import { build } from "esbuild";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const entry = `
  export { journey, projects } from "./src/data/portfolio.js";
  export { skillGroups } from "./src/data/skills.js";
  export { hiring } from "./src/data/hiring.js";
`;

// Stub rather than inline. Loading assets as text embedded every image as a
// megabyte of escaped binary, and leaving react-icons external broke the
// import because a bare specifier can't resolve from a generated module.
// Neither is actually read here — only names, dates and bullets are.
const stub = {
  name: "stub-non-data",
  setup(b) {
    b.onResolve({ filter: /\.(png|jpe?g|webp|svg|mp4)$/ }, (a) => ({
      path: a.path,
      namespace: "asset-stub",
    }));
    b.onLoad({ filter: /.*/, namespace: "asset-stub" }, () => ({
      contents: 'export default "";',
      loader: "js",
    }));

    b.onResolve({ filter: /^react-icons/ }, (a) => ({
      path: a.path,
      namespace: "icon-stub",
    }));
    // CommonJS on purpose: a Proxy answers any named import the data asks for,
    // which an ESM stub with fixed exports cannot.
    b.onLoad({ filter: /.*/, namespace: "icon-stub" }, () => ({
      contents: "module.exports = new Proxy({}, { get: () => () => null });",
      loader: "js",
    }));
  },
};

const bundled = await build({
  stdin: { contents: entry, resolveDir: root, sourcefile: "resume-entry.js", loader: "js" },
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
  plugins: [stub],
});

const code = bundled.outputFiles[0].text;
const mod = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
);

const { journey, projects, skillGroups, hiring } = mod;

const wrap = (text, width = 78, indent = "  ") =>
  text
    .split(" ")
    .reduce(
      (lines, word) => {
        const line = lines[lines.length - 1];
        if ((line + " " + word).trim().length > width - indent.length) lines.push(word);
        else lines[lines.length - 1] = (line + " " + word).trim();
        return lines;
      },
      [""]
    )
    .map((l) => indent + l)
    .join("\n");

const out = [];
out.push("BHUPESH ROUSHAN");
out.push("Full Stack Developer | GenAI & Automation");
out.push(hiring.location);
out.push("");
out.push("Email: roushan.bhupesh@gmail.com");
out.push("Phone: +91 7992302851");
out.push("Portfolio: https://www.bhupesh.blog");
out.push("GitHub: https://github.com/bhupesh-roushan");
out.push("LinkedIn: https://www.linkedin.com/in/roushanb");
out.push("");
out.push("");
out.push("AVAILABILITY");
out.push("");
out.push(`Notice period: ${hiring.noticePeriod}`);
out.push(`Work mode: ${hiring.workMode}`);
out.push(`Open to: ${hiring.openTo.join(", ")}`);
out.push("");
out.push("");
out.push("SKILLS");
out.push("");
for (const group of skillGroups) {
  out.push(`${group.title}: ${group.items.map((i) => i.name).join(", ")}`);
  out.push("");
}
out.push("");
out.push("EXPERIENCE");
out.push("");
for (const job of journey.filter((j) => j.kind !== "Education")) {
  out.push(`${job.company}, ${job.location} - ${job.role}`);
  out.push(job.period);
  out.push(`Tech: ${job.stack.join(", ")}`);
  out.push("");
  for (const b of job.bullets) out.push(wrap(`- ${b}`));
  out.push("");
}
out.push("");
out.push("PROJECTS");
out.push("");
for (const p of projects) {
  out.push(`${p.title} - ${p.tagline}${p.period ? ` (${p.period})` : ""}`);
  out.push(`Live: ${p.href}`);
  if (p.repo) out.push(`Source: ${p.repo}`);
  out.push(`Tech: ${p.stack.join(", ")}`);
  out.push("");
  for (const b of p.bullets) out.push(wrap(`- ${b}`));
  out.push("");
}
out.push("");
out.push("EDUCATION");
out.push("");
for (const e of journey.filter((j) => j.kind === "Education")) {
  out.push(`${e.company}, ${e.location}`);
  out.push(e.role);
  out.push(e.period);
  out.push("");
  for (const b of e.bullets) out.push(wrap(`- ${b}`));
  out.push("");
}

writeFileSync(resolve(root, "public/resume.txt"), out.join("\n").replace(/\n{3,}/g, "\n\n") + "\n");
console.log(`generated resume.txt from live data (${journey.length} roles, ${projects.length} projects)`);
