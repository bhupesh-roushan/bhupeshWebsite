// The GitHub profile numbers the site shows — public repo count, language mix,
// most recent public push — fetched here, with a token, instead of from the
// visitor's browser.
//
// Why it moved. The page used to call api.github.com directly from every
// visitor. Anonymous requests are capped at 60 an hour *per IP address*, and an
// office, a university or a phone carrier puts hundreds of people behind one
// address — so for exactly the audience that matters (a recruiter on a company
// network) the tiles read "0 public repos", "Last push —" and an empty language
// bar. The cap is also shared with whoever else on that network is hitting
// GitHub. Called from here it is the token's 5,000 an hour, and the edge cache
// below means GitHub is asked once every few minutes however many people look.
//
// GITHUB_TOKEN is the same variable api/contributions.js uses. It is optional
// here: without it this still works, unauthenticated, from Vercel's shared
// addresses, which is no worse than before.

/** @typedef {import("../types/api").ApiRequest} ApiRequest */
/** @typedef {import("../types/api").ApiResponse} ApiResponse */

/**
 * The fields of a GitHub repository this file reads.
 * @typedef {{ name: string, language?: string | null, pushed_at?: string | null, fork?: boolean }} Repo
 */

const LOGIN = process.env.GITHUB_LOGIN || "bhupesh-roushan";

/**
 * Reduce the two GitHub payloads to what the page shows. Pure, so it is tested
 * without a network.
 *
 * @param {{ public_repos?: number } | null} user
 * @param {Repo[] | undefined} repos  not an array when GitHub answers with an error object
 */
export function summarise(user, repos) {
  const list = Array.isArray(repos) ? repos : [];

  // A fork's language and push date are somebody else's work, and a fork
  // refreshed by "sync" would otherwise read as activity of mine.
  const own = list.filter((r) => !r.fork);

  /** @type {Record<string, number>} */
  const counts = {};
  own.forEach((r) => {
    if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const languages = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count, pct: total ? Math.round((count / total) * 100) : 0 }));

  const latest = own
    .filter((r) => r.pushed_at)
    .sort((a, b) => String(b.pushed_at).localeCompare(String(a.pushed_at)))[0];

  return {
    publicRepos: user?.public_repos ?? list.length,
    languages,
    lastPush: latest ? { repo: latest.name, at: latest.pushed_at } : null,
  };
}

/**
 * @param {ApiRequest} req
 * @param {ApiResponse} res
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "bhupesh.blog",
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  };

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${LOGIN}`, { headers, signal: AbortSignal.timeout(6000) }),
      fetch(`https://api.github.com/users/${LOGIN}/repos?per_page=100&sort=pushed&type=owner`, {
        headers,
        signal: AbortSignal.timeout(6000),
      }),
    ]);

    // Repos are the substance; the user object only adds the count. If the repo
    // list failed there is nothing worth caching, and the browser falls back.
    if (!reposRes.ok) {
      return res.status(502).json({ error: `GitHub responded ${reposRes.status}` });
    }

    const user = userRes.ok ? await userRes.json() : null;
    const repos = await reposRes.json();

    // Five minutes at the edge, then a quarter-hour of serving the old answer
    // while a fresh one is fetched: a push shows up quickly, and a GitHub
    // outage shows the last good numbers instead of blanks.
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
    return res.status(200).json(summarise(user, repos));
  } catch (err) {
    console.error("github-activity:", err instanceof Error ? err.message : err);
    return res.status(502).json({ error: "GitHub unavailable" });
  }
}
