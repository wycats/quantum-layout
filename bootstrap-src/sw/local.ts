import { addingHeaders } from "./env";

export function isLocal(request: Request): boolean {
  let url = new URL(request.url);

  return url.origin === origin && url.pathname !== "/";
}

export async function fetchLocal(request: Request): Promise<Response> {
  let url = new URL(request.url);

  try {
    let response = await fetch(request);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: addingHeaders(response.headers, { "Cache-Control": "no-cache" }),
    });
  } catch (e) {
    throw e;
  }
}
