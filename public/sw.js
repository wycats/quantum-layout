class Environment {
    static default(defaultIcon) {
        return new Environment({
            icons: {
                default: defaultIcon
            },
            enabled: new Set()
        });
    }
    icon(category, icon) {
        return new Environment({
            ...this.log,
            icons: {
                ...this.log.icons,
                [category]: icon
            }
        });
    }
    enable(...categories) {
        return new Environment({
            ...this.log,
            enabled: new Set([
                ...this.log.enabled,
                ...categories
            ])
        });
    }
    getIcon(category) {
        let icons = this.log.icons;
        return icons[category] || icons.default;
    }
    trace(...args) {
        let { force , category , message  } = traceArgs(args);
        if (force || this.log.enabled.has(category) || this.log.enabled.has("*")) console.log(`${this.getIcon(category)} <${category}>`, ...message);
    }
    constructor(log){
        this.log = log;
    }
}
function traceArgs(args) {
    if (typeof args[0] === "boolean") {
        let [, category, ...message] = args;
        return {
            force: true,
            category,
            message
        };
    } else {
        let [category, ...message] = args;
        return {
            force: false,
            category,
            message
        };
    }
}
const ENV = Environment.default("\u{1f9d9}").enable("state", "cache");
const ENV1 = ENV;
function addingHeaders(original, adding) {
    let headers = new Headers(original);
    for (let [key, value] of Object.entries(adding))headers.set(key, value);
    return headers;
}
const addingHeaders1 = addingHeaders;
function isLocal(request) {
    let url = new URL(request.url);
    return url.origin === origin && url.pathname !== "/";
}
async function fetchLocal(request) {
    let url = new URL(request.url);
    try {
        let response = await fetch(request);
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: addingHeaders(response.headers, {
                "Cache-Control": "no-cache"
            })
        });
    } catch (e) {
        throw e;
    }
}
function hasLongevity(request) {
    if (!isLocal(request)) return null;
    let url = new URL(request.url);
    let path = url.pathname;
    if (path.endsWith(".ttf") || path.endsWith(".woff2")) return "font";
    if (path.endsWith(".wasm")) return "wasm";
    if (path.endsWith(".png")) return "png";
    return null;
}
async function fetchLongevity(request, type) {
    const longevity = await caches.open(`embroider:longevity:${type}`);
    let response = await longevity.match(request);
    if (!response) {
        response = await fetch(request);
        response = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: addingHeaders1(response.headers, {
                "Cache-Control": "public, max-age=31536000"
            })
        });
        await longevity.put(request, response);
    }
    return response;
}
function isSkypack(request) {
    let url = new URL(request.url);
    return url.hostname === "cdn.skypack.dev" && !url.pathname.startsWith("/-/");
}
function fetchSkypack(request) {
    let { pathname , href  } = new URL(request.url);
    if (pathname.startsWith("/-/")) return fetch(request);
    let match = pathname.match(/^\/(?<pkg>@?[^@]*)@(?<version>.*)$/);
    if (!match) throw Error(`fetchSkypack was unexpected called with an invalid Skypack URL (${href})`);
    let { pkg , version  } = match.groups;
    return PACKAGES.get(pkg, version);
}
class Package {
    async get(version) {
        let url = `https://cdn.skypack.dev/${this.name}@${version}`;
        let cache = this.versions[version];
        if (!cache) {
            cache = new Promise(async (fulfill, reject)=>{
                try {
                    let cache1 = await caches.open(`skypack:${this.name}@${version}`);
                    let request = new Request(url, {
                        redirect: "follow"
                    });
                    let response = await fetch(request, {
                        redirect: "follow"
                    });
                    ENV1.trace(true, "fetch", "skypack response", response);
                    if (response.status < 200 || response.status >= 300) {
                        ENV1.trace(true, "error", `response was not 2xx`, response);
                        reject(Error(`unexpected status (${response.status}) from Skypack (${url})`));
                    } else {
                        cache1.put(request, response);
                        fulfill(cache1);
                    }
                } catch (e) {
                    reject(e);
                }
            });
            this.versions[version] = cache;
        }
        let c = await cache;
        if (c === undefined) debugger;
        let match = await c.match(url);
        if (!match) throw Error(`Unexpected URL missing in package cache: ${url}`);
        return match;
    }
    constructor(name1){
        this.versions = {
        };
        this.name = name1;
    }
}
class Packages {
    async get(name, version) {
        let pkg = this.packages[name];
        if (!pkg) {
            pkg = new Package(name);
            this.packages[name] = pkg;
        }
        console.log("PKG", pkg, version);
        return pkg.get(version);
    }
    constructor(){
        this.packages = {
        };
    }
}
const PACKAGES = new Packages();
async function wasm() {
    let source = await fetch("./bootstrap/wasm.js");
    let bootWASM = new Function(`${await source.text()};\n\nreturn sugar`)();
    return bootWASM();
}
let WASM = null;
async function transform(source, opts) {
    if (WASM === null) WASM = wasm();
    let { transform: transform1  } = await WASM;
    return transform1(source, opts);
}
let WASM_CACHE = caches.open("swc.wasm");
async function fetchWASM() {
    let cache = await WASM_CACHE;
    let wasm1 = new Request("/bootstrap/swc.wasm");
    let response = await cache.match(wasm1);
    if (response) ENV.trace("cache", "cache hit: swc");
    else {
        console.time("fetching:swc");
        ENV.trace("cache", "cache miss: swc");
        ENV.trace("fetch", "fetching swc");
        await cache.add(wasm1);
        response = await cache.match(wasm1);
        console.timeEnd("fetching:swc");
        ENV.trace("fetch", "fetched swc");
    }
    return response;
}
function isTS(request) {
    let url = new URL(request.url);
    return url.pathname.endsWith(".ts");
}
async function fetchTS(request) {
    let response = await fetchLocal(request);
    let string = await response.text();
    let transpiled = await transform(string);
    if (typeof transpiled === "string") throw Error(`Compilation error: ${transpiled}`);
    return new Response(transpiled.code, {
        status: response.status,
        statusText: response.statusText,
        headers: addingHeaders(response.headers, {
            "Content-Type": "application/javascript"
        })
    });
}
async function boot() {
    const sw = self;
    ENV.trace("top-level", "top level");
    sw.addEventListener("install", (e)=>{
        e.waitUntil(prefetch());
        async function prefetch() {
            await fetchWASM();
            return sw.skipWaiting();
        }
    });
    sw.addEventListener("activate", (e)=>{
        ENV.trace("state", "activated");
        e.waitUntil(sw.clients.claim());
    });
    sw.addEventListener("fetch", async (e)=>{
        ENV.trace("fetch", "pathname", new URL(e.request.url).pathname);
        if (new URL(e.request.url).pathname === "/bootstrap/swc.wasm") {
            ENV.trace(true, "fetch", "requesting swc.wasm");
            e.respondWith(fetchWASM());
            return;
        }
        if (isSkypack(e.request)) {
            ENV.trace(true, "fetch", `request skypack ${e.request.url}`, e.request);
            e.respondWith(fetchSkypack(e.request));
            return;
        }
        let longevity = hasLongevity(e.request);
        if (longevity) {
            ENV.trace(true, `longevity:${longevity}`, `request with longevity ${e.request.url}`, e.request);
            e.respondWith(fetchLongevity(e.request, longevity));
            return;
        }
        if (isLocal(e.request)) {
            if (isTS(e.request)) {
                ENV.trace(true, "fetch", `request TS ${e.request.url}`, e.request);
                e.respondWith(fetchTS(e.request));
                return;
            }
            ENV.trace("fetch", `request local ${e.request.url}`, e.request);
            e.respondWith(fetchLocal(e.request));
            return;
        }
        ENV.trace("fetch", "request", new URL(e.request.url).pathname, e.request.url);
    });
}
boot();
