// ─────────────────────────────────────────────────────────────────────────────
// EDIT ME. These are the questions every recruiter asks by email; answering
// them on the page saves a round-trip.
//
// The values marked PLACEHOLDER are guesses — I don't know your notice period
// or what you'll relocate for. Correct them before sharing the site widely.
// ─────────────────────────────────────────────────────────────────────────────

export const hiring = {
  // PLACEHOLDER — set to whatever your contract actually says.
  noticePeriod: "30 days",

  // PLACEHOLDER — adjust if you'd relocate or want onsite only.
  workMode: "Remote / Hybrid — Bangalore",

  location: "Bangalore, India",

  // PLACEHOLDER — trim to the ones you actually want to be pitched for.
  openTo: [
    "Full Stack Developer",
    "Backend Engineer",
    "GenAI / AI Automation Engineer",
  ],

  experience: "3+ years",

  // Booking link. The button stays hidden while this is empty, so the page
  // never shows a scheduler that goes nowhere.
  //
  // To turn it on: make a free 15-minute event type at cal.com (or Calendly)
  // and paste the URL here — e.g. "https://cal.com/bhupesh-roushan/15min".
  // I can't create the account for you; it needs your email to verify.
  bookingUrl: "",
};

/** Prefilled subject line so writing to you takes one less decision. */
export const MAIL_SUBJECT = "Role opportunity — ";
