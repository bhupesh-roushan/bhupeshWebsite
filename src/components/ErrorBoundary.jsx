import { Component } from "react";

/**
 * React unmounts the entire tree when a render throws, so before this a single
 * bad value anywhere — a project without a stack, a malformed diagram spec —
 * turned the whole portfolio into a blank black page. For a page whose job is
 * to be read by someone deciding whether to interview you, that is the worst
 * available failure.
 *
 * Deliberately used per section rather than once around the app: a broken
 * Projects section should cost you the Projects section, not About, Contact
 * and the navigation with it.
 *
 * Class component because `getDerivedStateFromError` has no hook equivalent —
 * this is the one thing hooks still cannot do.
 */
export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    // Kept visible in the console: silence here would mean a section quietly
    // vanishing in production with no way to find out why.
    console.error(`[${this.props.name ?? "section"}] render failed`, error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <section className="px-4 py-16">
        <p className="mx-auto max-w-6xl text-center text-sm text-gray-500">
          This section couldn&rsquo;t be displayed. Everything else on the page
          still works — or reach me at{" "}
          <a
            href="mailto:roushan.bhupesh@gmail.com"
            className="text-gray-300 underline underline-offset-4 hover:text-white"
          >
            roushan.bhupesh@gmail.com
          </a>
          .
        </p>
      </section>
    );
  }
}
