import * as swc from "@swc/core";
import { PublicExports, SugaryExports } from "../bootstrap/wasm";
import { ENV } from "./env";

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

let WASM_CACHE = caches.open("swc.wasm");

export async function fetchWASM(): Promise<Response> {
  let cache = await WASM_CACHE;
  let wasm = new Request("/bootstrap/swc.wasm");

  let response = await cache.match(wasm);

  if (response) {
    ENV.trace("cache", "cache hit: swc");
  } else {
    console.time("fetching:swc");
    ENV.trace("cache", "cache miss: swc");
    ENV.trace("fetch", "fetching swc");
    await cache.add(wasm);

    response = await cache.match(wasm);
    console.timeEnd("fetching:swc");
    ENV.trace("fetch", "fetched swc");
  }

  return response as Response;
}
