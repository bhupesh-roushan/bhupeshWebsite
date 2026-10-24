/**
 * Magic UI's Safari mockup, as a frame around a screenshot: window chrome with
 * the three dots and an address bar, so a project's picture reads as a site you
 * could visit.
 *
 * `url` is shown as given. Pass nothing for work with no public address — an
 * internal tool has no URL, and a made-up one would be a lie in the address bar.
 * The frame says what it is instead.
 */
export const BrowserFrame = ({ url, label, children, className = "" }) => (
  <div className={`browser-frame ${className}`}>
    <div className="browser-frame__bar">
      <div className="flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="mx-auto min-w-0 max-w-[70%] flex-1 truncate rounded-md border border-white/10 bg-white/5 px-3 py-1 text-center font-mono text-[11px] text-gray-400">
        {url ?? label ?? "Private"}
      </div>
      <div className="w-[3.2rem]" aria-hidden="true" />
    </div>
    {children}
  </div>
);
