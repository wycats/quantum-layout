import { ENV } from "./env";
import { DIGEST } from "./fetch/utils";

export interface ManifestEntry {
  filename: string;
  hash: string;
}

export type ManifestEntries = {
  [P in string]: ManifestEntry;
};

export class Manifest {
  static async load(manifestURL: URL, clientId: string): Promise<Manifest> {
    let entries = await fetchManifest(manifestURL);
    return new Manifest(entries, clientId);
  }

  constructor(readonly manifest: ManifestEntries, readonly clientId: string) {}

  get entries(): readonly string[] {
    return [...Object.keys(this.manifest)];
  }

  has<P extends string>(path: P): this is { digest(path: P): string } {
    return path in this.manifest;
  }

  digest(url: URL): string | undefined {
    return this.manifest[url.pathname.slice(1)]?.hash;
  }

  private async isDigestValid(url: URL, response: Response): Promise<boolean> {
    let cachedDigest = await DIGEST.response(response.clone());
    let expectedDigest = this.digest(url);

    ENV.trace("verbose", {
      expected: expectedDigest,
      cached: cachedDigest,
    });

    return cachedDigest === expectedDigest;
  }

  async validate(
    request: Request,
    response: Response,
    cache: Cache
  ): Promise<Response | undefined> {
    ENV.trace("cache", `checking cache for file in manifest (${request.url})`);
    ENV.trace("verbose", {
      manifest: this.manifest,
      clientId: this.clientId,
    });

    let valid = await this.isDigestValid(new URL(request.url), response);

    if (valid) {
      ENV.trace("cache", `cache hit (${request.url})`);

      return response;
    }

    ENV.trace("cache", `manifest invalidated cache for ${request.url}`);

    return await this.fetch(request, cache);
  }

  async fetch(request: Request, cache: Cache): Promise<Response | undefined> {
    let path = new URL(request.url).pathname.slice(1);
    let entry = this.manifest[path];

    if (entry === undefined) {
      return;
    }

    let fetchResponse = await fetch(request, { cache: "reload" });
    let responseDigest = await DIGEST.response(fetchResponse.clone());
    let expectedDigest = entry.hash;

    if (responseDigest === expectedDigest) {
      cache.put(request, fetchResponse.clone());
      return fetchResponse.clone();
    } else if (responseDigest !== expectedDigest) {
      ENV.trace(
        "error",
        `response for ${path} didn't match the digest from the manifest\n\nexpected: ${expectedDigest}\ngot     : ${responseDigest}`
      );

      // The user needs to reload, because the file has been updated since the manifest was
      // retrieved at the beginning of this navigation. TODO: automate and consider semantics.
      return Response.error();
    }
  }
}

async function fetchManifest(url: URL) {
  let response = await fetch(url.href, { cache: "reload" });

  console.log("dev.json", await response.clone().json());

  return response.json();
}
