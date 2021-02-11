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

  match(request: Request, url: URL): FetchManager {
    for (let manager of this.fetchManagers) {
      if (manager.matches(request, url)) {
        return manager;
      }
    }

    return this.defaultManager;
  }
}

export interface InstalledServiceWorkerManager {
  readonly fetchManagers: FetchManagers;

  navigate(
    state: ServiceWorkerManagerState,
    request: Request
  ): Promise<AppInstance>;
}

export interface FetchManager {
  matches(request: Request, url: URL): boolean;
  fetch(request: Request, url: URL): Promise<Response>;
}
