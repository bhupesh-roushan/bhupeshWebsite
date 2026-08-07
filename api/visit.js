// Vercel serverless function — emails a visit alert.
//
// What this can and cannot know, stated up front because the gap matters:
// a browser never exposes who someone is. There is no name, email, phone or
// employer available at any price here. What arrives is city and country
// derived from the IP, the device and browser, where they came from, and
// which page they landed on. That is the whole ceiling.
//
// It runs server-side for two reasons. The client cannot see its own IP
// without asking a third party, and the EmailJS private key must never reach
// the bundle — the public key already ships there, and anyone can read it.
//
// Set in the Vercel project's environment variables:
//   EMAILJS_SERVICE_ID        same value as VITE_SERVICE_ID
//   EMAILJS_VISIT_TEMPLATE_ID a second template, separate from the contact one
//   EMAILJS_PUBLIC_KEY        same value as VITE_PUBLIC_KEY
//   EMAILJS_PRIVATE_KEY       optional — only needed if the EmailJS account
//                             still blocks API calls from non-browser
//                             applications (Account → Security). Without that
//                             restriction, the three above are enough.
// Missing any required one and this reports 501 naming it, rather than
// failing silently.

const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

/**
 * Crawlers, previewers and uptime checks outnumber people on a public site by
 * a wide margin. Without this the mailbox fills with Googlebot and every
 * LinkedIn or WhatsApp link-preview fetch.
 */
const BOT =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|slackbot|discordbot|embedly|quora|pinterest|vkshare|redditbot|applebot|semrush|ahrefs|mj12|dotbot|petalbot|yandex|duckduck|baidu|sogou|exabot|ia_archiver|headlesschrome|phantomjs|puppeteer|playwright|lighthouse|curl|wget|python-requests|axios|got\/|node-fetch|monitor|uptime|pingdom|statuscake|gtmetrix|vercel-screenshot|prerender/i;

/**
 * Server-side HTTP clients. Separate from BOT because these are libraries
 * rather than named crawlers, and they need anchoring: "java" appears inside
 * "javascript" and would drop every real visitor, which is the kind of filter
 * that looks like it works because the inbox goes quiet.
 *
 * In practice almost none of these can reach here — the alert is fired by
 * JavaScript in the page, and an HTTP client that fetches HTML never runs it.
 * This is the belt to that braces: it costs one regex and it means a direct
 * POST from a script cannot mail you either.
 */
// `[\w.-]*` before the delimiter because several of these continue into a
// word — PostmanRuntime/7.37 is "postman" plus "Runtime", and requiring the
// slash immediately after the name let it through. Still anchored at the
// start, which is what keeps it off real browsers: every one of those begins
// "Mozilla/5.0".
const HTTP_CLIENT =
  /^(java|okhttp|apache-httpclient|go-http-client|python-httpx|httpx|libwww-perl|lwp|ruby|guzzle|reqwest|urllib|scrapy|winhttp|restsharp|postman|insomnia|httpie|dart|axios|undici|hackney|typhoeus|faraday)[\w.-]*[\s/]/i;

/** Trim anything unbounded — a header is attacker-controlled input. */
const clip = (value, max = 300) =>
  typeof value === "string" ? value.slice(0, max) : "";

const firstIp = (header) => clip(String(header || "").split(",")[0].trim(), 60);

/**
 * Vercel's own geo headers are country-only for a lot of IPs — the first alert
 * that arrived said nothing but "IN". This fills in city and, more usefully,
 * the network operator: on a corporate connection that is often the company
 * name, which is the closest thing to "who" that exists here.
 *
 * Best-effort by design. It runs on the alert path, so a slow or dead lookup
 * service must cost the visitor nothing and must never lose the email.
 */
async function lookupIp(ip) {
  if (!ip || ip.startsWith("127.") || ip.startsWith("::")) return null;
  try {
    const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.success ? d : null;
  } catch {
    return null; // timeout, rate limit, outage — the email still goes.
  }
}

