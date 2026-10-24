// Browser features the DOM lib does not describe yet, as far as this site
// uses them. All optional: each is feature-detected at the call site, because
// support differs from one browser to the next.
//
// A script file (no import or export), so these merge into the global
// interfaces rather than becoming a module's own.

/** User-Agent Client Hints — the part of `navigator.userAgentData` that useVisitAlert reads. */
interface NavigatorUAData {
  readonly platform: string;
  readonly mobile: boolean;
  getHighEntropyValues(hints: string[]): Promise<{
    platformVersion?: string;
    model?: string;
    fullVersionList?: { brand: string; version: string }[];
  }>;
}

interface Navigator {
  readonly userAgentData?: NavigatorUAData;
  /** Global Privacy Control; true when the visitor has opted out of sale or sharing. */
  readonly globalPrivacyControl?: boolean;
}

interface Window {
  /** A legacy spelling of Do Not Track that some browsers expose on window rather than navigator. */
  doNotTrack?: string | null;
}
