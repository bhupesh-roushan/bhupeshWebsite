import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Checks the built site rather than the generators: every JSON-LD block in
 * dist/**\/*.html must parse, and carry @context and @type.
 *
 * Skipped when dist/ doesn't exist, so a plain `npm test` on a fresh checkout
 * (as CI runs it) stays green. After `npm run build` it runs for real:
 *
 *   npm run build && npx vitest run tests/structured-data.dist.test.js
 */
const dist = resolve(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const built = existsSync(resolve(dist, "index.html"));

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = resolve(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith(".html") ? [full] : [];
  });
}

const SCRIPT = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;

describe.skipIf(!built)("JSON-LD in dist/", () => {
  const files = built ? htmlFiles(dist) : [];
  const pages = files.map((file) => {
    const html = readFileSync(file, "utf8");
    return { name: relative(dist, file), html, raw: [...html.matchAll(SCRIPT)].map((m) => m[1]) };
  });

  it("finds the pages it is meant to check", () => {
    expect(pages.length).toBeGreaterThan(10);
  });

  for (const { name, html, raw } of pages) {
    // The 404 is deliberately standalone and carries no structured data.
    if (name === "404.html") continue;

    describe(name, () => {
      it("has at least one block, and every block is valid JSON with @context and @type", () => {
        expect(raw.length).toBeGreaterThan(0);
        for (const text of raw) {
          const block = JSON.parse(text);
          expect(block["@context"]).toBe("https://schema.org");
          expect(typeof block["@type"]).toBe("string");
        }
      });

      it("carries no raw '<' inside a block", () => {
        for (const text of raw) expect(text).not.toContain("<");
      });

      it("describes the same URL the page declares as canonical", () => {
        const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
        expect(canonical).toBeTruthy();
        const blocks = raw.map((t) => JSON.parse(t));
        // The main block of each page type, and where it says which page it is.
        const urlOf = {
          ProfilePage: (b) => b.url,
          CollectionPage: (b) => b.url,
          TechArticle: (b) => b.url,
          SoftwareApplication: (b) => b.mainEntityOfPage["@id"],
          WebApplication: (b) => b.mainEntityOfPage["@id"],
        };
        const main = blocks.find((b) => urlOf[b["@type"]]);
        expect(main, "a main block").toBeTruthy();
        expect(urlOf[main["@type"]](main)).toBe(canonical);
      });
    });
  }

  it("defines the Person once, on the home page, and nowhere else", () => {
    const withPerson = pages
      .filter((p) => p.raw.some((t) => JSON.parse(t)["@type"] === "Person"))
      .map((p) => p.name);
    expect(withPerson).toEqual(["index.html"]);
  });

  it("never repeats a block within a page", () => {
    for (const { name, raw } of pages) {
      expect(new Set(raw).size, name).toBe(raw.length);
    }
  });
});
