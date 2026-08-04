/**
 * Emit a static HTML file per project after the Vite build.
 *
 * Social crawlers and search engines don't execute JavaScript, so setting
 * <meta property="og:*"> from React does nothing for a shared link — every
 * project URL would preview with the site-wide card. These files carry
 * per-project tags in the markup itself.
 *
 * The body is byte-identical to the SPA shell, so a real visitor still boots
 * the app and the router opens the right modal. Only the <head> differs.
 *
 * Vercel resolves static files before applying rewrites, so
 * /projects/cloudwatch serves this rather than falling through to index.html.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.bhupesh.blog";

// Read the project list straight from source so this can't drift from the app.
const source = readFileSync(resolve(root, "src/data/portfolio.js"), "utf8");
const projectsBlock = source.slice(source.indexOf("export const projects"));

const entries = [...projectsBlock.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
// Slice from this entry to the start of the next one. A fixed-size window
// silently truncated once codeLinks were added between `id` and `title`, and
// the affected pages quietly fell back to the raw id.
const titleFor = (id) => {
  const at = projectsBlock.indexOf(`id: "${id}"`);
  const next = projectsBlock.indexOf('id: "', at + 5);
  const slice = projectsBlock.slice(at, next === -1 ? undefined : next);
  const title = slice.match(/title:\s*"([^"]+)"/)?.[1];
  const tagline = slice.match(/tagline:\s*"([^"]+)"/)?.[1];
  if (!title || !tagline) {
    throw new Error(`prerender: could not read title/tagline for "${id}"`);
  }
  return { title, tagline };
};

const shell = readFileSync(resolve(root, "dist/index.html"), "utf8");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

let written = 0;
for (const id of entries) {
  const { title, tagline } = titleFor(id);
  const pageTitle = `${title} — ${tagline} | Bhupesh Roushan`;
  const desc = `${tagline}. Built by Bhupesh Roushan — stack, architecture and source.`;
  const url = `${SITE}/projects/${id}`;

  const html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(pageTitle)}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${esc(desc)}$2`
    )
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(pageTitle)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(pageTitle)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);

  // Written in both shapes on purpose. Static hosts disagree about how a
  // extensionless path resolves — some map /projects/x to x/index.html, others
  // (with cleanUrls) to x.html. Emitting both means the crawler gets the right
  // <head> either way, and the pair costs a few KB.
  const dir = resolve(root, "dist/projects", id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "index.html"), html);
  writeFileSync(resolve(root, "dist/projects", `${id}.html`), html);
  written += 1;
}

// Keep the sitemap in step — these are the URLs worth indexing.
const urls = [
  { loc: `${SITE}/`, priority: "1.0" },
  ...entries.map((id) => ({ loc: `${SITE}/projects/${id}`, priority: "0.8" })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>
`;
writeFileSync(resolve(root, "dist/sitemap.xml"), sitemap);

console.log(`prerendered ${written} project pages + sitemap (${urls.length} urls)`);
