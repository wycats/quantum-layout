import { AppInstance, AppInstanceImpl } from "./fetch-manager";
import {
  InstalledServiceWorkerManager,
  ServiceWorkerManager,
  ServiceWorkerManagerState,
} from "./interfaces";

type InstanceMap = Map<string, AppInstance>;

export class AppInstances {
  private installed: WeakMap<
    ServiceWorker,
    InstalledServiceWorkerManager
  > = new WeakMap();
  private instances: InstanceMap = new Map();

  constructor(readonly swGlobal: ServiceWorkerGlobalScope) {}

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
    let client = await this.swGlobal.clients.get(id);

    if (client === undefined || client.type !== "window") {
      return;
    }

    return client as WindowClient;
  }

  async gcClients(): Promise<void> {
    let allClients = await this.swGlobal.clients.matchAll({ type: "window" });
    let ids = new Set(allClients.map((c) => c.id));

    let instances: InstanceMap = new Map();

    for (let [key, value] of this.instances) {
      if (ids.has(key)) {
        instances.set(key, value);
      }
    }

    this.instances = instances;
  }

  async addAppInstance(
    clientId: string,
    instancePromise: Promise<AppInstance>
  ): Promise<AppInstance> {
    let [instance] = await Promise.all([instancePromise, this.gcClients()]);

    if (this.instances.has(clientId)) {
      throw Error(`addAppInstance should only be called once per SW client`);
    }

    this.instances.set(clientId, instance);
    return instance;
  }

  async navigateAppInstance(
    clientId: string,
    connect: (clientId: string) => Promise<AppInstance>
  ): Promise<void> {
    await this.gcClients();
    let instance = this.instances.get(clientId);

    if (instance) {
      throw Error(
        `ASSUMPTION ERROR: clientId already mapped onto an instance during navigation (clientId: ${clientId})`
      );
    }

    instance = await connect(clientId);
    this.instances.set(clientId, instance);
  }

  async getAppInstance(
    clientId: string,
    connect: (clientId: string) => Promise<AppInstance>
  ): Promise<AppInstance> {
    await this.gcClients();
    let instance = this.instances.get(clientId);

    if (!instance) {
      instance = await connect(clientId);
      this.instances.set(clientId, instance);
    }

    return instance;
  }
}

export class ServiceWorkerInstance {
  constructor(
    readonly sw: ServiceWorkerGlobalScope,
    readonly manager: ServiceWorkerManager
  ) {}
}
