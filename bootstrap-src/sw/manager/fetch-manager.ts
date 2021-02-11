import { Manifest } from "../manifest";

export interface AppInstance {
  readonly manifest: Manifest;
  readonly clientId: string;
}

export class AppInstanceImpl implements AppInstance {
  constructor(readonly manifest: Manifest, readonly clientId: string) {}
}
