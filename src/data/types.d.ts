// The shapes the data files promise, written down once.
//
// A declaration file rather than JSDoc @typedefs repeated at each use: the
// data modules, the build scripts and the tests all refer to the same names,
// and nothing here is emitted or imported at runtime — the .js files stay the
// source of truth for the values and this is only what the checker holds them to.
//
// Optional fields are the ones some entries genuinely lack (the three smaller
// projects have no `period` or `story`; the private repo has no `href`), not
// ones that merely might be added later.

import type { IconType } from "react-icons";

/** An "r,g,b" triple as a string, e.g. "45,212,191" — used inside rgb() and color-mix(). */
export type RgbTriplet = string;

// ── portfolio.js ────────────────────────────────────────────────────────────

export interface JourneyLink {
  href: string;
  label: string;
}

/** One entry in the experience / education / internship grid. */
export interface JourneyItem {
  id: string;
  /** "YYYY-MM" */
  start: string;
  /** "YYYY-MM", or null while the role is ongoing. */
  end: string | null;
  kind: "Work" | "Internship" | "Education";
  company: string;
  location: string;
  role: string;
  /** The human-readable range shown on the card. */
  period: string;
  current?: boolean;
  logo: string;
  logoClass: string;
  accent: RgbTriplet;
  /** Tailwind grid-span class for the bento layout. */
  span: string;
  stack: string[];
  bullets: string[];
  metricsNote?: string;
  link?: JourneyLink;
}

export interface CodeLink {
  label: string;
  href: string;
}

export interface Credential {
  label: string;
  value: string;
}

/** A write-up a project card points at; the full text lives in caseStudies.js. */
export interface CaseStudyRef {
  /** A key of CASE_STUDIES. */
  id: string;
  label: string;
  blurb: string;
}

export interface StoryOutcome {
  value: string;
  label: string;
}

/** Problem / approach / outcome in three lines. `outcome` is absent when no figure was recorded. */
export interface ProjectStory {
  problem: string;
  approach: string;
  outcome?: StoryOutcome[];
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  role: string;
  /** Who it was built for, when that is not obvious ("Built at Masai School"). */
  org?: string;
  summary?: string;
  period?: string;
  image: string;
  /** Hover preview loop, e.g. "/previews/cloudwatch.mp4". None are recorded yet. */
  video?: string;
  /** Live site. Absent for internal tooling. */
  href?: string;
  /** Public repository. Absent when the repo is private. */
  repo?: string;
  /** Stands in for href/repo when there is nothing to link to. */
  access?: string;
  accent: RgbTriplet;
  /** Large treatment in the bento grid. */
  featured?: boolean;
  /** Tailwind grid-span class for the bento layout. */
  span: string;
  story?: ProjectStory;
  stack: string[];
  bullets: string[];
  caseStudies?: CaseStudyRef[];
  codeLinks?: CodeLink[];
  /** Demo logins. Public by design — they are for a throwaway test account. */
  credentials?: Credential[];
  metricsNote?: string;
}

// ── skills.js ───────────────────────────────────────────────────────────────

export interface Skill {
  name: string;
  /** A react-icons component, not rendered JSX, so each consumer sizes it. */
  Icon: IconType;
  /** A hex colour, or a CSS variable such as "var(--icon-neutral)". */
  color: string;
}

export interface SkillGroup {
  title: string;
  /** Tailwind grid-span class for the bento layout. */
  span: string;
  accent: RgbTriplet;
  items: Skill[];
}

// ── caseStudies.js ──────────────────────────────────────────────────────────

export interface CompareRow {
  label: string;
  score: string;
  quote: string;
  /** Marks the "before" side that the write-up argues against. */
  bad?: boolean;
}

export interface Compare {
  caption: string;
  rows: CompareRow[];
}

/**
 * Rendered in a fixed order: body paragraphs, then the comparison, then the
 * bullet list, then the closing paragraphs. Every part but the heading is
 * optional because the sections use different subsets of it.
 */
export interface CaseStudySection {
  heading: string;
  body: string[];
  compare?: Compare;
  list?: string[];
  after?: string[];
}

export interface CaseStudy {
  /** Display name of the project. */
  project: string;
  /** A project `id` in portfolio.js. */
  projectId: string;
  accent: RgbTriplet;
  title: string;
  dek: string;
  /** "July 2026" */
  date: string;
  /** "YYYY-MM" — sorts, and becomes the feed date. */
  published: string;
  tags: string[];
  sections: CaseStudySection[];
  footnote: string;
}

// ── hiring.js ───────────────────────────────────────────────────────────────

export interface HiringConfig {
  noticePeriod: string;
  workMode: string;
  location: string;
  openTo: string[];
  experience: string;
  /** Empty string hides the line on the hero. */
  availability: string;
  /** Empty string hides the booking button. */
  bookingUrl: string;
}

// ── diagrams.js ─────────────────────────────────────────────────────────────

export interface DiagramNode {
  title: string;
  sub: string;
  /** Highlights the entry point of the request flow. */
  accent?: boolean;
  /** Links the box to the file it describes, where the repo is public. */
  href?: string;
}

/** One request-flow diagram: boxes grouped by layer, top to bottom. */
export interface DiagramSpec {
  layers: DiagramNode[][];
  /** Absent for the projects that have no database. */
  store?: string;
  /** What the arrows carry, which boxes alone cannot say. */
  note: string;
}
