/**
 * schema.org JSON-LD for every page the build emits.
 *
 * Pure functions from the site's data to plain objects, so the output can be
 * tested without a build. The prerender script decides which page gets which
 * blocks and where they go in the HTML; nothing here touches the filesystem.
 *
 * Each page gets several small blocks rather than one @graph, and every block
 * carries its own @context and @type. A consumer that reads only the first
 * script tag, or only blocks with a top-level @type, still gets something
 * complete. The blocks point at each other by @id — the one person is
 * `https://www.bhupesh.blog/#person` whether they appear as the author of a
 * write-up or as the subject of the profile page.
 *
 * Search engines process each URL's markup on its own, so a block that only
 * said `{ "@id": ... }` would name nobody. Pages other than the home therefore
 * carry a minimal Person (type, @id, name, url) — enough to be an author — and
 * the full one, with sameAs and knowsAbout, lives only on the home page.
 *
 * Nothing is added that the data doesn't state. A property whose source is
 * absent is left out rather than filled in: a private project has no url and
 * no repository, and a project with no `period` has no date.
 */
import { readingTime, studyWords } from "../src/lib/readingTime.js";

export const SITE = "https://www.bhupesh.blog";
const CONTEXT = "https://schema.org";
const LANGUAGE = "en";
const NAME = "Bhupesh Roushan";

export const PERSON_ID = `${SITE}/#person`;
export const WEBSITE_ID = `${SITE}/#website`;
export const BLOG_ID = `${SITE}/writing#blog`;

/** Mirrors the feed's channel title and description, so the blog is named the same everywhere. */
export const BLOG_NAME = "Writing — Bhupesh Roushan";
export const BLOG_DESCRIPTION = "Engineering decisions written up from the commits that record them.";

/**
 * The same four links as SOCIALS in src/components/Navbar.jsx. That is a JSX
 * component and can't be imported from Node, so the list is repeated here and
 * tests/structured-data.test.js fails if the two ever differ.
 */
export const SOCIAL_PROFILES = [
  "https://github.com/bhupesh-roushan",
  "https://www.linkedin.com/in/roushanb",
  "https://x.com/roushanwa",
  "https://www.instagram.com/roushanwa",
];

/**
 * applicationCategory is a closed list on Google's side, so it is set only
 * where the project's own tagline (or, for Atlas, the summary that follows it)
 * says what kind of application it is. Cubekit's "Hiring Platform" and
 * PictelAI's "Powered by Gemini" fit none of the categories honestly, so they
 * have none rather than the nearest wrong one.
 */
const APPLICATION_CATEGORY = {
  atlas: "EducationalApplication", // grades student submissions against rubrics
  cloudwatch: "ShoppingApplication", // "Digital Marketplace"
  buildingblocks: "EducationalApplication", // "Learning Management System"
  hourglass: "SocialNetworkingApplication", // "Social Media"
  frequencii: "ShoppingApplication", // "E-Commerce Prototype"
};

const COUNTRY_CODES = { India: "IN" };

export const projectUrl = (id) => `${SITE}/projects/${id}`;
export const writingUrl = (id) => `${SITE}/writing/${id}`;
export const WRITING_INDEX_URL = `${SITE}/writing`;
const projectNodeId = (id) => `${projectUrl(id)}#project`;
const articleNodeId = (id) => `${writingUrl(id)}#article`;

/**
 * Drop anything that would serialise as null, "" or an empty container.
 * JSON.stringify already omits undefined, but it keeps null — and a stray
 * `"url": null` is the sort of thing a validator reports and a human never sees.
 */
