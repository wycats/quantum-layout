import { ENV } from "../env";
import { FETCH_LOCAL } from "../fetch/local";
import { FETCH_LONG_LIVED } from "../fetch/long-lived";
import { FETCH_SKYPACK } from "../fetch/skypack";
import { TS } from "../fetch/typescript";
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
  sw: ServiceWorkerGlobalScope,
  manager: ServiceWorkerManager
) {
  const STATE = ServiceWorkerStateImpl.of(sw);

  sw.addEventListener("install", (e) => {
    const target = swFromEvent(e, "install");

    async function install() {
      ENV.trace("manager", "on:install start");
      await manager.prefetch(STATE);
      let installed = await manager.install(STATE, target);

      STATE.instances.setInstalled(target, installed);

      if (manager.skipWaiting) {
        await sw.skipWaiting();
      }

      ENV.trace("manager", "on:install end");
    }

    e.waitUntil(install());
  });

  sw.addEventListener("activate", (e) => {
    async function activate() {
      ENV.trace("manager", "on:activate start");

      if (manager.skipWaiting) {
        ENV.trace("manager", "on:activate waiting for clients.claim");
        await sw.clients.claim();
      }

      ENV.trace("manager", "on:activate end");
    }

    e.waitUntil(activate());
  });

  sw.addEventListener("fetch", (e) => {
    const sw = swFromEvent(e, "fetch");
    const request = e.request;

    e.respondWith(handleFetch());

    async function handleFetch(): Promise<Response> {
      let installed = await STATE.instances.connect(manager, sw, STATE);

      if (request.mode === "navigate") {
        return handleNavigation(installed);
      }

      let url = new URL(request.url);
      let fetchManager = installed.fetchManagers.match(request, url);
      return fetchManager.fetch(request, url);
    }

    async function handleNavigation(installed: InstalledServiceWorkerManager) {
      // let client = await STATE.instances.getWindowClient(e.clientId);
      let navigation = installed.navigate(STATE, request);
      let instance = await navigation;
      // let instance = await STATE.instances.addAppInstance(client, navigation);
      return instance.index(new URL(request.url));

      // if (client) {
      // } else {
      //   throw new Error(
      //     `unexpectedly missing serviceWorker.clients.get(${e.clientId})`
      //   );
      // }
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
