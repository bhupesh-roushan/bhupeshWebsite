import { describe, it, expect } from "vitest";
import { projects } from "../src/data/portfolio.js";
import { skillGroups } from "../src/data/skills.js";
import { hiring } from "../src/data/hiring.js";
import { ROLES, roleBySlug } from "../src/data/roles.js";
import { techKey } from "../src/lib/tech.js";
import {
  rankProjects,
  scoreProject,
  packRows,
  skillFits,
  describeMatch,
  heroRoles,
  STRONG_AT,
} from "../src/lib/roleFit.js";

/** @typedef {import("../src/data/types").Role} Role */
/** @typedef {import("../src/data/types").Project} Project */

/** @param {string} slug */
const ids = (slug) => rankProjects(projects, slug).entries.map((e) => e.project.id);
const original = projects.map((p) => p.id);

/**
 * A role that has to exist: roleBySlug answers null for an unknown slug, which
 * would fail later and less clearly inside the test that wanted the role.
 * @param {string} slug
 * @returns {Role}
 */
const roleNamed = (slug) => {
  const role = roleBySlug(slug);
  if (!role) throw new Error(`no role "${slug}" in roles.js`);
  return role;
};

describe("techKey", () => {
  it("folds the spellings the data actually uses", () => {
    expect(techKey("Node.js")).toBe(techKey("Node"));
    expect(techKey("Next.js 15")).toBe(techKey("Next.js 16"));
    expect(techKey("React 19")).toBe(techKey("React.js"));
    expect(techKey("Express")).toBe(techKey("Express.js"));
    expect(techKey("REST API")).toBe(techKey("REST APIs"));
    expect(techKey("Google Gemini API")).toBe(techKey("Gemini API"));
    expect(techKey("Supabase (BaaS)")).toBe(techKey("Supabase"));
    expect(techKey("Claude API")).toBe(techKey("Claude"));
  });

  it("keeps different technologies apart", () => {
    expect(techKey("Java")).not.toBe(techKey("JavaScript"));
    expect(techKey("Redux")).not.toBe(techKey("Redux Toolkit"));
  });
});

describe("roles", () => {
  it("covers every role in hiring.openTo, by its exact label", () => {
    expect(ROLES.map((r) => r.label).sort()).toEqual([...hiring.openTo].sort());
  });

  it("resolves slugs case-insensitively and ignores anything else", () => {
    expect(roleBySlug("Backend")?.slug).toBe("backend");
    expect(roleBySlug(" ai ")?.slug).toBe("ai");
    for (const bad of ["", "cto", "__proto__", null, undefined, "backend,ai"]) {
      expect(roleBySlug(bad)).toBeNull();
    }
  });
});

describe("rankProjects on the real portfolio", () => {
  it("returns every project exactly once, for every role", () => {
    for (const { slug } of ROLES) {
      expect([...ids(slug)].sort()).toEqual([...original].sort());
    }
  });

  it("puts a project that matches the role ahead of one that matches nothing", () => {
    for (const { slug } of ROLES) {
      const { entries } = rankProjects(projects, slug);
      const best = entries.findIndex((e) => e.matched.length > 0);
      const lastMatch = entries.map((e) => e.matched.length > 0).lastIndexOf(true);
      expect(best).toBe(0);
      expect(lastMatch).toBeGreaterThan(0);
    }
  });

  // The order the real data produces, per role. If a project's stack or a role's
  // keywords change, this is the line that should change with it.
  it.each([
    ["sde", "atlas cloudwatch buildingblocks hourglass cubekit frequencii pictelai"],
    ["fullstack", "hourglass buildingblocks atlas cloudwatch cubekit frequencii pictelai"],
    ["backend", "atlas cloudwatch hourglass buildingblocks cubekit frequencii pictelai"],
    ["ai", "atlas cloudwatch pictelai cubekit frequencii buildingblocks hourglass"],
  ])("orders the projects for %s", (slug, expected) => {
    expect(ids(slug).join(" ")).toBe(expected);
  });

  it("explains each position: the leaders are there for named technologies", () => {
    /** @param {string} slug */
    const byId = (slug) =>
      Object.fromEntries(rankProjects(projects, slug).entries.map((e) => [e.project.id, e]));
    expect(byId("backend").atlas.matched).toEqual(["Node.js", "BullMQ", "Redis", "MongoDB", "Docker"]);
    expect(byId("ai").atlas.matched).toEqual(["vLLM", "Ollama", "OpenAI API", "Claude API", "OpenRouter"]);
    expect(byId("ai").atlas.strong).toBe(true);
    // one Gemini call is a match, not a strong one
    expect(byId("ai").pictelai.matched).toEqual(["Google Gemini API"]);
    expect(byId("ai").pictelai.strong).toBe(false);
  });

  it("does not call a frontend-only stack full stack, however long", () => {
    const { entries } = rankProjects(projects, "fullstack");
    const strong = entries.filter((e) => e.strong).map((e) => e.project.id);
    expect(strong).toEqual(["hourglass", "buildingblocks", "atlas", "cloudwatch"]);
  });

  it("counts, for the banner, the projects that match at all", () => {
    expect(rankProjects(projects, "ai").matchCount).toBe(3);
    expect(rankProjects(projects, "backend").matchCount).toBe(5);
  });

  it("is deterministic", () => {
    for (const { slug } of ROLES) expect(ids(slug)).toEqual(ids(slug));
  });

  it("marks a project strong only when its own stack names enough of the role", () => {
    for (const { slug } of ROLES) {
      for (const e of rankProjects(projects, slug).entries) {
        if (e.strong) expect(e.matched.length).toBeGreaterThanOrEqual(STRONG_AT);
        // every claimed match is really in the stack, as written
        for (const t of e.matched) expect(e.project.stack).toContain(t);
      }
    }
  });
});