function compact(value) {
  if (Array.isArray(value)) {
    const items = value.map(compact).filter((v) => v !== undefined);
    return items.length ? items : undefined;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([k, v]) => [k, compact(v)])
      .filter(([, v]) => v !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  if (value === null || value === undefined || value === "") return undefined;
  return value;
}

const block = (type, props) => compact({ "@context": CONTEXT, "@type": type, ...props });

/** The minimal Person other blocks embed; see the header for why it isn't just an @id. */
const personRef = () => ({ "@type": "Person", "@id": PERSON_ID, name: NAME, url: `${SITE}/` });

const websiteRef = () => ({ "@type": "WebSite", "@id": WEBSITE_ID, url: `${SITE}/` });

function breadcrumbs(trail) {
  return block("BreadcrumbList", {
    itemListElement: trail.map(({ name, url }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: url,
    })),
  });
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/**
 * "February 2026" -> "2026-02". Returns undefined for anything it can't read as
 * a month and a year, because a guessed date is worse than none.
 *
 * Reads the first month and the year after it: "July–August 2026" started in
 * July 2026, and "May 2026 - Present" in May. A span that crosses a year
 * ("Dec 2025 - Feb 2026") still takes the first year, since the year is the
 * first four-digit number rather than the last.
 */
export function parsePeriodStart(period) {
  const m = /^([A-Za-z]+)(?:[\s–-]+[A-Za-z]+)?\s+(\d{4})\b/.exec(String(period ?? "").trim());
  if (!m) return undefined;
  const month = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
  if (month === -1) return undefined;
  return `${m[2]}-${String(month + 1).padStart(2, "0")}`;
}

/** "3 min" from readingTime() as ISO 8601: "PT3M". Derived, so the two cannot disagree. */
export function isoDuration(study) {
  return `PT${parseInt(readingTime(study), 10)}M`;
}

// ── Home ────────────────────────────────────────────────────────────────────

/**
 * Person, WebSite and ProfilePage for the home page.
 *
 * jobTitle and worksFor come from the journey's current entry, and only if it
 * is flagged current — when the role ends, the claim goes with it instead of
 * going stale. The address is the hiring card's "City, Country".
 */
export function homeBlocks({ journey, hiring, email, skillGroups }) {
  const current = journey.find((j) => j.current && j.kind === "Work");
  const [city, country] = String(hiring.location ?? "").split(",").map((s) => s.trim());
  const school = journey.find((j) => j.kind === "Education");

  // Topics rather than tools: "Tools & Others" is Git, VS Code and Postman,
  // which describe how the work is done, not what is known.
  const knowsAbout = [
    ...new Set(
      skillGroups.filter((g) => g.title !== "Tools & Others").flatMap((g) => g.items.map((i) => i.name))
    ),
  ];

  const person = block("Person", {
    "@id": PERSON_ID,
    name: NAME,
    url: `${SITE}/`,
    jobTitle: current?.role,
    worksFor: current && { "@type": "Organization", name: current.company },
    alumniOf: school && { "@type": "CollegeOrUniversity", name: school.company },
    address: city && {
      "@type": "PostalAddress",
      addressLocality: city,
      addressCountry: COUNTRY_CODES[country] ?? country,
    },
    email,
    sameAs: SOCIAL_PROFILES,
    knowsAbout,
  });

  const website = block("WebSite", {
    "@id": WEBSITE_ID,
    name: "bhupesh.blog",
    alternateName: NAME,
    url: `${SITE}/`,
    inLanguage: LANGUAGE,
    author: personRef(),
  });

  const profile = block("ProfilePage", {
    "@id": `${SITE}/#profile`,
    url: `${SITE}/`,
    name: NAME,
    inLanguage: LANGUAGE,
    isPartOf: websiteRef(),
    mainEntity: { "@type": "Person", "@id": PERSON_ID },
  });

  return [person, website, profile];
}

// ── Projects ────────────────────────────────────────────────────────────────

/**
 * One project page: the application, its source if it has any, and breadcrumbs.
 *
 * Type follows what the project is. A project with a live `href` is a
 * WebApplication and that address is its url; Atlas has neither a public
 * deployment nor a public repository, so it is a plain SoftwareApplication with
 * no url — claiming either would point a crawler at a login wall or a 404.
 *
 * Source code is its own SoftwareSourceCode node linked by targetProduct,
 * because codeRepository isn't a property of an application. `period` gives
 * dateCreated only: it records when the work was done, which is not when
 * anything was published, so there is no datePublished.
 *
 * `studies` is the CASE_STUDIES map, used to link a project to its write-ups.
 */
export function projectBlocks(project, { image, studies = {} }) {
  const { id, title, href, repo } = project;
  const url = projectUrl(id);
  const created = parsePeriodStart(project.period);
  const writeups = (project.caseStudies ?? []).map(({ id: sid }) => {
    const study = studies[sid];
    if (!study) throw new Error(`structured-data: project "${id}" lists unknown case study "${sid}"`);
    return { "@type": "TechArticle", "@id": articleNodeId(sid), headline: study.title, url: writingUrl(sid) };
  });

  const app = block(href ? "WebApplication" : "SoftwareApplication", {
    "@id": projectNodeId(id),
    name: title,
    // Atlas is the one project with a written summary; the rest are described
    // by their first bullet, which is how the page itself leads.
    description: project.summary ?? project.bullets?.[0],
    url: href,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image,
    applicationCategory: APPLICATION_CATEGORY[id],
    keywords: (project.stack ?? []).join(", "),
    dateCreated: created,
    inLanguage: LANGUAGE,
    author: personRef(),
    isPartOf: websiteRef(),
    subjectOf: writeups,
  });

  const source =
    repo &&
    block("SoftwareSourceCode", {
      "@id": `${url}#source`,
      name: `${title} source code`,
      description: `Source code repository for ${title}.`,
      codeRepository: repo,
      dateCreated: created,
      author: personRef(),
      targetProduct: { "@type": "SoftwareApplication", "@id": projectNodeId(id), name: title },
    });

  const trail = breadcrumbs([
    { name: "Home", url: `${SITE}/` },
    // There is no /projects index page; the section on the home page is the
    // closest real destination.
    { name: "Projects", url: `${SITE}/#projects` },
    { name: title, url },
  ]);

  return [app, source, trail].filter(Boolean);
}

// ── Writing ─────────────────────────────────────────────────────────────────

/**
 * One write-up: the TechArticle and breadcrumbs.
 *
 * datePublished is the study's month, kept at month precision because that is
 * all the source records. dateModified equals it: nothing tracks edits, and
 * claiming a later date would be invented. wordCount and timeRequired come
 * from the same functions that print the reading time on the page and in the
 * feeds.
 */
export function writingBlocks(id, study, { image }) {
  const url = writingUrl(id);
  const article = block("TechArticle", {
    "@id": articleNodeId(id),
    headline: study.title,
    description: study.dek,
    url,
    datePublished: study.published,
    dateModified: study.published,
    inLanguage: LANGUAGE,
    keywords: (study.tags ?? []).join(", "),
    articleSection: study.project,
    wordCount: studyWords(study),
    timeRequired: isoDuration(study),
    image,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: personRef(),
    publisher: personRef(),
    isPartOf: { "@type": "Blog", "@id": BLOG_ID, name: BLOG_NAME, url: WRITING_INDEX_URL },
    about: study.projectId && {
      "@type": "SoftwareApplication",
      "@id": projectNodeId(study.projectId),
      name: study.project,
      url: projectUrl(study.projectId),
    },
  });

  const trail = breadcrumbs([
    { name: "Home", url: `${SITE}/` },
    { name: "Writing", url: WRITING_INDEX_URL },
    { name: study.title, url },
  ]);

  return [article, trail];
}

/**
 * The /writing index: the blog, a collection page listing every write-up
 * newest first, and breadcrumbs. `studies` is the CASE_STUDIES map.
 */
export function writingIndexBlocks(studies, { description, image }) {
  const ordered = Object.entries(studies).sort(([, a], [, b]) => b.published.localeCompare(a.published));

  const blog = block("Blog", {
    "@id": BLOG_ID,
    name: BLOG_NAME,
    description: BLOG_DESCRIPTION,
    url: WRITING_INDEX_URL,
    inLanguage: LANGUAGE,
    author: personRef(),
    publisher: personRef(),
    isPartOf: websiteRef(),
  });

  const collection = block("CollectionPage", {
    "@id": `${WRITING_INDEX_URL}#collection`,
    name: "Writing",
    description,
    url: WRITING_INDEX_URL,
    inLanguage: LANGUAGE,
    image,
    isPartOf: websiteRef(),
    about: { "@type": "Blog", "@id": BLOG_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: ordered.length,
      itemListElement: ordered.map(([id, study], i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: writingUrl(id),
        name: study.title,
      })),
    },
  });

  const trail = breadcrumbs([
    { name: "Home", url: `${SITE}/` },
    { name: "Writing", url: WRITING_INDEX_URL },
  ]);

  return [blog, collection, trail];
}

