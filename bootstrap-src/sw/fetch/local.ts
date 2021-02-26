import { addingHeaders, ENV } from "../env";
import { FetchManager } from "../manager/interfaces";
import { Manifest } from "../manifest";
import { DIGEST, updatedResponse } from "./utils";

const LOCAL_CACHE = caches.open("embroider.local");

// TODO: use the manifest
export class LocalFetchManager implements FetchManager {
  readonly name = "local";

  matches(request: Request, url: URL): boolean {
    return url.origin === origin;
  }

  async fetch(
    request: Request,
    url: URL,
    manifest: Manifest
  ): Promise<Response> {
    return fetchLocal(request, url, manifest);
  }
}

export const FETCH_LOCAL = new LocalFetchManager();

export async function fetchLocal(
  request: Request,
  url: URL,
  manifest: Manifest
): Promise<Response> {
  let response = await fetchLocalFile(request, url, manifest);

  if (response.ok) {
    return response;
  } else {
    throw Error(`HTTP Request ${response.statusText} (${request.url})`);
  }
}

async function fetchLocalFile(
  request: Request,
  url: URL,
  manifest: Manifest
): Promise<Response> {
  // slice off the leading `/`
  let path = url.pathname.slice(1);

  let start = performance.now();

  function elapsed() {
    return Math.round((performance.now() - start) * 100);
  }

  ENV.trace("local", "await LOCAL_CACHE", url.href, elapsed());
  let localCache = await LOCAL_CACHE;
  ENV.trace("local", "got cache", url.href, elapsed());

  // If the path is in the manifest, we'll use the manifest digest information to invalidate the
  // cache. Otherwise, don't cache the assets at all, and let them be downloaded again on every fetch.
  if (manifest.has(path)) {
    ENV.trace("local", "await localCache.match(request)", url.href, elapsed());
    let cachedResponse = await localCache.match(request);

    if (cachedResponse === undefined) {
      ENV.trace(
        "local",
        "await manifest.fetch(request, localCache)",
        url.href,
        elapsed()
      );

      let response = await manifest.fetch(request, localCache);

      if (response) {
        ENV.trace("local", "return response", url.href, elapsed());

        return response;
      }
    } else {
      ENV.trace(
        "local",
        "manifest.validate(request, cachedResponse, localCache)",
        url.href,
        elapsed()
      );

      let result = await manifest.validate(request, cachedResponse, localCache);

      if (result) {
        ENV.trace("local", "return result", url.href, elapsed());

        return result;
      } else {
        ENV.trace("local", "await localCache.delete", url.href, elapsed());

        // Otherwise, the file is no longer in the manifest, so it shouldn't be cached. But we still
        // want to let it fall back to normal semantics, so don't reject.
        await localCache.delete(request);
      }
    }
  }

  ENV.trace(
    "local",
    `await fetch(request, { cache: "reload" })`,
    url.href,
    elapsed()
  );

  let response = await fetch(request, { cache: "reload" });

  ENV.trace(
    "local",
    `return updatedResponse(response, ...)`,
    url.href,
    elapsed()
  );

  return updatedResponse(response, {
    headers: { "Cache-Control": "no-cache" },
  });
}
