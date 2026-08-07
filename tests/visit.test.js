import { describe, it, expect } from "vitest";
import {
  BOT,
  HTTP_CLIENT,
  readAgent,
  readReferrer,
  describeDevice,
  readDuration,
  readActivity,
  windowsName,
} from "../api/visit.js";

const blocked = (ua) => BOT.test(ua) || HTTP_CLIENT.test(ua);

describe("visitor filtering", () => {
  it.each([
    "Googlebot/2.1 (+http://www.google.com/bot.html)",
    "facebookexternalhit/1.1",
    "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
    "Mozilla/5.0 (compatible; Discordbot/2.0)",
    "Mozilla/5.0 HeadlessChrome/140",
    "Chrome-Lighthouse",
    "Java/1.8.0_292",
    "okhttp/4.9.3",
    "Apache-HttpClient/4.5.13 (Java/11.0.2)",
    "Go-http-client/2.0",
    "PostmanRuntime/7.37.0",
    "libwww-perl/6.67",
    "curl/8.4.0",
  ])("drops %s", (ua) => expect(blocked(ua)).toBe(true));

  // The failure that matters: an over-broad rule here empties the inbox and
  // looks like it is working. "java" unanchored matches "javascript".
  it.each([
    ["macOS Chrome", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"],
    ["iPhone Safari", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"],
    ["Android Chrome", "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36"],
    ["Windows Edge", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0"],
    ["Linux Firefox", "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0"],
  ])("delivers a real visitor on %s", (_, ua) => expect(blocked(ua)).toBe(false));
});

describe("readAgent", () => {
  it.each([
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", "Chrome 140 on macOS", "Desktop"],
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1", "Safari 17 on iPhone", "Phone"],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0", "Edge 140 on Windows", "Desktop"],
    ["Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0", "Firefox 130 on Linux", "Desktop"],
    ["Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/604.1", "Safari 17 on iPad", "Tablet"],
  ])("reads %#", (ua, label, kind) => {
    expect(readAgent(ua)).toEqual({ label, kind });
  });

  // Edge and Opera both claim to be Chrome; the specific test has to win.
  it("does not call Edge 'Chrome'", () => {
    expect(readAgent("Mozilla/5.0 (Windows NT 10.0) Chrome/140.0 Safari/537.36 Edg/140.0").label).toMatch(/^Edge/);
  });
});

describe("describeDevice", () => {
  // Chrome freezes the Android version at 10 for every device, so the UA can
  // never yield the truth and Client Hints are the only route to it.
  const FROZEN = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36";

  it("falls back to the frozen user-agent when no hints are offered", () => {
    expect(describeDevice(FROZEN, {}).label).toBe("Chrome 150 on Android 10");
  });

  it("prefers Client Hints, and gains the device model", () => {
    const d = describeDevice(FROZEN, {
      platform: "Android", platformVersion: "17.0.0", model: "Pixel 9 Pro",
      browser: "Google Chrome 150", mobile: true,
    });
    expect(d.label).toBe("Google Chrome 150 on Android 17 · Pixel 9 Pro");
    expect(d.kind).toBe("Phone");
  });

  it("maps Windows platformVersion to the version people use", () => {
    expect(windowsName("15.0.0")).toBe("Windows 11");
    expect(windowsName("10.0.0")).toBe("Windows 10");
  });
});

describe("readReferrer", () => {
  it.each([
    ["com.google.android.googlequicksearchbox", "Google app"],
    ["android-app://com.linkedin.android/", "LinkedIn app"],
    ["com.whatsapp", "WhatsApp"],
    ["com.some.unknownapp", "unknownapp (app)"],
    ["https://www.linkedin.com/in/x/", "linkedin.com"],
    ["direct", "direct"],
    ["", "direct"],
  ])("%s -> %s", (raw, want) => expect(readReferrer(raw)).toBe(want));

  // A package is a reversed domain. Matching on segment count alone read
  // "google.com" as an app called "com".
  it.each(["https://google.com/search?q=a", "https://whatsapp.com/"])(
    "does not mistake %s for an app",
    (url) => expect(readReferrer(url)).not.toMatch(/\(app\)/)
  );
});

describe("readDuration", () => {
  it.each([
    [0, "0s"], [6, "6s"], [59, "59s"], [60, "1m"], [252, "4m 12s"], [400, "6m 40s"],
  ])("%is -> %s", (n, want) => expect(readDuration(n)).toBe(want));

  it("survives a missing or junk value", () => {
    expect(readDuration(undefined)).toBe("0s");
    expect(readDuration("abc")).toBe("0s");
  });
});

describe("readActivity", () => {
  it("ranks a sent message above everything else", () => {
    const { parts } = readActivity({ contact: true, booking: true, projects: ["atlas"] });
    expect(parts[0]).toBe("SENT A MESSAGE");
  });

  it("reports an empty visit as empty rather than inventing activity", () => {
    expect(readActivity({}).parts).toEqual([]);
  });

  it("lists what was opened", () => {
    const { parts } = readActivity({ projects: ["atlas", "cloudwatch"], studies: ["x"], resume: ["PDF"] });
    expect(parts.join(" · ")).toContain("résumé (PDF)");
    expect(parts.join(" · ")).toContain("opened atlas, cloudwatch");
    expect(parts.join(" · ")).toContain("read 1 case study");
  });

  it("caps a list so one bored clicker cannot write an essay", () => {
    const many = Array.from({ length: 30 }, (_, i) => `p${i}`);
    expect(readActivity({ projects: many }).projects.length).toBeLessThanOrEqual(6);
  });

  it("ignores values that are not arrays", () => {
    expect(() => readActivity({ projects: "atlas", studies: null })).not.toThrow();
  });
});
