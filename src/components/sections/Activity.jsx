import { useEffect, useState } from "react";
import { RevealOnScroll } from "../RevealOnScroll";
import { BentoGrid, BentoCard } from "../ui/BentoGrid";
import { GithubHeatmap } from "../GithubHeatmap";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { LuArrowUpRight, LuBook, LuGitBranch, LuFlame, LuCalendar } from "react-icons/lu";

const USER = "bhupesh-roushan";

// LinkedIn is curated, not fetched. Their public profile pages answer 999 to
// anything unauthenticated, and api.linkedin.com needs an OAuth token that only
// ever returns the *authenticated* user's own profile — behind partner approval
// and unreachable from a browser anyway. So this stays hand-maintained, and the
// heading doesn't claim it's live.
const LINKEDIN = {
  url: "https://www.linkedin.com/in/roushanb",
  handle: "in/roushanb",
  headline: "Curriculum Engineer @ Masai",
  location: "Bangalore, India",
  focus: [
    "Full Stack Development",
    "GenAI & Automation",
    "Assessment Design",
    "MERN Stack",
  ],
};

// Contributions live only in GitHub's GraphQL API, which needs a token — and a
// static site can't hold one without shipping it in the bundle. This public
// proxy needs no auth, at the cost of seeing public contributions only.
const CONTRIB_URL = `https://github-contributions-api.jogruber.de/v4/${USER}?y=last`;
const USER_URL = `https://api.github.com/users/${USER}`;
const REPOS_URL = `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`;

// Unauthenticated api.github.com allows 60 requests/hour per IP, so cache the
// answer for the session rather than refetching on every mount.
const CACHE_KEY = "gh-activity-v1";

const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  Java: "#b07219",
  Shell: "#89e051",
};

const parseDay = (iso) => new Date(`${iso}T00:00:00`);

/** Longest run of consecutive days with at least one contribution. */
function longestStreak(days) {
  let best = 0;
  let run = 0;
  days.forEach((d) => {
    if (d.count > 0) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  });
  return best;
}

