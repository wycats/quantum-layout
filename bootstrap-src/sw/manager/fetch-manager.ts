import { Manifest } from "../manifest";

export interface AppInstance {
  readonly manifest: Manifest;
  index(url: URL): Promise<Response>;
}

export class AppInstanceImpl implements AppInstance {
  constructor(
    readonly manifest: Manifest,
    readonly indexResponse: Promise<Response>
  ) {}

  index(): Promise<Response> {
    return this.indexResponse;
  }
}
