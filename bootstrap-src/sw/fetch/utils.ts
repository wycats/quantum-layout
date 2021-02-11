export function updatedResponse(
  response: Response,
  {
    body = response.body,
    status = response.status,
    statusText = response.statusText,
    headers: addHeaders,
    replaceHeaders,
  }: {
    body?: BodyInit | null;
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
    replaceHeaders?: Record<string, string>;
  }
) {
  let headers = replaceHeaders
    ? new Headers(replaceHeaders)
    : addingHeaders(response.headers, addHeaders || {});

  return new Response(body, {
    status,
    statusText,
    headers,
  });
}

function addingHeaders(
  original: Headers,
  adding: Record<string, string>
): Headers {
  let headers = new Headers(original);

  for (let [key, value] of Object.entries(adding)) {
    headers.set(key, value);
  }
  return headers;
}