export const Activity = () => {
  const [data, setData] = useState({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          setData({ status: "ready", ...JSON.parse(cached) });
          return;
        } catch {
          sessionStorage.removeItem(CACHE_KEY);
        }
      }

      try {
        const [contribRes, userRes, reposRes] = await Promise.all([
          fetch(CONTRIB_URL, { signal: controller.signal }),
          fetch(USER_URL, { signal: controller.signal }),
          fetch(REPOS_URL, { signal: controller.signal }),
        ]);

        if (!contribRes.ok) throw new Error("contributions unavailable");
        const contrib = await contribRes.json();

        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const days = (contrib.contributions ?? []).filter(
          (d) => parseDay(d.date) <= today
        );

        // api.github.com is rate limited and may 403; the heatmap should still
        // render if it does.
        const user = userRes.ok ? await userRes.json() : null;
        const reposRaw = reposRes.ok ? await reposRes.json() : [];
        const repos = Array.isArray(reposRaw) ? reposRaw : [];

        const langCounts = {};
        repos.forEach((r) => {
          if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1;
        });
        const langTotal = Object.values(langCounts).reduce((a, b) => a + b, 0);
        const languages = Object.entries(langCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({
            name,
            count,
            pct: langTotal ? Math.round((count / langTotal) * 100) : 0,
          }));

        const recent = repos
          .filter((r) => !r.fork)
          .slice(0, 5)
          .map((r) => ({
            name: r.name,
            description: r.description,
            language: r.language,
            url: r.html_url,
            updated: r.updated_at,
          }));

        const payload = {
          days,
          total: contrib.total?.lastYear ?? days.reduce((s, d) => s + d.count, 0),
          repoCount: user?.public_repos ?? repos.length,
          memberSince: user?.created_at
            ? new Date(user.created_at).getFullYear()
            : null,
          streak: longestStreak(days),
          activeDays: days.filter((d) => d.count > 0).length,
          languages,
          recent,
        };

        sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
        setData({ status: "ready", ...payload });
      } catch (err) {
        if (err.name !== "AbortError") setData({ status: "error" });
      }
    })();

    return () => controller.abort();
  }, []);

  // A third-party endpoint can go down; a broken panel is worse than none.
  if (data.status === "error") return null;

  const loading = data.status === "loading";

  const stats = [
    { icon: LuBook, label: "Public repos", value: data.repoCount, accent: "99,102,241" },
    { icon: LuGitBranch, label: "Contributions", value: data.total, accent: "34,197,94" },
    { icon: LuFlame, label: "Longest streak", value: data.streak ? `${data.streak}d` : "—", accent: "249,115,22" },
    { icon: LuCalendar, label: "Active days", value: data.activeDays, accent: "56,189,248" },
  ];

  return (
    <section id="activity" className="py-20">
      <RevealOnScroll>
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">
            Profiles &amp; Activity
          </h2>
          <p className="mb-10 text-center text-sm text-gray-400">
            GitHub numbers are pulled live — public contributions over the last year.
          </p>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map(({ icon: Icon, label, value, accent }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
              >
                <Icon className="mb-2 h-4 w-4" style={{ color: `rgb(${accent})` }} />
                <div className="text-xl font-bold text-white sm:text-2xl">
                  {loading ? "—" : value ?? "—"}
                </div>
                <div className="text-[11px] text-gray-400">{label}</div>
              </div>
            ))}
          </div>

          <BentoGrid>
            {/* Heatmap */}
            <BentoCard className="lg:col-span-6" accent="34,197,94">
              <div className="p-5 sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <FaGithub className="h-5 w-5 text-white" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Contribution graph
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        {loading
                          ? "Loading…"
                          : `${data.total} public contributions in the last year`}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`https://github.com/${USER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-gray-300 transition-colors hover:border-white/30 hover:text-white"
                  >
                    @{USER}
                    <LuArrowUpRight className="h-3 w-3" />
                  </a>
                </div>

                {loading ? (
                  <div className="h-[108px] animate-pulse rounded-lg bg-white/5" />
                ) : (
                  <GithubHeatmap days={data.days} />
                )}
              </div>
            </BentoCard>

            {/* Languages */}
            <BentoCard className="lg:col-span-2" accent="241,224,90">
              <div className="p-5">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
                  Languages
                </h3>
                {loading || !data.languages?.length ? (
                  <div className="h-24 animate-pulse rounded-lg bg-white/5" />
                ) : (
                  <>
                    <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-white/10">
                      {data.languages.map((l) => (
                        <div
                          key={l.name}
                          style={{
                            width: `${l.pct}%`,
                            backgroundColor: LANG_COLORS[l.name] ?? "#8b949e",
                          }}
                          title={`${l.name} ${l.pct}%`}
                        />
                      ))}
                    </div>
                    <ul className="space-y-2">
                      {data.languages.map((l) => (
                        <li
                          key={l.name}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="flex items-center gap-2 text-gray-300">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: LANG_COLORS[l.name] ?? "#8b949e",
                              }}
                            />
                            {l.name}
                          </span>
                          <span className="tabular-nums text-gray-500">{l.pct}%</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </BentoCard>

            {/* Recent repositories */}
            <BentoCard className="lg:col-span-4" accent="99,102,241">
              <div className="p-5">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
                  Recently updated
                </h3>
                {loading || !data.recent?.length ? (
                  <div className="h-24 animate-pulse rounded-lg bg-white/5" />
                ) : (
                  <ul className="space-y-2.5">
                    {data.recent.map((repo) => (
                      <li key={repo.name}>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/repo flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/25"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-white">
                              {repo.name}
                            </p>
                            {repo.description && (
                              <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-400">
                                {repo.description}
                              </p>
                            )}
                          </div>
                          <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-gray-400">
                            {repo.language && (
                              <>
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{
                                    backgroundColor:
                                      LANG_COLORS[repo.language] ?? "#8b949e",
                                  }}
                                />
                                {repo.language}
                              </>
                            )}
                            <LuArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover/repo:opacity-100" />
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </BentoCard>

            {/* LinkedIn */}
            <BentoCard className="lg:col-span-6" accent="10,102,194">
              <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3.5">
                  <span className="rounded-lg bg-[#0a66c2]/15 p-2.5 text-[#4aa3f0]">
                    <FaLinkedin className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">LinkedIn</h3>
                    <p className="mt-0.5 text-xs text-gray-300">{LINKEDIN.headline}</p>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      {LINKEDIN.location}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {LINKEDIN.focus.map((f) => (
                        <span
                          key={f}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-gray-300"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <a
                  href={LINKEDIN.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#0a66c2]/40 bg-[#0a66c2]/15 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0a66c2]/25"
                >
                  {LINKEDIN.handle}
                  <LuArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </BentoCard>
          </BentoGrid>
        </div>
      </RevealOnScroll>
    </section>
  );
};
