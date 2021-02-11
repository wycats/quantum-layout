export interface ManifestEntry {
  filename: string;
  hash: string;
}

export type ManifestEntries = {
  [P in string]: ManifestEntry;
};

export class LoadingManifest {
  constructor(
    readonly manifest: Promise<ManifestEntries>,
    readonly indexResponse: Promise<Response>
  ) {}

  async index(): Promise<Response> {
    return this.indexResponse;
  }

  async entries(): Promise<Manifest> {
    let entries = await this.manifest;

    return new Manifest(entries);
  }
}

export class Manifest {
  static load({
    indexRequest,
    manifestURL,
  }: {
    indexRequest: Request;
    manifestURL: URL;
  }): LoadingManifest {
    let manifest = fetchManifest(manifestURL);
    let index = fetch(indexRequest);

    return new LoadingManifest(manifest, index);
  }

  constructor(readonly manifest: ManifestEntries) {}

  has(path: string): boolean {
    return path in this.manifest;
  }
}

async function fetchManifest(url: URL) {
  let response = await fetch(url.href);
  return response.json();
}
