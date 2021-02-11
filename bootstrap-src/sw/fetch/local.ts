import { addingHeaders } from "../env";
import { FetchManager } from "../manager/interfaces";
import { updatedResponse } from "./utils";

// TODO: use the manifest
export class LocalFetchManager implements FetchManager {
  matches(request: Request, url: URL): boolean {
    return url.origin === origin;
  }

  async fetch(request: Request, url: URL): Promise<Response> {
    return fetchLocal(request);
  }
}

export const FETCH_LOCAL = new LocalFetchManager();

export async function fetchLocal(request: Request) {
  let response = await fetch(request);

  return updatedResponse(response, {
    headers: { "Cache-Control": "no-cache" },
  });
}
