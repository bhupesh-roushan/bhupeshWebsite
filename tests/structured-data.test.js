import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSiteData } from "../scripts/load-site-data.mjs";
import {
  SITE,
  PERSON_ID,
  SOCIAL_PROFILES,
  BLOG_ID,
  homeBlocks,
  projectBlocks,
  writingBlocks,
  writingIndexBlocks,
  parsePeriodStart,
  isoDuration,
  jsonLdScript,
  injectJsonLd,
  stripJsonLd,
} from "../scripts/structured-data.mjs";
import { studyWords, readingTime } from "../src/lib/readingTime.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const data = await loadSiteData();
const { projects, caseStudies } = data;

const ogImage = (name) => `${SITE}/og/${name}.png`;
const blocksFor = (project) =>
  projectBlocks(project, { image: ogImage(`project-${project.id}`), studies: caseStudies });
const ofType = (blocks, type) => blocks.find((b) => b["@type"] === type);

/** Every object in a block, however deeply nested. */
function* walk(value, path = "") {
  yield [path, value];
  if (Array.isArray(value)) for (let i = 0; i < value.length; i++) yield* walk(value[i], `${path}[${i}]`);
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) yield* walk(v, `${path}.${k}`);
}

/** Every block the generators emit, labelled by page, for the checks that apply to all of them. */
function allPages() {
  const studies = Object.entries(caseStudies);
  return [
    ["home", homeBlocks(data)],
    ...projects.map((p) => [`project:${p.id}`, blocksFor(p)]),
    ...studies.map(([id, s]) => [`writing:${id}`, writingBlocks(id, s, { image: ogImage(`writing-${id}`) })]),
    ["writing-index", writingIndexBlocks(caseStudies, { description: "d", image: ogImage("writing") })],
  ];
}