describe("rankProjects with no usable role", () => {
  it.each([undefined, null, "", "cto", "BACKEND!"])("leaves the order and marks alone for %s", (bad) => {
    const { entries, matchCount, role } = rankProjects(projects, bad);
    expect(entries.map((e) => e.project.id)).toEqual(original);
    expect(entries.every((e) => !e.strong && e.matched.length === 0 && e.score === 0)).toBe(true);
    expect(matchCount).toBe(0);
    expect(role).toBeNull();
  });
});

describe("ties and empty stacks", () => {
  /**
   * @param {string} id
   * @param {string[]} stack
   * @param {string} [span]
   */
  const tile = (id, stack, span = "lg:col-span-2") => ({ id, stack, span });
  const backend = roleNamed("backend");

  it("keeps the original order between equal scores", () => {
    const list = [
      tile("a", ["Node.js"]),
      tile("b", ["Redis"]),
      tile("c", ["Express"]),
      tile("d", ["Figma"]),
      tile("e", ["MongoDB"]),
      tile("f", []),
    ];
    const order = rankProjects(list, backend).entries.map((e) => e.project.id);
    // a, b, c, e all score 1, d and f score 0: ties stay in the order given
    expect(order).toEqual(["a", "b", "c", "e", "d", "f"]);
  });

  it("scores a missing or empty stack as zero rather than throwing", () => {
    expect(scoreProject({ id: "x", stack: [] }, backend)).toEqual({ matched: [], groups: 0, score: 0 });
    expect(scoreProject({ id: "y" }, backend)).toEqual({ matched: [], groups: 0, score: 0 });
    expect(rankProjects([{ id: "y", span: "lg:col-span-6" }], "backend").entries).toHaveLength(1);
  });

  it("counts a technology once however many times, or in how many spellings, it appears", () => {
    const { matched } = scoreProject({ stack: ["Node", "Node.js", "node.js 20"] }, backend);
    expect(matched).toEqual(["Node"]);
  });

  it("gives a breadth role a point per group reached", () => {
    const sde = roleNamed("sde");
    const narrow = scoreProject({ stack: ["React", "Next.js"] }, sde); // 2 matches, 1 group
    const wide = scoreProject({ stack: ["React", "MongoDB"] }, sde); // 2 matches, 2 groups
    expect(wide.score).toBeGreaterThan(narrow.score);
  });
});

