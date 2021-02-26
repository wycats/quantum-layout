import type { PublicExports, SugaryExports } from "../bootstrap/wasm";

export async function boot(): Promise<SugaryExports> {
  let source = await fetch("/bootstrap/wasm");
  let body = await source.text();

  let bootWASM: () => Promise<PublicExports> = new Function(
    `${body}\n\nreturn sugar`
  )();

  return bootWASM();
}
