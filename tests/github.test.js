import { describe, it, expect } from "vitest";
import { summarise } from "../api/github-activity.js";

/**
 * @param {string} name
 * @param {string | null} language
 * @param {string | null} pushed_at
 * @param {{ fork?: boolean }} [extra]
 */
const repo = (name, language, pushed_at, extra = {}) => ({ name, language, pushed_at, ...extra });

describe("summarise", () => {
  it("counts languages by repository and ranks them", () => {
    const out = summarise({ public_repos: 4 }, [
      repo("a", "JavaScript", "2026-08-01T00:00:00Z"),
      repo("b", "JavaScript", "2026-07-01T00:00:00Z"),
      repo("c", "TypeScript", "2026-06-01T00:00:00Z"),
      repo("d", "HTML", "2026-05-01T00:00:00Z"),
    ]);
    expect(out.languages).toEqual([
      { name: "JavaScript", count: 2, pct: 50 },
      { name: "HTML", count: 1, pct: 25 },
      { name: "TypeScript", count: 1, pct: 25 },
    ]);
    expect(out.publicRepos).toBe(4);
  });

  it("takes the latest push, whatever order the list arrives in", () => {
    const out = summarise(null, [
      repo("old", "JavaScript", "2025-01-01T00:00:00Z"),
      repo("new", "JavaScript", "2026-10-24T19:50:58Z"),
      repo("mid", "JavaScript", "2026-03-01T00:00:00Z"),
    ]);
    expect(out.lastPush).toEqual({ repo: "new", at: "2026-10-24T19:50:58Z" });
  });

  it("ignores forks for both language and activity", () => {
    const out = summarise({ public_repos: 2 }, [
      repo("mine", "JavaScript", "2026-01-01T00:00:00Z"),
      repo("someone-elses", "Python", "2026-10-01T00:00:00Z", { fork: true }),
    ]);
    expect(out.lastPush?.repo).toBe("mine");
    expect(out.languages.map((l) => l.name)).toEqual(["JavaScript"]);
  });

  it("falls back to the list length when the user object is missing", () => {
    expect(summarise(null, [repo("a", null, null), repo("b", null, null)]).publicRepos).toBe(2);
  });

  it("copes with nothing at all", () => {
    expect(summarise(null, [])).toEqual({ publicRepos: 0, languages: [], lastPush: null });
    expect(summarise(null, undefined)).toEqual({ publicRepos: 0, languages: [], lastPush: null });
  });

  it("skips repositories with no language rather than counting them as one", () => {
    const out = summarise({ public_repos: 2 }, [repo("a", null, "2026-01-01T00:00:00Z"), repo("b", "Go", "2026-01-02T00:00:00Z")]);
    expect(out.languages).toEqual([{ name: "Go", count: 1, pct: 100 }]);
  });

  describe("with a per-repository language breakdown", () => {
    const repos = [repo("a", "JavaScript", "2026-08-01T00:00:00Z"), repo("b", "TypeScript", "2026-07-01T00:00:00Z")];
    const bytes = {
      a: { JavaScript: 7000, CSS: 2000, HTML: 1000 },
      b: { TypeScript: 8000, CSS: 2000 },
    };

    it("lists every language, weighted by bytes of code rather than repository count", () => {
      const out = summarise({ public_repos: 2 }, repos, bytes);
      expect(out.languages).toEqual([
        { name: "TypeScript", count: 1, pct: 40 },
        { name: "JavaScript", count: 1, pct: 35 },
        { name: "CSS", count: 2, pct: 20 },
        { name: "HTML", count: 1, pct: 5 },
      ]);
    });

    it("keeps a language that is a sliver of the code on the list, never as 0%", () => {
      const out = summarise(null, [repo("a", "JavaScript", null)], { a: { JavaScript: 1_000_000, Shell: 40 } });
      expect(out.languages.map((l) => l.name)).toEqual(["JavaScript", "Shell"]);
      expect(out.languages[1]?.pct).toBe(0.1);
    });

    it("ignores the bytes of forks", () => {
      const out = summarise(null, [repo("mine", "Go", null), repo("theirs", "Python", null, { fork: true })], {
        mine: { Go: 100 },
        theirs: { Python: 99999 },
      });
      expect(out.languages.map((l) => l.name)).toEqual(["Go"]);
    });

    it("falls back to counting primary languages when a repository is missing from the breakdown", () => {
      const out = summarise({ public_repos: 2 }, repos, { a: bytes.a });
      expect(out.languages).toEqual([
        { name: "JavaScript", count: 1, pct: 50 },
        { name: "TypeScript", count: 1, pct: 50 },
      ]);
    });
  });
});
