import { AppInstance, AppInstanceImpl } from "./fetch-manager";
import {
  InstalledServiceWorkerManager,
  ServiceWorkerManager,
  ServiceWorkerManagerState,
} from "./interfaces";

export class AppInstances {
  private installed: WeakMap<
    ServiceWorker,
    InstalledServiceWorkerManager
  > = new WeakMap();
  private instances: WeakMap<WindowClient, AppInstance> = new WeakMap();

  constructor(readonly sw: ServiceWorkerGlobalScope) {}

  setInstalled(
    sw: ServiceWorker,
    manager: InstalledServiceWorkerManager
  ): void {
    this.installed.set(sw, manager);
  }

  async connect(
    manager: ServiceWorkerManager,
    sw: ServiceWorker,
    state: ServiceWorkerManagerState
  ): Promise<InstalledServiceWorkerManager> {
    let installed = this.installed.get(sw);

    if (!installed) {
      installed = await manager.connect(state, sw);
      this.installed.set(sw, installed);
    }

    return installed;
  }

  getInstalled(sw: ServiceWorker): InstalledServiceWorkerManager | undefined {
    return this.installed.get(sw);
  }

  async getWindowClient(id: string): Promise<WindowClient | undefined> {
    let client = await this.sw.clients.get(id);

    if (client === undefined || client.type !== "window") {
      return;
    }

    return client as WindowClient;
  }

  async addAppInstance(
    client: WindowClient,
    instancePromise: Promise<AppInstance>
  ): Promise<AppInstance> {
    let instance = await instancePromise;

    if (this.instances.has(client)) {
      throw Error(`addAppInstance should only be called once per SW client`);
    }

    this.instances.set(client, instance);
    return instance;
  }
}

export class ServiceWorkerInstance {
  constructor(
    readonly sw: ServiceWorkerGlobalScope,
    readonly manager: ServiceWorkerManager
  ) {}
}
