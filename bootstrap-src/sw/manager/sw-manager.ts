import { ENV } from "../env";
import { FETCH_LOCAL } from "../fetch/local";
import { FETCH_LONG_LIVED } from "../fetch/long-lived";
import { FETCH_SKYPACK } from "../fetch/skypack";
import { TypescriptFetchManager } from "../fetch/typescript";
import { FETCH_WASM, wasm } from "../fetch/wasm";
import { InstalledServiceWorkerManagerImpl } from "./installed-manager";
import { AppInstances } from "./instances";
import {
  FetchManagers,
  InstalledServiceWorkerManager,
  ServiceWorkerManager,
  ServiceWorkerManagerState,
} from "./interfaces";

export function initializeSW(
  swGlobal: ServiceWorkerGlobalScope,
  manager: ServiceWorkerManager
) {
  const STATE = ServiceWorkerStateImpl.of(swGlobal);

  swGlobal.addEventListener("install", (e) => {
    const target = swFromEvent(e, "install");

    async function install() {
      ENV.trace("manager", "on:install start");
      await manager.prefetch(STATE);
      let installed = await manager.install(STATE, target);

      STATE.instances.setInstalled(target, installed);

      if (manager.skipWaiting) {
        await swGlobal.skipWaiting();
      }

      ENV.trace("manager", "on:install end");
    }

    e.waitUntil(install());
  });

  swGlobal.addEventListener("activate", (e) => {
    async function activate() {
      ENV.trace("manager", "on:activate start");

      if (manager.skipWaiting) {
        ENV.trace("manager", "on:activate waiting for clients.claim");
        await swGlobal.clients.claim();
      }

      ENV.trace("manager", "on:activate end");
    }

    e.waitUntil(activate());
  });

  swGlobal.addEventListener("fetch", (e) => {
    const sw = swFromEvent(e, "fetch");
    const request = e.request;
    const url = new URL(request.url);

    // let handledFetch = handleFetch();

    e.respondWith(handleFetch());

    async function handleFetch(): Promise<Response> {
      let installed = await STATE.instances.connect(manager, sw, STATE);

      if (request.mode === "navigate") {
        ENV.trace("state", "navigate", { clientId: e.resultingClientId });
        let connectPromise = STATE.instances.navigateAppInstance(
          e.resultingClientId,
          (id) => installed.connect(STATE, id)
        );

        let [_connect, response] = await Promise.all([
          connectPromise,
          handleNavigation(installed),
        ]);
        return response;
        // return handleNavigation(installed);
      }

      ENV.trace("state", "fetch", {
        clientId: e.clientId,
        url: request.url,
      });

      ENV.trace("local", "await STATE.instances.getAppInstance", request.url);

      let instance = await STATE.instances.getAppInstance(e.clientId, (id) =>
        installed.connect(STATE, id)
      );

      ENV.trace("local", "instance", request.url);

      let url = new URL(request.url);
      return installed.fetchManagers.fetch(request, url, instance.manifest);
    }

    async function handleNavigation(installed: InstalledServiceWorkerManager) {
      // let client = await STATE.instances.getWindowClient(e.clientId);
      let navigation = await installed.navigate(STATE, request);

      console.log("navigation", navigation);

      await swGlobal.clients.claim();

      return navigation;
    }
  });
}

class ServiceWorkerStateImpl implements ServiceWorkerManagerState {
  static of(sw: ServiceWorkerGlobalScope): ServiceWorkerStateImpl {
    let instances = new AppInstances(sw);
    return new ServiceWorkerStateImpl(instances);
  }

  constructor(readonly instances: AppInstances) {}
}

const FETCH_MANAGERS = FetchManagers.default().add(
  FETCH_WASM,
  FETCH_SKYPACK,
  FETCH_LONG_LIVED,
  new TypescriptFetchManager((url) => {
    return (
      url.pathname.startsWith("/app/") || url.pathname.startsWith("/bootstrap/")
    );
  }),
  FETCH_LOCAL
);

export class ServiceWorkerManagerImpl implements ServiceWorkerManager {
  readonly skipWaiting = true;

  constructor(readonly sw: ServiceWorkerGlobalScope) {}

  async prefetch(): Promise<void> {
    await wasm();
  }

  async install(
    state: ServiceWorkerManagerState,
    sw: ServiceWorker
  ): Promise<InstalledServiceWorkerManager> {
    return new InstalledServiceWorkerManagerImpl(
      FETCH_MANAGERS,
      new URL("/dev.json", origin)
    );
  }

  async connect(
    state: ServiceWorkerManagerState,
    sw: ServiceWorker
  ): Promise<InstalledServiceWorkerManager> {
    return new InstalledServiceWorkerManagerImpl(
      FETCH_MANAGERS,
      new URL("/dev.json", origin)
    );
  }
}

function isSW(target: unknown): target is ServiceWorker {
  return (
    typeof target === "object" &&
    target !== null &&
    target instanceof ServiceWorker
  );
}

function swFromEvent(e: ExtendableEvent, name: string): ServiceWorker {
  let target = assertServiceWorkerEventTarget(e.target, name);

  return target.serviceWorker;
}

interface ServiceWorkerEventTarget extends EventTarget {
  serviceWorker: ServiceWorker;
}

function assertServiceWorkerEventTarget(
  target: EventTarget | { serviceWorker?: unknown } | null,
  name: string
): ServiceWorkerEventTarget {
  if (target === null) {
    throw Error(
      `ASSUMPTION ERROR: e.target in a service worker event (${name}) was null`
    );
  }

  if ("serviceWorker" in target) {
    if (isSW(target.serviceWorker)) {
      return target as ServiceWorkerEventTarget;
    } else {
      throw Error(
        `ASSUMPTION ERROR: e.target.serviceWorker in a service worker event (${name}) was not an instance of ServiceWorker`
      );
    }
  } else {
    throw Error(
      `ASSUMPTION ERROR: e.target in a service worker event (${name}) did not have a serviceWorker property`
    );
  }
}

function assertSW(target: unknown): ServiceWorker {
  if (isSW(target)) {
    return target;
  } else {
    throw new Error(
      `ASSUMPTION ERROR: the target was not an instanceof ServiceWorker`
    );
  }
}
