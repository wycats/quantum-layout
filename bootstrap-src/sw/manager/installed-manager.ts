import { ENV } from "../env";
import { Manifest } from "../manifest";
import { AppInstance, AppInstanceImpl } from "./fetch-manager";
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
  ) {
    console.log("manifestURL", manifestURL);
  }

  async connect(
    _state: ServiceWorkerManagerState,
    clientId: string
  ): Promise<AppInstance> {
    ENV.trace("state", "connect");
    let manifest = await Manifest.load(this.manifestURL, clientId);

    return new AppInstanceImpl(manifest, clientId);
  }

  async navigate(
    _state: ServiceWorkerManagerState,
    request: Request
  ): Promise<Response> {
    return fetch(request);
  }
}
