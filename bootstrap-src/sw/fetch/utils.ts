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

class HexDigest {
  async response(response: Response) {
    let body = await response.arrayBuffer();
    return this.buffer(body);
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
  async buffer(buffer: ArrayBuffer) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""); // convert bytes to hex string
    return hashHex;
  }
}

export const DIGEST = new HexDigest();
