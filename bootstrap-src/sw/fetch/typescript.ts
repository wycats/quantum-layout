import { addingHeaders } from "../env";
import { fetchLocal } from "./local";
import { transform } from "./wasm";
import { FetchManager } from "../manager/interfaces";
import { updatedResponse } from "./utils";
import { Manifest } from "../manifest";

export class TypescriptFetchManager implements FetchManager {
  readonly name = "typescript";

  constructor(readonly isMatch: (url: URL) => boolean) {}

  matches(request: Request, url: URL): boolean {
    return this.isMatch(url);
  }

  async fetch(
    originalRequest: Request,
    originalURL: URL,
    manifest: Manifest
  ): Promise<Response> {
    let url = new URL(`${originalURL.href}.ts`);
    let request = new Request(url.href, originalRequest);

    let response = await fetchLocal(request, url, manifest);
    let string = await response.text();

    let transpiled = await transform(string);

    if (typeof transpiled === "string") {
      throw Error(`Compilation error: ${transpiled}`);
    }

    return updatedResponse(response, {
      body: transpiled.code,
      headers: { "Content-Type": "application/javascript" },
    });
  }
}
