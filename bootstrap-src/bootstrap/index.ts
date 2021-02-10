import type { PublicExports, SugaryExports } from "./wasm.js";

export async function boot(): Promise<SugaryExports> {
  let source = await fetch("/bootstrap/wasm.js");
  let body = await source.text();

  let bootWASM: () => Promise<PublicExports> = new Function(
    `${body}\n\nreturn sugar`
  )();

  return bootWASM();
}
