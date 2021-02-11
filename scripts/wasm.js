function WASM() {
    let cachedTextDecoder = new TextDecoder("utf-8", {
        ignoreBOM: true,
        fatal: true
    });
    cachedTextDecoder.decode();
    const heap = new Array(32).fill(undefined);
    heap.push(undefined, null, true, false);
    let heap_next = heap.length;
    function addHeapObject(obj) {
        if (heap_next === heap.length) heap.push(heap.length + 1);
        const idx = heap_next;
        heap_next = heap[idx];
        heap[idx] = obj;
        return idx;
    }
    function getObject(idx) {
        return heap[idx];
    }
    let WASM_VECTOR_LEN = 0;
    let cachedTextEncoder = new TextEncoder();
    const encodeString = typeof cachedTextEncoder.encodeInto === "function" ? function(arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
    } : function(arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
    function dropObject(idx) {
        if (idx < 36) return;
        heap[idx] = heap_next;
        heap_next = idx;
    }
    function takeObject(idx) {
        const ret = getObject(idx);
        dropObject(idx);
        return ret;
    }
    /**
   * The WASM functions return strings to represent errors. This protocol assumes that a successful
   * value is an object, and therefore we could differentiate a successful value from an unsuccessful
   * value by whether it is a string.
   */ function takeResult(idx) {
        return takeObject(idx);
    }
    function __wbindgen_rethrow(arg0) {
        throw takeObject(arg0);
    }
    async function relativeFetch(request) {
        let req = typeof request === "string" ? new Request("/bootstrap/swc.wasm") : request;
        return fetch(req);
    }
    async function boot() {
        const response = await relativeFetch("./swc.wasm");
        let wasm;
        let cachegetUint8Memory0 = null;
        function getUint8Memory0() {
            if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
                cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
            }
            return cachegetUint8Memory0;
        }
        function parseSync(s, opts) {
            var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            var ret = wasm.parseSync(ptr0, len0, addHeapObject(opts));
            return takeResult(ret);
        }
        function printSync(s, opts) {
            var ret = wasm.printSync(addHeapObject(s), addHeapObject(opts));
            return takeResult(ret);
        }
        function __wbindgen_json_parse(ptr, len) {
            var ret = JSON.parse(getStringFromWasm0(ptr, len));
            return addHeapObject(ret);
        }
        function __wbindgen_json_serialize(arg0, arg1) {
            const obj = getObject(arg1);
            var ret = JSON.stringify(obj === undefined ? null : obj);
            var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
        }
        function __wbindgen_string_new(arg0, arg1) {
            var ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        }
        function __wbindgen_object_drop_ref(arg0) {
            takeObject(arg0);
        }
        function __wbg_new_59cb74e423758ede() {
            var ret = new Error();
            return addHeapObject(ret);
        }
        function __wbg_stack_558ba5917b466edd(arg0, arg1) {
            var ret = getObject(arg1).stack;
            var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
        }
        function __wbg_error_4bb6c2a97407129a(arg0, arg1) {
            try {
                console.error(getStringFromWasm0(arg0, arg1));
            } finally{
                wasm.__wbindgen_free(arg0, arg1);
            }
        }
        function getStringFromWasm0(ptr, len) {
            return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
        }
        function passStringToWasm0(arg, malloc, realloc) {
            if (realloc === undefined) {
                const buf = cachedTextEncoder.encode(arg);
                const ptr = malloc(buf.length);
                getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
                WASM_VECTOR_LEN = buf.length;
                return ptr;
            }
            let len = arg.length;
            let ptr = malloc(len);
            const mem = getUint8Memory0();
            let offset = 0;
            for(; offset < len; offset++){
                const code = arg.charCodeAt(offset);
                if (code > 127) break;
                mem[ptr + offset] = code;
            }
            if (offset !== len) {
                if (offset !== 0) {
                    arg = arg.slice(offset);
                }
                ptr = realloc(ptr, len, len = offset + arg.length * 3);
                const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
                const ret = encodeString(arg, view);
                offset += ret.written;
            }
            WASM_VECTOR_LEN = offset;
            return ptr;
        }
        let cachegetInt32Memory0 = null;
        function getInt32Memory0() {
            if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
                cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
            }
            return cachegetInt32Memory0;
        }
        function transformSync(s, opts) {
            var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            var ret = wasm.transformSync(ptr0, len0, addHeapObject(opts));
            return takeObject(ret);
        }
        const imports = {
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
                transformSync
            }
        };
        const { instance: wasmInstance  } = await WebAssembly.instantiateStreaming(response, imports);
        wasm = wasmInstance.exports;
        const _wasm = wasmInstance.exports;
        return {
            transform: transformSync,
            parse: parseSync
        };
    }
    return boot;
}
/** The defaults correspond to Stage 3 */ const DEFAULT_OPTIONS = {
    isModule: true
};
const DEFAULT_PARSER_OPTIONS = {
    typescript: {
        syntax: "typescript",
        tsx: false,
        decorators: false,
        dynamicImport: true
    },
    ecmascript: {
        syntax: "ecmascript",
        jsx: false,
        numericSeparator: true,
        classPrivateProperty: true,
        privateMethod: true,
        classProperty: true,
        functionBind: false,
        decorators: false,
        decoratorsBeforeExport: false,
        dynamicImport: true,
        nullishCoalescing: true,
        exportDefaultFrom: true,
        exportNamespaceFrom: true,
        importMeta: true
    }
};
const DEFAULT_JSC_OPTIONS = {
    target: "es2020"
};
async function sugar() {
    let boot = await WASM();
    let wasm = await boot();
    const transform = (source, options)=>{
        let smoke = smokeParse(wasm, source);
        if (typeof smoke === "string") {
            return smoke;
        }
        let builtParserOptions;
        let passedParserOptions = options?.jsc?.parser;
        if (passedParserOptions) {
            builtParserOptions = {
                ...DEFAULT_PARSER_OPTIONS[passedParserOptions.syntax],
                ...passedParserOptions
            };
        } else {
            builtParserOptions = DEFAULT_PARSER_OPTIONS.typescript;
        }
        let builtJscOptions = {
            ...DEFAULT_JSC_OPTIONS,
            ...options?.jsc,
            parser: builtParserOptions
        };
        let builtOptions = {
            ...DEFAULT_OPTIONS,
            ...options,
            jsc: builtJscOptions
        };
        return wasm.transform(source, builtOptions);
    };
    return {
        transform
    };
}
function smokeParse(imports, source) {
    try {
        imports.parse(source, {
            syntax: "typescript",
            tsx: true,
            decorators: true,
            dynamicImport: true
        });
        return;
    } catch (e) {
        return e;
    }
}