describe("packRows", () => {
  /** @param {number} n */
  const span = (n) => `lg:col-span-${n}`;
  /** @param {{ project: Project }[]} entries */
  const rowsOf = (entries) => {
    /** @type {string[][]} */
    const rows = [];
    let room = 6;
    /** @type {string[]} */
    let row = [];
    for (const e of entries) {
      const n = Number(/col-span-(\d)/.exec(e.project.span)?.[1]);
      row.push(e.project.id);
      room -= n;
      if (room === 0) {
        rows.push(row);
        row = [];
        room = 6;
      }
    }
    return { rows, leftover: row };
  };

  it("never leaves a gap in the real grid, for any role", () => {
    for (const { slug } of ROLES) {
      const { entries } = rankProjects(projects, slug);
      const { rows, leftover } = rowsOf(entries);
      expect(leftover).toEqual([]);
      expect(rows.flat()).toHaveLength(projects.length);
    }
  });

  it("keeps the original layout when nothing is ranked", () => {
    const { rows } = rowsOf(rankProjects(projects, "backend").entries);
    // Same tiling as the data: the multiset of row shapes is unchanged
    /** @param {string[][]} list */
    const shape = (list) =>
      list
        .map((r) => r.map((id) => projects.find((p) => p.id === id)?.span).join("|"))
        .sort();
    expect(shape(rows)).toEqual(
      shape(rowsOf(rankProjects(projects, null).entries).rows)
    );
  });

  it("fills each row in rank order and the best-ranked tile goes first", () => {
    const ranked = [
      { index: 0, project: { id: "a", span: span(3) } },
      { index: 1, project: { id: "b", span: span(2) } },
      { index: 2, project: { id: "c", span: span(2) } },
      { index: 3, project: { id: "d", span: span(3) } },
      { index: 4, project: { id: "e", span: span(2) } },
    ];
    // a(3) can't sit with b(2) — 1 column would be left — so it waits for d(3)
    const out = packRows(ranked).map((e) => e.project.id);
    expect(out[0]).toBe("a");
    expect(out.slice(0, 2)).toEqual(["a", "d"]);
    expect(out.slice(2)).toEqual(["b", "c", "e"]);
  });

  it("falls back to the given order when the spans cannot tile", () => {
    const ranked = [
      { index: 0, project: { id: "a", span: span(4) } },
      { index: 1, project: { id: "b", span: span(4) } },
    ];
    expect(packRows(ranked).map((e) => e.project.id)).toEqual(["a", "b"]);
  });

  it("leaves tiles without a desktop span alone", () => {
    const ranked = [
      { index: 0, project: { id: "a" } },
      { index: 1, project: { id: "b" } },
    ];
    expect(packRows(ranked)).toBe(ranked);
  });
});

describe("skillFits", () => {
  const names = skillGroups.flatMap((g) => g.items.map((i) => i.name));

  it("recognises the skills a role names, under their skill-grid spelling", () => {
    expect(skillFits("Node.js", "backend")).toBe(true);
    expect(skillFits("Express.js", "backend")).toBe(true);
    expect(skillFits("REST APIs", "backend")).toBe(true);
    expect(skillFits("JWT Auth", "backend")).toBe(true);
    expect(skillFits("LangChain", "ai")).toBe(true);
    expect(skillFits("LLM APIs", "ai")).toBe(true);
    expect(skillFits("React.js", "fullstack")).toBe(true);
  });

  it("does not light unrelated skills", () => {
    expect(skillFits("Figma", "backend")).toBe(false);
    expect(skillFits("Bootstrap", "ai")).toBe(false);
  });

  it("is false without a role, and lights something for every role", () => {
    expect(skillFits("Node.js", undefined)).toBe(false);
    expect(skillFits("Node.js", "nope")).toBe(false);
    for (const { slug } of ROLES) {
      const lit = names.filter((n) => skillFits(n, slug));
      expect(lit.length).toBeGreaterThan(0);
      expect(lit.length).toBeLessThan(names.length);
    }
  });
});

describe("describeMatch", () => {
  it("states the evidence plainly", () => {
    expect(describeMatch([])).toBe("");
    expect(describeMatch(["Node.js", "MongoDB", "Redis"])).toBe("Uses Node.js, MongoDB, Redis");
    expect(describeMatch(["a", "b", "c", "d", "e", "f"])).toBe("Uses a, b, c, d and 2 more");
  });
});

describe("heroRoles", () => {
  const list = ["Curriculum Engineer @ Masai", "Full Stack Developer", "AI Automation Engineer", "MERN Stack Developer"];

  it("is the list unchanged without a role", () => {
    expect(heroRoles(list, null)).toBe(list);
  });

  it("puts the role first without repeating what it already says", () => {
    expect(heroRoles(list, roleBySlug("fullstack"))).toEqual([
      "Full Stack Developer",
      "Curriculum Engineer @ Masai",
      "AI Automation Engineer",
      "MERN Stack Developer",
    ]);
    expect(heroRoles(list, roleBySlug("ai"))[0]).toBe("GenAI / AI Automation Engineer");
    expect(heroRoles(list, roleBySlug("ai"))).not.toContain("AI Automation Engineer");
    expect(heroRoles(list, roleBySlug("backend"))).toEqual(["Backend Engineer", ...list]);
  });
});
