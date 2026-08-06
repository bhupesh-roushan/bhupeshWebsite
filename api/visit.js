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
const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|slackbot|discordbot|embedly|quora|pinterest|vkshare|redditbot|applebot|semrush|ahrefs|mj12|dotbot|petalbot|yandex|duckduck|baidu|sogou|exabot|ia_archiver|headlesschrome|phantomjs|puppeteer|playwright|lighthouse|curl|wget|python-requests|axios|got\/|node-fetch|monitor|uptime|pingdom|statuscake|gtmetrix|vercel-screenshot|prerender/i;

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

/** "linkedin.com" reads better in a subject line than the full tracking URL. */
function readReferrer(raw) {
  if (!raw || raw === "direct") return "direct";
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return clip(raw, 80);
  }
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
  if (!ua || BOT.test(ua)) {
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

  const agent = readAgent(ua);
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
  const params = {
    // Named so an EmailJS template can drop them in directly.
    place,
    network,
    ip,
    referrer,
    page: clip(body.page, 200) || "/",
    device: `${agent.label} · ${agent.kind}`,
    agent: ua,
    screen: clip(body.screen, 40),
    language: clip(body.language, 40),
    timezone: clip(body.timezone, 60),
    // Their local clock, not UTC — an ISO string in another timezone is a
    // small subtraction you shouldn't have to do at a glance.
    time: when.toLocaleString("en-GB", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }) + " IST",
    notes: flags.join(" · ") || "—",
    // The subject line. On a phone this is often all you see, so it carries
    // the three facts that decide whether the rest is worth opening.
    summary: `${place} · ${referrer === "direct" ? "direct" : "via " + referrer} · ${clip(body.page, 60) || "/"}`,
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
