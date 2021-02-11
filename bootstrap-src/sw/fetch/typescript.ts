import { addingHeaders } from "../env";
import { fetchLocal } from "./local";
import { transform } from "./wasm";
import { FetchManager } from "../manager/interfaces";
import { updatedResponse } from "./utils";
import { Manifest } from "../manifest";

export class TypescriptFetchManager implements FetchManager {
  readonly name = "typescript";

  matches(request: Request, url: URL): boolean {
    return url.pathname.endsWith(".ts");
  }

  async fetch(
    request: Request,
    url: URL,
    manifest: Manifest
  ): Promise<Response> {
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

export const FETCH_TS = new TypescriptFetchManager();
