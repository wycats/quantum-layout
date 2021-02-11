import { updatedResponse } from "../fetch/utils";
import { Manifest } from "../manifest";
import { AppInstance } from "./fetch-manager";
import { AppInstances } from "./instances";

export interface ServiceWorkerManagerState {
  readonly instances: AppInstances;
}

export interface ServiceWorkerManager {
  readonly skipWaiting: boolean;

  prefetch(state: ServiceWorkerManagerState): Promise<void>;

  // This hook gets called in the `install` event, and is an appropriate time to do work that should
  // persist across JavaScript execution contexts (such as prefetching).
  install(
    state: ServiceWorkerManagerState,
    sw: ServiceWorker
  ): Promise<InstalledServiceWorkerManager>;

  // This hook gets called in the `activate` event, but only when `install` wasn't invoked in the
  // same JavaScript execution context. This hook shouldn't do any installation work, and should
  // install do the minimal amount of work necessary to produce an InstalledServiceWorkerManager.
  connect(
    state: ServiceWorkerManagerState,
    sw: ServiceWorker
  ): Promise<InstalledServiceWorkerManager>;

  // getManifest(): Promise<Manifest>;
}

export class DefaultFetchManager implements FetchManager {
  readonly name = "default";

  matches(): boolean {
    return true;
  }

  fetch(request: Request): Promise<Response> {
    return fetch(request);
  }
}

const DEFAULT_FETCH_MANAGER = new DefaultFetchManager();

export class FetchManagers {
  static default(): FetchManagers {
    return new FetchManagers([], DEFAULT_FETCH_MANAGER);
  }

  constructor(
    readonly fetchManagers: readonly FetchManager[],
    readonly defaultManager: FetchManager = new DefaultFetchManager()
  ) {}

  add(...managers: readonly FetchManager[]): FetchManagers {
    return new FetchManagers(
      [...this.fetchManagers, ...managers],
      this.defaultManager
    );
  }

  default(manager: FetchManager): FetchManagers {
    return new FetchManagers(this.fetchManagers, manager);
  }

  private match(request: Request, url: URL): FetchManager {
    for (let manager of this.fetchManagers) {
      if (manager.matches(request, url)) {
        return manager;
      }
    }

    return this.defaultManager;
  }

  async fetch(
    request: Request,
    url: URL,
    manifest: Manifest
  ): Promise<Response> {
    let manager = this.match(request, url);
    let response = await manager.fetch(request, url, manifest);

    if (response.status === 0) {
      return response;
    }

    return updatedResponse(response, {
      headers: { "X-Fetch-Manager": manager.name, "Cache-Control": "no-cache" },
    });
  }
}

export interface InstalledServiceWorkerManager {
  readonly fetchManagers: FetchManagers;

  connect(
    state: ServiceWorkerManagerState,
    clientId: string
  ): Promise<AppInstance>;

  navigate(
    state: ServiceWorkerManagerState,
    clientId: Request
  ): Promise<Response>;
}

export interface FetchManager {
  readonly name: string;
  matches(request: Request, url: URL): boolean;
  fetch(request: Request, url: URL, manifest: Manifest): Promise<Response>;
}
