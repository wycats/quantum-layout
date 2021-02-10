// The idea (for now) of hasLongevity and fetchLongevity is that there are certain file types that
// are very unlikely to change, so we can cache them much more aggressively. Ultimately, we will
// store a manifest of the digest of every changed file, which will allow us to quickly validate

import { addingHeaders } from "./env";
import { isLocal } from "./local";

// files regardless of their type.
export function hasLongevity(request: Request): "font" | "wasm" | "png" | null {
  if (!isLocal(request)) {
    return null;
  }

  let url = new URL(request.url);
  let path = url.pathname;

  if (path.endsWith(".ttf") || path.endsWith(".woff2")) {
    return "font";
  }

  if (path.endsWith(".wasm")) {
    return "wasm";
  }

  if (path.endsWith(".png")) {
    return "png";
  }

  return null;
}

// TODO: Store digest information in a manifest that can be used to quickly validate cached local files
export async function fetchLongevity(
  request: Request,
  type: "font" | "wasm" | "png"
) {
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
