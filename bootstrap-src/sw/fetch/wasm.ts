import * as swc from "@swc/core";
import { PublicExports, SugaryExports } from "../../bootstrap/wasm";
import { ENV } from "../env";
import { FetchManager } from "../manager/interfaces";

const WASM_CACHE = caches.open("swc.wasm");

export class WasmFetchManager implements FetchManager {
  readonly name = "wasm";

  matches(request: Request, url: URL): boolean {
    return url.pathname === "/bootstrap/swc.wasm";
  }

  async fetch(request: Request, url: URL): Promise<Response> {
    let cache = await WASM_CACHE;

    let response = await cache.match(request);

    if (!response) {
      await cache.add(request);
      response = await cache.match(request);
    }

    return response as Response;
  }
}

export const FETCH_WASM = new WasmFetchManager();

export async function wasm(): Promise<SugaryExports> {
  let source = await fetch("./bootstrap/wasm.js");
  let bootWASM: () => Promise<PublicExports> = new Function(
    `${await source.text()};\n\nreturn sugar`
  )();

  return bootWASM();
}

let WASM: Promise<SugaryExports> | null = null;

export async function transform(
  source: string,
  opts?: swc.Options
): Promise<swc.Output | string> {
  if (WASM === null) {
    WASM = wasm();
  }

  let { transform } = await WASM;
  return transform(source, opts);
}
