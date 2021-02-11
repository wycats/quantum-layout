import { addingHeaders } from "../env";
import { fetchLocal } from "./local";
import { transform } from "./wasm";
import { FetchManager } from "../manager/interfaces";
import { updatedResponse } from "./utils";

export class TypescriptFetchManager implements FetchManager {
  matches(request: Request, url: URL): boolean {
    return url.pathname.endsWith(".ts");
  }

  async fetch(request: Request, url: URL): Promise<Response> {
    let response = await fetchLocal(request);
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

export const TS = new TypescriptFetchManager();
