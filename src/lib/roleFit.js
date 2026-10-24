// Recruiter mode, as arithmetic. Given a role and the portfolio's own data this
// answers three questions — how relevant is each project, which of its
// technologies are why, and which skills belong to the role — and nothing in it
// can say more than the data does: a project scores only for technologies its
// own `stack` lists.
//
// Pure on purpose (no React, no storage, no portfolio import): the projects are
// passed in, so the tests run it against the real data and against hand-made
// edge cases with the same code.

import { roleBySlug } from "../data/roles";
import { techKey } from "./tech";

/** @typedef {import("../data/types").Role} Role */

/**
 * The parts of a project this file reads. Everything is optional because the
 * tests (and any caller) may hand it a bare `{ stack }` or `{ span }`, and a
 * project with no stack is scored as zero rather than refused. A real
 * `Project` satisfies it.
 * @typedef {Partial<Pick<import("../data/types").Project, "id" | "stack" | "span">>} Rankable
 */

/**
 * One project against one role: see scoreProject.
 * @typedef {{ matched: string[], groups: number, score: number }} Fit
 */

/**
 * A project in a ranked list, with why it is where it is.
 * @template {Rankable} P
 * @typedef {{ project: P, index: number, matched: string[], score: number, strong: boolean }} RankedEntry
 */

const ROW = 6; // the bento grid's column count at lg

/**
 * keyword key -> the groups it belongs to, for one role.
 * @param {Role} role
 * @returns {Map<string, Set<number>>}
 */
function indexRole(role) {
  /** @type {Map<string, Set<number>>} */
  const byKey = new Map();
  role.groups.forEach((group, g) => {
    for (const kw of group.keywords) {
      const key = techKey(kw);
      let groups = byKey.get(key);
      if (!groups) byKey.set(key, (groups = new Set()));
      groups.add(g);
    }
  });
  return byKey;
}

// Roles are static, so each is indexed once.
/** @type {WeakMap<Role, Map<string, Set<number>>>} */
const indexes = new WeakMap();
/** @param {Role} role */
const indexFor = (role) => {
  let index = indexes.get(role);
  if (!index) indexes.set(role, (index = indexRole(role)));
  return index;
};

/**
 * One project against one role.
 *
 * `matched` is the project's own stack entries (as written, so "Claude API" not
 * the keyword "Claude") that are on the role's list, once per technology.
 * `score` is the count of those, plus — for roles marked `breadth` — one point
 * for every keyword group the stack reaches (`groups` says how many).
 *
 * @param {Rankable} project
 * @param {Role} role
 * @returns {Fit}
 */
export function scoreProject(project, role) {
  const index = indexFor(role);
  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {string[]} */
  const matched = [];
  /** @type {Set<number>} */
  const groups = new Set();
  for (const tech of project.stack ?? []) {
    const key = techKey(tech);
    if (seen.has(key) || !index.has(key)) continue;
    seen.add(key);
    matched.push(tech);
    index.get(key)?.forEach((g) => groups.add(g));
  }
  return { matched, groups: groups.size, score: matched.length + (role.breadth ? groups.size : 0) };
}

/**
 * What earns the "Strong match" marker: three technologies of the role's, and —
 * for a breadth role — from at least two of its groups. The second condition is
 * what stops a three-library frontend counting as "full stack".
 */
export const STRONG_AT = 3;
/**
 * @param {Role} role
 * @param {Pick<Fit, "matched" | "groups">} fit
 */
export const isStrong = (role, { matched, groups }) =>
  matched.length >= STRONG_AT && (!role.breadth || groups >= 2);

/**
 * "lg:col-span-3" -> 3. Null when a tile declares no desktop span.
 * @param {Rankable} project
 */
const spanOf = (project) => {
  const m = /(?:^|\s)lg:col-span-(\d+)/.exec(project.span ?? "");
  return m ? Number(m[1]) : null;
};