/**
 * A raw user-agent is 120 characters of boilerplate wrapped around three facts.
 * Order matters: Edge and Opera both claim to be Chrome, and every iPad claims
 * to be a Mac, so the more specific test has to run first.
 */
function readAgent(ua) {
  const has = (s) => ua.toLowerCase().includes(s);

  const browser =
    /edg[ea]?\//i.test(ua) ? "Edge"
    : /opr\/|opera/i.test(ua) ? "Opera"
    : /samsungbrowser/i.test(ua) ? "Samsung Internet"
    : /firefox\//i.test(ua) ? "Firefox"
    : /chrome\//i.test(ua) ? "Chrome"
    : /safari\//i.test(ua) ? "Safari"
    : "browser";

  const version = ua.match(
    /(?:edg[ea]?|opr|firefox|chrome|version)\/(\d+)/i
  )?.[1];

  const os =
    has("iphone") ? "iPhone"
    : has("ipad") ? "iPad"
    : /android/i.test(ua) ? `Android${ua.match(/android (\d+)/i)?.[1] ? " " + ua.match(/android (\d+)/i)[1] : ""}`
    : has("mac os x") ? "macOS"
    : has("windows") ? "Windows"
    : has("cros") ? "ChromeOS"
    : has("linux") ? "Linux"
    : "unknown OS";

  const kind =
    has("iphone") || (/android/i.test(ua) && has("mobile")) ? "Phone"
    : has("ipad") || (/android/i.test(ua) && !has("mobile")) ? "Tablet"
    : "Desktop";

  return {
    label: `${browser}${version ? " " + version : ""} on ${os}`,
    kind,
  };
}

/**
 * Android apps hand over a package name rather than a URL, so a visit from the
 * Google app arrived as "com.google.android.googlequicksearchbox" — accurate
 * and unreadable. These are the ones a portfolio link actually travels through.
 */
const APPS = {
  "com.google.android.googlequicksearchbox": "Google app",
  "com.google.android.gm": "Gmail app",
  "com.linkedin.android": "LinkedIn app",
  "com.whatsapp": "WhatsApp",
  "com.instagram.android": "Instagram",
  "com.twitter.android": "X",
  "com.x.android": "X",
  "com.facebook.katana": "Facebook",
  "com.facebook.orca": "Messenger",
  "org.telegram.messenger": "Telegram",
  "com.Slack": "Slack",
  "com.microsoft.teams": "Teams",
  "com.discord": "Discord",
  "com.reddit.frontpage": "Reddit",
  "com.google.android.apps.docs": "Google Drive",
};

/** "linkedin.com" reads better in a subject line than the full tracking URL. */
function readReferrer(raw) {
  if (!raw || raw === "direct") return "direct";

  // android-app://com.foo.bar and bare package names both turn up here.
  //
  // A package is a *reversed* domain, which is the only thing separating
  // "com.whatsapp" from a hostname like "whatsapp.com" — matching on segment
  // count alone would read "google.com" as an app called "com". So the test
  // is that it starts with a TLD rather than ending with one.
  const looksLikePackage = (s) =>
    /^(com|org|net|io|co|app|android|dev|me|tv|in)\.[a-zA-Z]/.test(s) &&
    /^[a-zA-Z0-9_.]+$/.test(s);

  const pkg = raw.startsWith("android-app://")
    ? raw.slice("android-app://".length).split("/")[0]
    : looksLikePackage(raw)
      ? raw
      : null;

  if (pkg) {
    if (APPS[pkg]) return APPS[pkg];
    // Unknown app: "com.foo.barapp" is more use as "barapp" than in full.
    const tail = pkg.split(".").filter(Boolean).pop();
    return tail ? `${tail} (app)` : clip(raw, 80);
  }

  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return clip(raw, 80);
  }
}

/** Windows reports 13+ for Windows 11; the platform version is not the name. */
const windowsName = (v) => (parseInt(v, 10) >= 13 ? "Windows 11" : "Windows 10");

