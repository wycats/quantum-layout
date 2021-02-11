import { ENV } from "./env";
import { initializeSW, ServiceWorkerManagerImpl } from "./manager/sw-manager";

async function boot() {
  const sw = (self as any) as ServiceWorkerGlobalScope;

  ENV.trace("top-level", "top level");

  initializeSW(sw, new ServiceWorkerManagerImpl(sw));

  // sw.addEventListener("fetch", async (e) => {
  //   if (e.request.mode === "navigate") {
  //     let loading = Manifest.load({
  //       indexRequest: e.request,
  //       manifestURL: "/dev.json",
  //     });
  //     e.respondWith(loading.index());
  //     return;
  //   }

  //   ENV.trace("fetch", "pathname", new URL(e.request.url).pathname);
  //   if (new URL(e.request.url).pathname === "/bootstrap/swc.wasm") {
  //     ENV.trace("fetch", "requesting swc.wasm");
  //     e.respondWith(fetchWASM());
  //     return;
  //   }

  //   if (isSkypack(e.request)) {
  //     ENV.trace("fetch", `request skypack ${e.request.url}`, e.request);
  //     e.respondWith(fetchSkypack(e.request));
  //     return;
  //   }

  //   let longevity = hasLongevity(e.request);
  //   if (longevity) {
  //     ENV.trace(
  //       `longevity:${longevity}`,
  //       `request with longevity ${e.request.url}`,
  //       e.request
  //     );
  //     e.respondWith(fetchLongevity(e.request, longevity));
  //     return;
  //   }

  //   if (isLocal(e.request)) {
  //     if (isTS(e.request)) {
  //       ENV.trace("fetch", `request TS ${e.request.url}`, e.request);
  //       e.respondWith(fetchTS(e.request));
  //       return;
  //     }

  //     ENV.trace("fetch", `request local ${e.request.url}`, e.request);
  //     e.respondWith(fetchLocal(e.request));
  //     return;
  //   }

  //   ENV.trace(
  //     "fetch",
  //     "request",
  //     new URL(e.request.url).pathname,
  //     e.request.url
  //   );
  // });
}

boot();

export type Workaround = void;
