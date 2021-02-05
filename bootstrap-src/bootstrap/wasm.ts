import type * as swc from "@swc/core";
import { Result } from "./result.js";

let cachedTextDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

cachedTextDecoder.decode();

const heap = new Array<unknown>(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next: unknown = heap.length;

function addHeapObject(obj: unknown): number {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next as number;
  heap_next = heap[idx];

  heap[idx] = obj;
  return idx;
}

function getObject<T>(idx: number): T {
  return heap[idx] as T;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder();

const encodeString =
  typeof cachedTextEncoder.encodeInto === "function"
    ? function (arg: string, view: Uint8Array) {
        return cachedTextEncoder.encodeInto(arg, view);
      }
    : function (arg: string, view: Uint8Array) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
          read: arg.length,
          written: buf.length,
        };
      };

function dropObject(idx: number) {
  if (idx < 36) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject<T>(idx: HeapPointer<T>): T {
  const ret = getObject(idx);
  dropObject(idx);
  return ret as T;
}

/**
 * The WASM functions return strings to represent errors. This protocol assumes that a successful
 * value is an object, and therefore we could differentiate a successful value from an unsuccessful
 * value by whether it is a string.
 */
function takeResult<T extends object>(idx: HeapPointer<T>): Result<T> {
  return Result.lift<T>(takeObject(idx));
}

interface TypescriptSyntax {
  syntax: "typescript";
  tsx?: boolean;
  decorators?: boolean;
  dynamicImport?: boolean;
  importAssertions?: boolean;
}

type Syntax = TypescriptSyntax;

type ParseOptions = {
  comments: boolean;
  isModule: boolean;
  target: "es2020";
} & Syntax;

export function __wbindgen_rethrow(arg0: number): never {
  throw takeObject(arg0);
}

console.log(import.meta);
async function cachedFetch(
  name: string,
  request: string | Request
): Promise<Response> {
  let cache = await caches.open(name);
  let req =
    typeof request === "string"
      ? new Request(new URL("./wasm_bg.wasm", import.meta.url).href)
      : request;
  let cached = await cache.match(req);

  if (cached === undefined) {
    await cache.add(req);
    return cachedFetch(name, req);
  } else {
    return cached;
  }
}

export interface PublicExports {
  transform(s: string, opts?: swc.Options): Result<swc.Output>;
  parse(s: string, opts?: swc.ParseOptions): Result<swc.Module | swc.Script>;
}

export async function boot(): Promise<PublicExports> {
  const response = await cachedFetch("swc/wasm", "./wasm_bg.wasm");

  let wasm: Wasm;

  let cachegetUint8Memory0: Uint8Array | null = null;
  function getUint8Memory0(): Uint8Array {
    if (
      cachegetUint8Memory0 === null ||
      cachegetUint8Memory0.buffer !== wasm.memory.buffer
    ) {
      cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
  }

  function parseSync(
    s: string,
    opts?: swc.ParseOptions
  ): Result<swc.Script | swc.Module> {
    var ptr0 = passStringToWasm0(
      s,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.parseSync(ptr0, len0, addHeapObject(opts));
    return takeResult(ret);
  }

  function printSync(s: string, opts?: swc.Options): Result<swc.Output> {
    var ret = wasm.printSync(addHeapObject(s), addHeapObject(opts));
    return takeResult(ret);
  }

  function __wbindgen_json_parse(ptr: number, len: number) {
    var ret = JSON.parse(getStringFromWasm0(ptr, len));
    return addHeapObject(ret);
  }

  function __wbindgen_json_serialize(arg0: number, arg1: number) {
    const obj = getObject(arg1);
    var ret = JSON.stringify(obj === undefined ? null : obj);
    var ptr0 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
  }

  function __wbindgen_string_new(arg0: number, arg1: number) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
  }

  function __wbindgen_object_drop_ref(arg0: number) {
    takeObject(arg0);
  }

  function __wbg_new_59cb74e423758ede() {
    var ret = new Error();
    return addHeapObject(ret);
  }

  function __wbg_stack_558ba5917b466edd(arg0: number, arg1: number) {
    var ret = getObject<{ stack: string }>(arg1).stack;
    var ptr0 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
  }

  function __wbg_error_4bb6c2a97407129a(arg0: number, arg1: number) {
    try {
      console.error(getStringFromWasm0(arg0, arg1));
    } finally {
      wasm.__wbindgen_free(arg0, arg1);
    }
  }

  function getStringFromWasm0(ptr: number, len: number) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
  }

  function passStringToWasm0(
    arg: string,
    malloc: Wasm["__wbindgen_malloc"],
    realloc: Wasm["__wbindgen_realloc"]
  ): number {
    if (realloc === undefined) {
      const buf = cachedTextEncoder.encode(arg);
      const ptr = malloc(buf.length);
      getUint8Memory0()
        .subarray(ptr, ptr + buf.length)
        .set(buf);
      WASM_VECTOR_LEN = buf.length;
      return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
      const code = arg.charCodeAt(offset);
      if (code > 0x7f) break;
      mem[ptr + offset] = code;
    }

    if (offset !== len) {
      if (offset !== 0) {
        arg = arg.slice(offset);
      }
      ptr = realloc(ptr, len, (len = offset + arg.length * 3));
      const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
      const ret = encodeString(arg, view);

      offset += ret.written as number;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
  }

  let cachegetInt32Memory0: null | Int32Array = null;
  function getInt32Memory0() {
    if (
      cachegetInt32Memory0 === null ||
      cachegetInt32Memory0.buffer !== wasm.memory.buffer
    ) {
      cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
  }

  function transformSync(s: string, opts?: swc.Options): Result<swc.Output> {
    var ptr0 = passStringToWasm0(
      s,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc
    );
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.transformSync(ptr0, len0, addHeapObject(opts));
    return takeObject(ret);
  }

  const imports: SwcImports = {
    __wbindgen_placeholder__: {
      __wbindgen_json_parse,
      __wbindgen_json_serialize,
      __wbindgen_string_new,
      __wbindgen_object_drop_ref,
      __wbg_new_59cb74e423758ede,
      __wbg_stack_558ba5917b466edd,
      __wbg_error_4bb6c2a97407129a,
      __wbindgen_rethrow,
      parseSync,
      printSync,
      transformSync,
    },
  };

  const { instance: wasmInstance } = await WebAssembly.instantiateStreaming(
    response,
    imports
  );
  wasm = (wasmInstance.exports as unknown) as Wasm;

  const _wasm = (wasmInstance.exports as unknown) as Wasm;

  interface SwcImports extends WebAssembly.Imports {
    __wbindgen_placeholder__: InnerImports;
  }

  return { transform: transformSync, parse: parseSync };
}

interface InnerImports extends Record<string, WebAssembly.ImportValue> {
  __wbindgen_json_parse: (ptr: number, len: number) => number;
  __wbindgen_json_serialize: (arg0: number, arg1: number) => void;
  __wbindgen_string_new: (arg0: number, arg1: number) => number;
  __wbindgen_object_drop_ref: (arg0: number) => void;
  __wbg_new_59cb74e423758ede: () => number;
  __wbg_stack_558ba5917b466edd: (arg0: number, arg1: number) => void;
  __wbg_error_4bb6c2a97407129a: (arg0: number, arg1: number) => void;
  __wbindgen_rethrow: (arg0: number) => never;
  parseSync: (
    s: string,
    opts: swc.ParseOptions
  ) => Result<swc.Script | swc.Module>;
  printSync: (s: string, opts: swc.Options) => Result<swc.Output>;
  transformSync: (s: string, opts: swc.Options) => Result<swc.Output>;
}

type HeapPointer<T> = number;

interface Wasm {
  memory: Uint8Array;
  __wbindgen_malloc: (len: number) => number;
  __wbindgen_realloc: (ptr: number, size: number, newSize: number) => number;
  __wbindgen_free: (arg0: number, arg1: number) => number;
  parseSync: (
    ptr0: number,
    len0: number,
    object: HeapPointer<ParseOptions>
  ) => HeapPointer<string>;
  printSync(
    string: number,
    options: HeapPointer<ParseOptions>
  ): HeapPointer<string>;
  transformSync(
    ptr0: number,
    len0: number,
    options: HeapPointer<swc.Options>
  ): HeapPointer<string>;
}
