import { ENV } from "./env";

export function isSkypack(request: Request): boolean {
  let url = new URL(request.url);

  return url.hostname === "cdn.skypack.dev" && !url.pathname.startsWith("/-/");
}

export function fetchSkypack(request: Request): Promise<Response> {
  let { pathname, href } = new URL(request.url);

  if (pathname.startsWith("/-/")) {
    return fetch(request);
  }

  let match = pathname.match(/^\/(?<pkg>@?[^@]*)@(?<version>.*)$/);

  if (!match) {
    throw Error(
      `fetchSkypack was unexpected called with an invalid Skypack URL (${href})`
    );
  }

  let { pkg, version } = match.groups as { pkg: string; version: string };

  return PACKAGES.get(pkg, version);
}

class Package {
  private name: string;

  private versions: Record<string, Promise<Cache>> = {};

  constructor(name: string) {
    this.name = name;
  }

  async get(version: string): Promise<Response> {
    let url = `https://cdn.skypack.dev/${this.name}@${version}`;
    let cache = this.versions[version];

    if (!cache) {
      cache = new Promise<Cache>(async (fulfill, reject) => {
        try {
          let cache = await caches.open(`skypack:${this.name}@${version}`);
          let request = new Request(url, {
            redirect: "follow",
          });
          let response = await fetch(request, { redirect: "follow" });
          ENV.trace(true, "fetch", "skypack response", response);

          if (response.status < 200 || response.status >= 300) {
            ENV.trace(true, "error", `response was not 2xx`, response);
            reject(
              Error(
                `unexpected status (${response.status}) from Skypack (${url})`
              )
            );
          } else {
            cache.put(request, response);
            fulfill(cache);
          }
        } catch (e) {
          reject(e);
        }
      });

      this.versions[version] = cache;
    }

    let c = await cache;

    if (c === undefined) {
      debugger;
    }

    let match = await c.match(url);

    if (!match) {
      throw Error(`Unexpected URL missing in package cache: ${url}`);
    }

    return match;
  }
}

class Packages {
  private packages: Record<string, Package> = {};

  async get(name: string, version: string): Promise<Response> {
    let pkg = this.packages[name];

    if (!pkg) {
      pkg = new Package(name);
      this.packages[name] = pkg;
    }

    console.log("PKG", pkg, version);

    return pkg.get(version);
  }
}

const PACKAGES = new Packages();