/**
 * Client Hints when the browser offered them, the user-agent otherwise.
 * The hints are the only route to a true Android version or a device model —
 * Chrome reports "Android 10" in the UA for every device on every version.
 */
function describeDevice(ua, hint) {
  const parsed = readAgent(ua);
  if (!hint?.platform) return parsed;

  const major = String(hint.platformVersion || "").split(".")[0];
  const os =
    hint.platform === "Windows"
      ? windowsName(major)
      : hint.platform === "Android"
        ? `Android${major ? " " + major : ""}`
        : hint.platform === "macOS"
          ? `macOS${major ? " " + major : ""}`
          : `${hint.platform}${major ? " " + major : ""}`;

  const browser = clip(hint.browser, 40) || parsed.label.split(" on ")[0];
  const model = clip(hint.model, 60);
  const kind = hint.mobile ? (parsed.kind === "Tablet" ? "Tablet" : "Phone") : "Desktop";

  return { label: `${browser} on ${os}${model ? ` · ${model}` : ""}`, kind };
}


/** "4m 12s" reads faster than 252, and "8s" is its own verdict. */
function readDuration(seconds) {
  const n = Number(seconds) || 0;
  if (n < 60) return `${n}s`;
  const m = Math.floor(n / 60);
  const r = n % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

const list = (v, max = 6) =>
  Array.isArray(v) ? v.filter(Boolean).map((x) => String(x).slice(0, 40)).slice(0, max) : [];

/**
 * What they did, in the order it matters when you are skimming a notification.
 * A contact message outranks everything; time alone is the weakest signal and
 * goes last, because a long visit with nothing opened is usually a tab someone
 * forgot about.
 */
function readActivity(body) {
  const projects = list(body.projects);
  const studies = list(body.studies);
  const resume = list(body.resume, 2);
  const parts = [];

  if (body.contact) parts.push("SENT A MESSAGE");
  if (body.booking) parts.push("opened the booking link");
  if (resume.length) parts.push(`résumé (${resume.join(", ")})`);
  if (studies.length) parts.push(`read ${studies.length} case ${studies.length === 1 ? "study" : "studies"}: ${studies.join(", ")}`);
  if (projects.length) parts.push(`opened ${projects.join(", ")}`);

  return { parts, projects, studies, resume };
}

export default async function handler(req, res) {
  // Always cheap to reject: this is fired from a page load, and must never
  // become something a visitor can feel.
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_VISIT_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  // Names the missing ones. A single "not configured" told you something was
  // wrong but not which of four, which is a slow way to debug a deploy.
  const missing = [
    !serviceId && "EMAILJS_SERVICE_ID",
    !templateId && "EMAILJS_VISIT_TEMPLATE_ID",
    !publicKey && "EMAILJS_PUBLIC_KEY",
  ].filter(Boolean);

  if (missing.length) {
    res.status(501).json({ error: "not configured", missing });
    return;
  }

  const ua = clip(req.headers["user-agent"], 400);
  if (!ua || BOT.test(ua) || HTTP_CLIENT.test(ua)) {
    // 204, not an error: the request was handled correctly, it just wasn't a
    // person. Returning 4xx here would fill the function logs with noise.
    res.status(204).end();
    return;
  }

  const body = typeof req.body === "object" && req.body ? req.body : {};
  const ip = firstIp(req.headers["x-forwarded-for"]);

  const geo = await lookupIp(ip);

  // Vercel's headers as the fallback: they always exist, but are often
  // country-only, which is how the first alert managed to say just "IN".
  const place =
    [
      geo?.city || decodeURIComponent(clip(req.headers["x-vercel-ip-city"], 80) || ""),
      geo?.region || clip(req.headers["x-vercel-ip-country-region"], 80),
      geo?.country || clip(req.headers["x-vercel-ip-country"], 8),
    ]
      .filter(Boolean)
      .join(", ") || "unknown";

  const agent = describeDevice(ua, {
    platform: clip(body.platform, 40),
    platformVersion: clip(body.platformVersion, 40),
    model: clip(body.model, 60),
    browser: clip(body.browser, 40),
    mobile: !!body.mobile,
  });
  const referrer = readReferrer(
    clip(body.referrer) || clip(req.headers.referer) || "direct"
  );

  // Who runs the connection. A home visitor gives you their ISP, which tells
  // you little; an office one often gives the employer's name, which tells you
  // a great deal when you're job hunting.
  const org = clip(geo?.connection?.org || geo?.connection?.isp || "", 120);
  const asn = geo?.connection?.asn ? `AS${geo.connection.asn}` : "";
  const network = [org, asn].filter(Boolean).join(" · ") || "unknown";

  // Worth knowing before you read anything into the rest: a datacentre IP is
  // a scraper or someone behind a VPN, not a person in that city.
  const flags = [
    geo?.type === "IPv6" && "IPv6",
    /vpn|proxy|hosting|cloud|amazon|google llc|microsoft|digitalocean|linode|ovh/i.test(org) &&
      "datacentre or VPN — treat the location as unreliable",
  ].filter(Boolean);

  const when = new Date();
  const duration = readDuration(body.seconds);
  const { parts } = readActivity(body);

  // A landing tag beats a referrer when there is one: "acme-backend" says
  // which application produced the visit, where "linkedin.com" only says the
  // company that hosted the link.
  const src = clip(body.src, 60);
  const origin = src || referrer;

  // Where they went, not just where they came in.
  const path = list(body.path, 8);
  const journey = path.length > 1 ? path.join(" -> ") : clip(body.page, 200) || "/";

  const params = {
    // Named so an EmailJS template can drop them in directly.
    place,
    network,
    ip,
    referrer: src ? `${src} (tagged link)` : referrer,
    page: journey,
    device: `${agent.label} · ${agent.kind}`,
    agent: ua,
    screen: clip(body.screen, 40),
    language: clip(body.language, 40),
    // Asia/Calcutta is a legacy alias some browsers still report; it's the
    // same zone, and seeing the current name avoids a double-take.
    timezone: clip(body.timezone, 60).replace("Asia/Calcutta", "Asia/Kolkata"),
    time: when.toLocaleString("en-GB", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }) + " IST",
    duration,
    activity: parts.length ? parts.join(" · ") : "nothing opened",
    notes: flags.join(" · ") || "—",
    // The subject line. On a phone this is often all you see, so it leads with
    // what they did and falls back to where they came from when they did
    // nothing — which is itself the useful fact about that visit.
    summary: parts.length
      ? `${duration} · ${parts[0]}${parts.length > 1 ? ` +${parts.length - 1} more` : ""} · ${origin}`
      : `${duration} · nothing opened · ${origin} · ${place}`,
  };

  try {
    const mail = await fetch(EMAILJS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        // Optional. EmailJS refuses non-browser calls unless either the
        // private key is supplied or "Allow API calls from non-browser
        // applications" is enabled on the account. Sending the field as
        // undefined would serialise to nothing, so it's omitted entirely.
        ...(privateKey ? { accessToken: privateKey } : {}),
        template_params: params,
      }),
    });

    if (!mail.ok) {
      const detail = await mail.text().catch(() => "");
      res.status(502).json({ error: `EmailJS ${mail.status}: ${detail.slice(0, 200)}` });
      return;
    }

    res.status(204).end();
  } catch (err) {
    // Never surface a failure to the page — a broken alert must not become a
    // broken visit.
    res.status(500).json({ error: err.message });
  }
}

/**
 * Exported for the test suite. Vercel only invokes the default export, so
 * these cost nothing at runtime and mean the parsing rules can be checked
 * without standing up a server or mocking a request.
 */
export { BOT, HTTP_CLIENT, readAgent, readReferrer, describeDevice, readDuration, readActivity, windowsName };