// ── HTML ────────────────────────────────────────────────────────────────────

/**
 * A <script> element for one block.
 *
 * `<` is written as <, which is still the same JSON string but can never
 * form `</script>` or `<!--` inside the element — titles and bullets are
 * free text, and one stray tag would end the block early and spill the rest
 * into the page. U+2028/2029 are escaped for older parsers that treat them as
 * line breaks.
 */
export function jsonLdScript(data) {
  if (data?.["@context"] !== CONTEXT || typeof data["@type"] !== "string") {
    throw new Error("structured-data: a block needs @context and a single @type");
  }
  const json = JSON.stringify(data, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `    <script type="application/ld+json">\n${json}\n    </script>\n`;
}

const LD_BLOCK = /[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>[ \t]*\n?/g;

/**
 * Remove any JSON-LD already in the shell. Every page's markup is generated
 * from the data, so a copy left in index.html would sit beside the generated
 * one — and the project pages, which start from the home page's HTML, would
 * each claim to be a profile page.
 */
export const stripJsonLd = (html) => html.replace(LD_BLOCK, "");

/** Insert the blocks at the end of <head>. A function replacer, so `$&` in the text stays literal. */
export function injectJsonLd(html, blocks) {
  if (!html.includes("</head>")) throw new Error("structured-data: no </head> to inject into");
  const scripts = blocks.map(jsonLdScript).join("");
  return html.replace("</head>", () => `${scripts}  </head>`);
}
