import { Environment } from "../bootstrap/env.js";

const CATEGORIES = [
  "top-level",
  "fetch",
  "cache",
  "state",
  "error",
  "verbose",
  "manager",
  "local",
];
type Category = typeof CATEGORIES[number];

export const ENV = Environment.default<Category>("🧙").enable(
  "manager",
  "local"
);
//.enable("state","cache");

export function addingHeaders(
  original: Headers,
  adding: Record<string, string>
): Headers {
  let headers = new Headers(original);

  for (let [key, value] of Object.entries(adding)) {
    headers.set(key, value);
  }
  return headers;
}
