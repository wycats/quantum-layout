import { Manifest } from "../manifest";
import { AppInstanceImpl } from "./fetch-manager";
import {
  FetchManagers,
  InstalledServiceWorkerManager,
  ServiceWorkerManagerState,
} from "./interfaces";

export class InstalledServiceWorkerManagerImpl
  implements InstalledServiceWorkerManager {
  constructor(
    readonly fetchManagers: FetchManagers,
    readonly manifestURL: URL
  ) {}

  async navigate(state: ServiceWorkerManagerState, request: Request) {
    let loading = Manifest.load({
      indexRequest: request,
      manifestURL: this.manifestURL,
    });

    let manifest = await loading.entries();

    return new AppInstanceImpl(manifest, loading.indexResponse);
  }
}
