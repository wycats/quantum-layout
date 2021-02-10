import { ENV } from "./env";
import { fetchLocal, isLocal } from "./local";
import { fetchLongevity, hasLongevity } from "./longevity";
import { fetchSkypack, isSkypack } from "./skypack";
import { fetchTS, isTS } from "./typescript";
import { fetchWASM } from "./wasm";

async function boot() {
  const sw = (self as any) as ServiceWorkerGlobalScope;

  ENV.trace("top-level", "top level");

  sw.addEventListener("install", (e) => {
    e.waitUntil(prefetch());

    async function prefetch() {
      await fetchWASM();
      return sw.skipWaiting();
    }
  });

  sw.addEventListener("activate", (e) => {
    ENV.trace("state", "activated");
    e.waitUntil(sw.clients.claim());
  });

  sw.addEventListener("fetch", async (e) => {
    ENV.trace("fetch", "pathname", new URL(e.request.url).pathname);
    if (new URL(e.request.url).pathname === "/bootstrap/swc.wasm") {
      ENV.trace(true, "fetch", "requesting swc.wasm");
      e.respondWith(fetchWASM());
      return;
    }

    if (isSkypack(e.request)) {
      ENV.trace(true, "fetch", `request skypack ${e.request.url}`, e.request);
      e.respondWith(fetchSkypack(e.request));
      return;
    }

    let longevity = hasLongevity(e.request);
    if (longevity) {
      ENV.trace(
        true,
        `longevity:${longevity}`,
        `request with longevity ${e.request.url}`,
        e.request
      );
      e.respondWith(fetchLongevity(e.request, longevity));
      return;
    }

    if (isLocal(e.request)) {
      if (isTS(e.request)) {
        ENV.trace(true, "fetch", `request TS ${e.request.url}`, e.request);
        e.respondWith(fetchTS(e.request));
        return;
      }

      ENV.trace("fetch", `request local ${e.request.url}`, e.request);
      e.respondWith(fetchLocal(e.request));
      return;
    }

    ENV.trace(
      "fetch",
      "request",
      new URL(e.request.url).pathname,
      e.request.url
    );
  });
}

boot();

export type Workaround = void;
