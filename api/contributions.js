// Vercel serverless function.
//
// The public contribution proxy the client falls back to can only see public
// activity, which undercounts badly — the profile reads 332 for the last year
// while public-only sees 165, because most of the work sits in private repos.
//
// GitHub only exposes the real calendar through GraphQL, and that needs a
// token. A token cannot live in the client bundle, so it lives here instead:
// set GITHUB_TOKEN in the Vercel project's environment variables. It must be a
// PAT belonging to the profile itself — private contributions are only visible
// to the authenticated user.

/** @typedef {import("../types/api").ApiRequest} ApiRequest */
/** @typedef {import("../types/api").ApiResponse} ApiResponse */

/**
 * The part of GitHub's GraphQL reply this reads. `data.user` is null for a
 * login that does not exist, and `errors` replaces `data` on a bad query, so
 * both are optional rather than assumed.
 * @typedef {object} GitHubReply
 * @property {{ message: string }[]} [errors]
 * @property {{ user: null | { contributionsCollection: { contributionCalendar: {
 *   totalContributions: number,
 *   weeks: { contributionDays: { date: string, contributionCount: number, contributionLevel: string }[] }[]
 * } } } }} [data]
 */

const LOGIN = process.env.GITHUB_LOGIN || "bhupesh-roushan";

/** @type {Record<string, number>} */
const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

/**
 * @param {ApiRequest} _req  unused — this route takes no input
 * @param {ApiResponse} res
 */
export default async function handler(_req, res) {
  const token = process.env.GITHUB_TOKEN;

  // No token configured — tell the client to use its fallback rather than
  // pretending we have data.
  if (!token) {
    res.status(501).json({ error: "GITHUB_TOKEN not configured" });
    return;
  }

  try {
    const ghRes = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
    });

    if (!ghRes.ok) {
      res.status(502).json({ error: `GitHub responded ${ghRes.status}` });
      return;
    }

    /** @type {GitHubReply} */
    const json = await ghRes.json();
    if (json.errors?.length) {
      res.status(502).json({ error: json.errors[0].message });
      return;
    }

    const calendar =
      json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      res.status(502).json({ error: "unexpected GitHub response" });
      return;
    }

    const contributions = calendar.weeks.flatMap((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVELS[d.contributionLevel] ?? 0,
      }))
    );

    // Matches the shape the client already consumes from the public proxy.
    // Five minutes at the edge, not an hour with a day of grace. The graph is
    // the one number on the site people check right after pushing, and a day of
    // stale-while-revalidate meant the first visit after a quiet spell was served
    // yesterday's total. GitHub's GraphQL is cheap enough for one call per
    // five minutes, however many people are looking.
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=900"
    );
    res.status(200).json({
      total: { lastYear: calendar.totalContributions },
      contributions,
      source: "graphql",
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
