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
  let localCache = await LOCAL_CACHE;

  // If the path is in the manifest, we'll use the manifest digest information to invalidate the
  // cache. Otherwise, don't cache the assets at all, and let them be downloaded again on every fetch.
  if (manifest.has(path)) {
    let cachedResponse = await localCache.match(request);

    if (cachedResponse === undefined) {
      let response = await manifest.fetch(request, localCache);

      if (response) {
        return response;
      }
    } else {
      let result = await manifest.validate(request, cachedResponse, localCache);

      if (result) {
        return result;
      } else {
        // Otherwise, the file is no longer in the manifest, so it shouldn't be cached. But we still
        // want to let it fall back to normal semantics, so don't reject.
        await localCache.delete(request);
      }
    }
  }

  let response = await fetch(request);

  return updatedResponse(response, {
    headers: { "Cache-Control": "no-cache" },
  });
}
