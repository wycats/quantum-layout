import { addingHeaders } from "./env";
import { fetchLocal } from "./local";
import { transform } from "./wasm";

export function isTS(request: Request): boolean {
  let url = new URL(request.url);

  return url.pathname.endsWith(".ts");
}

export async function fetchTS(request: Request): Promise<Response> {
  let response = await fetchLocal(request);
  let string = await response.text();

  let transpiled = await transform(string);

  if (typeof transpiled === "string") {
    throw Error(`Compilation error: ${transpiled}`);
  }

  return new Response(transpiled.code, {
    status: response.status,
    statusText: response.statusText,
    headers: addingHeaders(response.headers, {
      "Content-Type": "application/javascript",
    }),
  });
}
