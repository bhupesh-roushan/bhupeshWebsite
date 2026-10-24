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

  workMode: "Onsite — Bangalore",

  location: "Bangalore, India",

  openTo: [
    "Software Development Engineer",
    "Full Stack Developer",
    "Backend Engineer",
    "GenAI / AI Automation Engineer",
  ],

  experience: "3+ years",

  // One plain sentence on whether and when you are available, shown beside the
  // location on the hero. Left empty it simply doesn't appear — and it is worded
  // as a statement ("Available from November 2026"), because the pulsing
  // "Open to opportunities" pill this replaces read as asking.
  availability: "",

  // Booking link. The button stays hidden while this is empty, so the page
  // never shows a scheduler that goes nowhere.
  //
  // To turn it on: make a free 15-minute event type at cal.com (or Calendly)
  // and paste the URL here — e.g. "https://cal.com/bhupesh-roushan/15min".
  // I can't create the account for you; it needs your email to verify.
  bookingUrl: "https://cal.com/bhupesh-roushan/15min",
};

/** The contact address — one copy, used by the contact form and the command palette. */
export const EMAIL = "roushan.bhupesh@gmail.com";

/** Prefilled subject line so writing to you takes one less decision. */
export const MAIL_SUBJECT = "Role opportunity — ";
