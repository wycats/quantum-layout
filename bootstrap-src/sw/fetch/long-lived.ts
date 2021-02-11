// The idea (for now) of LongLivedFetchManager is that there are certain file types that
// are very unlikely to change, so we can cache them much more aggressively. Ultimately, we will
// store a manifest of the digest of every changed file, which will allow us to quickly validate

import { addingHeaders } from "../env";
import { FetchManager } from "../manager/interfaces";
import { FETCH_LOCAL } from "./local";

export class LongLivedFetchManager implements FetchManager {
  readonly name = "long-lived";

  matches(request: Request, url: URL): boolean {
    if (FETCH_LOCAL.matches(request, url)) {
      return false;
    }

    let type = assetType(url.pathname);

    return type !== null;
  }

  async fetch(request: Request, url: URL): Promise<Response> {
    let type = assetType(url.pathname);

    const longevity = await caches.open(`embroider:longevity:${type}`);

    let response = await longevity.match(request);

    if (!response) {
      response = await fetch(request);

      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: addingHeaders(response.headers, {
          "Cache-Control": "public, max-age=31536000",
        }),
      });

      await longevity.put(request, response);
    }

    return response;
  }
}

export const FETCH_LONG_LIVED = new LongLivedFetchManager();

type LongLivedType = "font" | "wasm" | "image";

function assetType(path: string): LongLivedType | null {
  if (path.endsWith(".ttf") || path.endsWith(".woff2")) {
    return "font";
  }

  if (path.endsWith(".wasm")) {
    return "wasm";
  }

  if (path.endsWith(".png")) {
    return "image";
  }

  return null;
}