describe("every generated block", () => {
  for (const [page, blocks] of allPages()) {
    describe(page, () => {
      it("has @context and a single string @type on every block", () => {
        for (const b of blocks) {
          expect(b["@context"]).toBe("https://schema.org");
          expect(typeof b["@type"]).toBe("string");
        }
      });

      it("round-trips through JSON and leaks no null, undefined or empty values", () => {
        for (const b of blocks) {
          expect(JSON.parse(JSON.stringify(b))).toEqual(b);
          for (const [path, v] of walk(b)) {
            expect(v, path).not.toBeNull();
            expect(v, path).not.toBeUndefined();
            expect(v, path).not.toBe("");
            if (typeof v === "number") expect(Number.isFinite(v), path).toBe(true);
            if (Array.isArray(v)) expect(v.length, path).toBeGreaterThan(0);
            if (v && typeof v === "object" && !Array.isArray(v)) {
              expect(Object.keys(v).length, path).toBeGreaterThan(0);
            }
          }
        }
      });

      it("keeps @id, item and image on this site, as absolute https URLs", () => {
        for (const b of blocks) {
          for (const [path, v] of walk(b)) {
            const key = path.split(".").pop();
            if (["@id", "item", "image"].includes(key) && typeof v === "string") {
              expect(v, path).toMatch(new RegExp(`^${SITE.replace(/\./g, "\\.")}/`));
            }
          }
        }
      });

      it("serialises to a script that cannot be closed early", () => {
        for (const b of blocks) {
          const tag = jsonLdScript(b);
          expect(tag.match(/<\/script>/g)).toHaveLength(1);
          expect(tag.match(/<script/g)).toHaveLength(1);
        }
      });

      it("never gives two blocks the same @id", () => {
        const ids = blocks.map((b) => b["@id"]).filter(Boolean);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it("embeds the person only as the one @id: in full on this page, or named so it can stand alone", () => {
        const hasFullPerson = blocks.some((b) => b["@id"] === PERSON_ID);
        for (const b of blocks) {
          for (const [path, v] of walk(b)) {
            if (v && typeof v === "object" && v["@id"] === PERSON_ID && path !== "") {
              expect(v["@type"], path).toBe("Person");
              if ("name" in v) {
                expect(v.name, path).toBe("Bhupesh Roushan");
                expect(v.url, path).toBe(`${SITE}/`);
              } else {
                // A bare reference is only meaningful beside the block it points at.
                expect(hasFullPerson, path).toBe(true);
              }
            }
          }
        }
      });
    });
  }
});

describe("home", () => {
  const [person, website, profile] = homeBlocks(data);
  const current = data.journey[0];

  it("emits Person, WebSite and ProfilePage", () => {
    expect([person, website, profile].map((b) => b["@type"])).toEqual(["Person", "WebSite", "ProfilePage"]);
    expect(homeBlocks(data)).toHaveLength(3);
  });

  it("states the current role exactly as the journey does", () => {
    expect(current.current).toBe(true);
    expect(person.jobTitle).toBe(current.role);
    expect(person.worksFor).toEqual({ "@type": "Organization", name: current.company });
  });

  it("omits jobTitle and worksFor when no role is current", () => {
    const [p] = homeBlocks({ ...data, journey: data.journey.map((j) => ({ ...j, current: false })) });
    expect(p).not.toHaveProperty("jobTitle");
    expect(p).not.toHaveProperty("worksFor");
  });

  it("takes the address from the hiring card", () => {
    expect(data.hiring.location).toBe("Bangalore, India");
    expect(person.address).toEqual({
      "@type": "PostalAddress",
      addressLocality: "Bangalore",
      addressCountry: "IN",
    });
  });

  it("uses the contact address as a plain email, without a mailto: prefix", () => {
    expect(person.email).toBe(data.email);
    expect(person.email).not.toMatch(/^mailto:/);
  });

  it("lists the social profiles the navbar links to", () => {
    const navbar = readFileSync(resolve(root, "src/components/Navbar.jsx"), "utf8");
    const socials = navbar.slice(navbar.indexOf("const SOCIALS"), navbar.indexOf("];", navbar.indexOf("const SOCIALS")));
    const hrefs = [...socials.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toHaveLength(4);
    expect([...person.sameAs].sort()).toEqual([...hrefs].sort());
    expect([...SOCIAL_PROFILES].sort()).toEqual([...hrefs].sort());
  });

  it("knows about the skills on the page, and not the tools", () => {
    const names = data.skillGroups.flatMap((g) => g.items.map((i) => i.name));
    for (const topic of person.knowsAbout) expect(names).toContain(topic);
    expect(person.knowsAbout).toContain("React.js");
    expect(person.knowsAbout).toContain("Prompt Engineering");
    expect(person.knowsAbout).not.toContain("VS Code");
    expect(new Set(person.knowsAbout).size).toBe(person.knowsAbout.length);
  });

  it("does not present the social card as a photo of the person", () => {
    expect(person).not.toHaveProperty("image");
  });

  it("describes the site and points its author, and the profile its subject, at the one person", () => {
    expect(website).toMatchObject({ url: `${SITE}/`, inLanguage: "en" });
    expect(website.name).toBeTruthy();
    expect(website.author["@id"]).toBe(PERSON_ID);
    expect(profile.mainEntity["@id"]).toBe(person["@id"]);
    expect(profile.isPartOf["@id"]).toBe(website["@id"]);
  });
});

describe("project pages", () => {
  const byId = Object.fromEntries(projects.map((p) => [p.id, p]));

  it("covers every project", () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it("gives Atlas no url, no repository and no publication date", () => {
    const atlas = blocksFor(byId.atlas);
    const app = atlas[0];
    expect(app["@type"]).toBe("SoftwareApplication");
    expect(app).not.toHaveProperty("url");
    expect(app).not.toHaveProperty("datePublished");
    expect(ofType(atlas, "SoftwareSourceCode")).toBeUndefined();
    expect(JSON.stringify(atlas)).not.toContain("codeRepository");
    expect(JSON.stringify(atlas)).not.toContain("github.com");
  });

  for (const project of projects.filter((p) => p.id !== "atlas")) {
    describe(project.id, () => {
      const blocks = blocksFor(project);
      const app = blocks[0];
      const source = ofType(blocks, "SoftwareSourceCode");

      it("is a web application at its live address", () => {
        expect(project.href).toBeTruthy();
        expect(app["@type"]).toBe("WebApplication");
        expect(app.url).toBe(project.href);
      });

      it("has a code repository block only because it has a repo", () => {
        if (project.repo) {
          expect(source.codeRepository).toBe(project.repo);
          expect(source.targetProduct["@id"]).toBe(app["@id"]);
        } else {
          expect(source).toBeUndefined();
        }
      });
    });
  }

  it("has a name, description, image, author, keywords and the page it is the subject of", () => {
    for (const project of projects) {
      const app = blocksFor(project)[0];
      expect(app.name).toBe(project.title);
      expect(app.description).toBe(project.summary ?? project.bullets[0]);
      expect(app.image).toBe(ogImage(`project-${project.id}`));
      expect(app.author["@id"]).toBe(PERSON_ID);
      expect(app.keywords).toBe(project.stack.join(", "));
      expect(app.mainEntityOfPage["@id"]).toBe(`${SITE}/projects/${project.id}`);
      expect(app["@id"]).toBe(`${SITE}/projects/${project.id}#project`);
    }
  });

  it("dates a project only when its period gives a month and a year", () => {
    for (const project of projects) {
      const app = blocksFor(project)[0];
      if (app.dateCreated !== undefined) {
        expect(app.dateCreated).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
        expect(app.dateCreated).toBe(parsePeriodStart(project.period));
      } else {
        expect(parsePeriodStart(project.period)).toBeUndefined();
      }
      expect(app).not.toHaveProperty("datePublished");
    }
    expect(blocksFor(byId.cloudwatch)[0].dateCreated).toBe("2026-02");
    expect(blocksFor(byId.atlas)[0].dateCreated).toBe("2026-07");
    expect(blocksFor(byId.hourglass)[0]).not.toHaveProperty("dateCreated");
  });

  it("sets an application category only where the tagline supports one", () => {
    expect(blocksFor(byId.buildingblocks)[0].applicationCategory).toBe("EducationalApplication");
    expect(blocksFor(byId.hourglass)[0].applicationCategory).toBe("SocialNetworkingApplication");
    expect(blocksFor(byId.cubekit)[0]).not.toHaveProperty("applicationCategory");
    expect(blocksFor(byId.pictelai)[0]).not.toHaveProperty("applicationCategory");
  });

  it("links to the project's write-ups, and only to ones that exist", () => {
    const app = blocksFor(byId.atlas)[0];
    const listed = byId.atlas.caseStudies.map((c) => `${SITE}/writing/${c.id}`);
    expect(app.subjectOf.map((s) => s.url)).toEqual(listed);
    expect(() => projectBlocks(byId.atlas, { image: "x", studies: {} })).toThrow(/unknown case study/);
  });

  it("orders the breadcrumbs Home, Projects, project, with positions from 1", () => {
    for (const project of projects) {
      const crumbs = ofType(blocksFor(project), "BreadcrumbList").itemListElement;
      expect(crumbs.map((c) => c.position)).toEqual([1, 2, 3]);
      expect(crumbs.map((c) => c.name)).toEqual(["Home", "Projects", project.title]);
      expect(crumbs[0].item).toBe(`${SITE}/`);
      expect(crumbs[1].item).toBe(`${SITE}/#projects`);
      expect(crumbs[2].item).toBe(`${SITE}/projects/${project.id}`);
    }
  });

  it("keeps url on this site except for the project's own live address", () => {
    for (const project of projects) {
      for (const b of blocksFor(project)) {
        for (const [path, v] of walk(b)) {
          if (path.split(".").pop() === "url" && typeof v === "string" && v !== project.href) {
            expect(v.startsWith(`${SITE}/`), path).toBe(true);
          }
        }
      }
    }
  });
});

describe("write-up pages", () => {
  const entries = Object.entries(caseStudies);

  it("covers every write-up", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  for (const [id, study] of entries) {
    describe(id, () => {
      const [article, trail] = writingBlocks(id, study, { image: ogImage(`writing-${id}`) });

      it("is a TechArticle with the study's own headline, description, tags and image", () => {
        expect(article["@type"]).toBe("TechArticle");
        expect(article.headline).toBe(study.title);
        expect(article.headline.length).toBeLessThanOrEqual(110);
        expect(article.description).toBe(study.dek);
        expect(article.keywords).toBe(study.tags.join(", "));
        expect(article.image).toBe(ogImage(`writing-${id}`));
        expect(article.url).toBe(`${SITE}/writing/${id}`);
        expect(article.inLanguage).toBe("en");
      });

      it("counts words and reading time with readingTime.js", () => {
        expect(article.wordCount).toBe(studyWords(study));
        expect(article.timeRequired).toMatch(/^PT\d+M$/);
        expect(article.timeRequired).toBe(`PT${parseInt(readingTime(study), 10)}M`);
        expect(article.timeRequired).toBe(isoDuration(study));
      });

      it("dates it by its month, modified the same day because nothing records an edit", () => {
        expect(article.datePublished).toBe(study.published);
        expect(article.datePublished).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
        expect(article.dateModified).toBe(article.datePublished);
      });

      it("names the project it is about, and that project exists", () => {
        expect(article.articleSection).toBe(study.project);
        const project = projects.find((p) => p.id === study.projectId);
        expect(project?.title).toBe(study.project);
        expect(article.about["@id"]).toBe(`${SITE}/projects/${study.projectId}#project`);
        expect(article.about.url).toBe(`${SITE}/projects/${study.projectId}`);
      });

      it("belongs to the blog and is by and published by the one person", () => {
        expect(article.isPartOf["@id"]).toBe(BLOG_ID);
        expect(article.isPartOf.url).toBe(`${SITE}/writing`);
        expect(article.author["@id"]).toBe(PERSON_ID);
        expect(article.publisher["@id"]).toBe(PERSON_ID);
      });

      it("orders the breadcrumbs Home, Writing, write-up", () => {
        const crumbs = trail.itemListElement;
        expect(trail["@type"]).toBe("BreadcrumbList");
        expect(crumbs.map((c) => c.position)).toEqual([1, 2, 3]);
        expect(crumbs.map((c) => c.name)).toEqual(["Home", "Writing", study.title]);
        expect(crumbs.map((c) => c.item)).toEqual([`${SITE}/`, `${SITE}/writing`, `${SITE}/writing/${id}`]);
      });
    });
  }

  it("agrees with the project pages about which write-ups a project has", () => {
    for (const project of projects) {
      for (const { id } of project.caseStudies ?? []) {
        expect(caseStudies[id].projectId).toBe(project.id);
      }
    }
  });
});

describe("writing index", () => {
  const blocks = writingIndexBlocks(caseStudies, { description: "About the writing.", image: ogImage("writing") });
  const [blog, collection, trail] = blocks;

  it("emits a Blog, a CollectionPage and breadcrumbs", () => {
    expect(blocks.map((b) => b["@type"])).toEqual(["Blog", "CollectionPage", "BreadcrumbList"]);
    expect(blog["@id"]).toBe(BLOG_ID);
    expect(collection.url).toBe(`${SITE}/writing`);
  });

  it("lists every write-up exactly once, newest first, numbered from 1", () => {
    const list = collection.mainEntity;
    expect(list["@type"]).toBe("ItemList");
    expect(list.numberOfItems).toBe(Object.keys(caseStudies).length);
    expect(list.itemListElement.map((i) => i.position)).toEqual(list.itemListElement.map((_, i) => i + 1));
    expect(list.itemListElement.map((i) => i.url).sort()).toEqual(
      Object.keys(caseStudies).map((id) => `${SITE}/writing/${id}`).sort()
    );
    const dates = list.itemListElement.map((i) => {
      const id = i.url.split("/").pop();
      return caseStudies[id].published;
    });
    expect(dates).toEqual([...dates].sort().reverse());
    for (const item of list.itemListElement) expect(item.name).toBeTruthy();
  });

  it("orders the breadcrumbs Home, Writing", () => {
    expect(trail.itemListElement.map((c) => c.name)).toEqual(["Home", "Writing"]);
    expect(trail.itemListElement.map((c) => c.position)).toEqual([1, 2]);
  });
});

describe("parsePeriodStart", () => {
  it.each([
    ["February 2026", "2026-02"],
    ["January 2025", "2025-01"],
    ["July–August 2026", "2026-07"],
    ["May 2026 - Present", "2026-05"],
    ["Feb 2023 - March 2023", "2023-02"],
    ["Dec 2025 - Feb 2026", "2025-12"],
  ])("%s -> %s", (period, expected) => {
    expect(parsePeriodStart(period)).toBe(expected);
  });

  it.each([[undefined], [""], ["Summer 2026"], ["2026"], ["Present"]])("reads %j as no date", (period) => {
    expect(parsePeriodStart(period)).toBeUndefined();
  });
});

describe("HTML output", () => {
  const hostile = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: 'A </script><script>alert(1)</script> <!-- title & "quotes" $& $1 \u2028',
  };

  it("escapes markup so the text cannot end the script element", () => {
    const tag = jsonLdScript(hostile);
    expect(tag.match(/<\/script>/g)).toHaveLength(1);
    expect(tag).not.toContain("<!--");
    expect(tag).not.toContain("\u2028");
    const json = tag.replace(/^\s*<script type="application\/ld\+json">/, "").replace(/<\/script>\s*$/, "");
    expect(JSON.parse(json)).toEqual(hostile);
  });

  it("injects before </head> and keeps $ sequences in the data literal", () => {
    const html = injectJsonLd("<html><head><title>x</title></head><body></body></html>", [hostile]);
    expect(html.indexOf("application/ld+json")).toBeLessThan(html.indexOf("</head>"));
    expect(html).toContain("$& $1");
    expect(html.match(/<\/head>/g)).toHaveLength(1);
  });

  it("refuses a block without @context or @type, and a page without a head", () => {
    expect(() => jsonLdScript({ "@type": "Person" })).toThrow();
    expect(() => jsonLdScript({ "@context": "https://schema.org" })).toThrow();
    expect(() => injectJsonLd("<body></body>", [hostile])).toThrow(/head/);
  });

  it("strips previously injected blocks so a second run cannot duplicate them", () => {
    const bare = "<html><head><title>x</title>\n  </head><body></body></html>";
    const once = injectJsonLd(bare, [hostile]);
    expect(once).not.toBe(bare);
    expect(stripJsonLd(once)).toBe(bare);
    expect(stripJsonLd(injectJsonLd(stripJsonLd(once), [hostile]))).toBe(bare);
  });
});

describe("loadSiteData", () => {
  it("reads the real data modules, including the ones that import images and icons", () => {
    expect(projects.map((p) => p.id)).toContain("atlas");
    expect(data.journey[0].current).toBe(true);
    expect(data.skillGroups.length).toBeGreaterThan(0);
    expect(data.hiring.location).toBeTruthy();
    expect(data.email).toMatch(/@/);
  });
});