/**
 * Re-flow a ranked list into whole rows of the 6-column grid.
 *
 * The cards keep their own spans (3+3, 2+2+2, 4+2 ...), so putting them in
 * pure score order would strand a lone 3 beside a 2 and leave a hole at lg.
 * Instead the first position goes to the best-ranked card, and each position
 * after it to the best-ranked card that still lets every row close exactly —
 * a depth-first search, which for a dozen tiles is instant. A row is only ever
 * filled in rank order, never reshuffled by size.
 *
 * If the spans can't tile (or the search is cut off) the original order is
 * returned: that is always the layout the data was written to fit.
 *
 * @template {{ project: Rankable, index: number }} E
 * @param {E[]} ranked  best first
 * @returns {E[]}
 */
export function packRows(ranked) {
  const declared = ranked.map((e) => spanOf(e.project));
  if (declared.some((s) => s === null || s > ROW)) return ranked;
  // The check above returned if any span was null, which the type can't follow.
  const spans = /** @type {number[]} */ (declared);

  const n = ranked.length;
  /** @type {boolean[]} */
  const used = new Array(n).fill(false);
  /** @type {number[]} */
  const order = [];
  let budget = 50_000;

  /** @param {number} room  columns left in the row being filled */
  const place = (room) => {
    if (order.length === n) return room === ROW;
    if (--budget < 0) return false;
    for (let i = 0; i < n; i++) {
      if (used[i] || spans[i] > room) continue;
      used[i] = true;
      order.push(i);
      const left = room - spans[i];
      if (place(left === 0 ? ROW : left)) return true;
      used[i] = false;
      order.pop();
    }
    return false;
  };

  if (!place(ROW)) return [...ranked].sort((a, b) => a.index - b.index);
  return order.map((i) => ranked[i]);
}

/**
 * The projects in the order to show them, each with why.
 *
 * With no role, or one that isn't recognised, the list comes back exactly as
 * given — same order, nothing marked — so callers need no special case.
 *
 * @template {Rankable} P
 * @param {P[]} projects
 * @param {Role | string | null | undefined} roleOrSlug  a role, or the `?role=` value
 * @returns {{ entries: RankedEntry<P>[], matchCount: number, role: Role | null }}
 */
export function rankProjects(projects, roleOrSlug) {
  const role = typeof roleOrSlug === "string" ? roleBySlug(roleOrSlug) : roleOrSlug ?? null;

  const entries = projects.map((project, index) => {
    if (!role) return { project, index, matched: [], score: 0, strong: false };
    const fit = scoreProject(project, role);
    return { project, index, matched: fit.matched, score: fit.score, strong: isStrong(role, fit) };
  });
  if (!role) return { entries, matchCount: 0, role: null };

  // Array.prototype.sort is stable, but ties are broken on `index` explicitly so
  // the guarantee doesn't rest on an engine detail.
  const ranked = [...entries].sort((a, b) => b.score - a.score || a.index - b.index);
  return {
    entries: packRows(ranked),
    matchCount: entries.filter((e) => e.matched.length > 0).length,
    role,
  };
}

/**
 * Whether a skill from the skills grid is one the role's list names.
 * @param {string} skillName
 * @param {Role | string | null | undefined} roleOrSlug
 */
export function skillFits(skillName, roleOrSlug) {
  const role = typeof roleOrSlug === "string" ? roleBySlug(roleOrSlug) : roleOrSlug;
  return Boolean(role && indexFor(role).has(techKey(skillName)));
}

/**
 * "Uses Node.js, MongoDB, Redis and 2 more" — the evidence behind a marker.
 * @param {string[]} matched
 * @param {number} [max]
 */
export function describeMatch(matched, max = 4) {
  if (!matched.length) return "";
  const shown = matched.slice(0, max).join(", ");
  const rest = matched.length - max;
  return rest > 0 ? `Uses ${shown} and ${rest} more` : `Uses ${shown}`;
}

/**
 * The hero's rotating roles with the chosen one first. Entries the role's label
 * already says ("Full Stack Developer" inside itself, "AI Automation Engineer"
 * inside "GenAI / AI Automation Engineer") are dropped, so it isn't shown twice.
 *
 * @param {string[]} list
 * @param {Role | null | undefined} role
 */
export function heroRoles(list, role) {
  if (!role) return list;
  const label = role.label.toLowerCase();
  return [role.label, ...list.filter((r) => !label.includes(r.toLowerCase()))];
}
