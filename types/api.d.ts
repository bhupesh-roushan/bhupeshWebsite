// What a Vercel function is handed, as much of it as these handlers use.
//
// Not @vercel/node: that package is not a dependency here, and the handlers
// touch a small, stable part of the request and response. Defined on top of
// Node's own http types, which is what Vercel's are too, so a real request
// satisfies this and the type does not drift from the platform.
//
// It lives outside api/ on purpose — Vercel builds every file it finds under
// api/, and a declaration file there would be an unverified guess at how the
// builder treats it.

import type { IncomingMessage, ServerResponse } from "node:http";

export interface ApiRequest extends IncomingMessage {
  /** Query string, already parsed. A repeated key arrives as an array. */
  query: Partial<Record<string, string | string[]>>;
  /**
   * Parsed by Vercel from the Content-Type: an object for JSON, a string for
   * text/plain (which is what a bare sendBeacon posts), undefined when empty.
   * `unknown` because the caller controls it — each handler narrows before use.
   */
  body: unknown;
}

export interface ApiResponse extends ServerResponse {
  status(code: number): ApiResponse;
  json(body: unknown): ApiResponse;
}

export type ApiHandler = (req: ApiRequest, res: ApiResponse) => unknown;
