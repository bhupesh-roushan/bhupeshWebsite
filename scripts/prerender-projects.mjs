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

/**
 * `\s+` rather than a literal space: the longer tags in index.html are written
 * across several lines, and patterns assuming one line matched nothing. The
 * three description tags — the whole reason this script exists — were quietly
 * skipped, so every project page shipped with the site-wide blurb.
 */
const metaRe = (attr, name) =>
  new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")[^"]*(")`);

/** Replace, or fail — a no-op substitution here is invisible in the output. */
const sub = (html, re, value, what) => {
  if (!re.test(html)) throw new Error(`prerender: no ${what} tag to replace`);
  return html.replace(re, `$1${value}$2`);
};

let written = 0;
for (const id of entries) {
  const { title, tagline } = titleFor(id);
  const pageTitle = `${title} — ${tagline} | Bhupesh Roushan`;
  // No "and source" — one of these projects is internal work with a private
  // repo, and the preview shouldn't promise a link that isn't there.
  const desc = `${tagline}. Built by Bhupesh Roushan — stack, architecture and engineering detail.`;
  const url = `${SITE}/projects/${id}`;

  if (!/<title>[^<]*<\/title>/.test(shell)) throw new Error("prerender: no <title>");
  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(pageTitle)}</title>`);

  for (const [re, value, what] of [
    [metaRe("name", "description"), esc(desc), "description"],
    [metaRe("property", "og:title"), esc(pageTitle), "og:title"],
    [metaRe("property", "og:description"), esc(desc), "og:description"],
    [metaRe("property", "og:url"), url, "og:url"],
    [metaRe("name", "twitter:title"), esc(pageTitle), "twitter:title"],
    [metaRe("name", "twitter:description"), esc(desc), "twitter:description"],
    [/(<link rel="canonical" href=")[^"]*(")/, url, "canonical"],
  ]) {
    html = sub(html, re, value, what);
  }

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

/**
 * Vercel serves 404.html for anything that matches no file. Without one it
 * answers with a 79-byte unstyled default — correct status, but a dead end
 * with no branding and no way back into the site.
 *
 * Deliberately standalone: no bundle, no fonts, no requests. A 404 is the one
 * page that should never wait on a 500KB download to tell you it isn't there.
 * `noindex` because a 404 body must never be indexed as content.
 */
const notFound = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, follow" />
    <title>Page not found | Bhupesh Roushan</title>
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <style>
      *{ box-sizing: border-box; }
      body {
        margin: 0; min-height: 100vh; display: grid; place-items: center;
        background: #0a0a0a; color: #fff; padding: 24px;
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      }
      main { max-width: 32rem; text-align: center; }
      .code { font-size: .75rem; letter-spacing: .18em; text-transform: uppercase; color: #6366f1; margin: 0 0 .75rem; }
      h1 { font-size: clamp(1.5rem, 5vw, 2rem); margin: 0 0 .75rem; }
      p { color: #9ca3af; line-height: 1.6; margin: 0 0 1.75rem; font-size: .95rem; }
      .row { display: flex; gap: .625rem; flex-wrap: wrap; justify-content: center; }
      a {
        display: inline-flex; align-items: center; height: 2.5rem; padding: 0 1rem;
        border-radius: .5rem; border: 1px solid rgba(255,255,255,.15);
        background: rgba(255,255,255,.05); color: #e5e7eb;
        font-size: .875rem; font-weight: 600; text-decoration: none;
      }
      a.primary { border-color: rgba(99,102,241,.4); background: rgba(99,102,241,.18); color: #fff; }
      a:hover { border-color: rgba(255,255,255,.3); color: #fff; }
    </style>
  </head>
  <body>
    <main>
      <p class="code">Error 404</p>
      <h1>That page doesn&rsquo;t exist</h1>
      <p>The link may be out of date, or the address mistyped. Everything lives on one page &mdash; the sections below will get you there.</p>
      <div class="row">
        <a class="primary" href="/">Back to the site</a>
        <a href="/#projects">Projects</a>
        <a href="/#contact">Contact</a>
      </div>
    </main>
  </body>
</html>
`;
writeFileSync(resolve(root, "dist/404.html"), notFound);

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

console.log(
  `prerendered ${written} project pages + 404 + sitemap (${urls.length} urls)`
);
