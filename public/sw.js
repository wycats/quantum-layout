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
const ENV = Environment.default("\u{1f9d9}").enable("manager", "local");
const ENV1 = ENV;
function addingHeaders2(original, adding) {
    let headers = new Headers(original);
    for (let [key, value] of Object.entries(adding))headers.set(key, value);
    return headers;
}
const addingHeaders1 = addingHeaders2;
const LOCAL_CACHE = caches.open("embroider.local");
class LocalFetchManager {
    matches(request, url) {
        return url.origin === origin;
    }
    async fetch(request, url, manifest) {
        return fetchLocal(request, url, manifest);
    }
    constructor(){
        this.name = "local";
    }
}
const FETCH_LOCAL = new LocalFetchManager();
async function fetchLocal(request, url, manifest) {
    let response = await fetchLocalFile(request, url, manifest);
    if (response.ok) return response;
    else throw Error(`HTTP Request ${response.statusText} (${request.url})`);
}
function updatedResponse(response, { body =response.body , status =response.status , statusText =response.statusText , headers: addHeaders , replaceHeaders  }) {
    let headers = replaceHeaders ? new Headers(replaceHeaders) : addingHeaders3(response.headers, addHeaders || {
    });
    return new Response(body, {
        status,
        statusText,
        headers
    });
}
function addingHeaders3(original, adding) {
    let headers = new Headers(original);
    for (let [key, value] of Object.entries(adding))headers.set(key, value);
    return headers;
}
class HexDigest {
    async response(response) {
        let body = await response.arrayBuffer();
        return this.buffer(body);
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    async buffer(buffer) {
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer); // hash the message
        const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
        const hashHex = hashArray.map((b)=>b.toString(16).padStart(2, "0")
        ).join(""); // convert bytes to hex string
        return hashHex;
    }
}
const DIGEST = new HexDigest();
async function fetchLocalFile(request, url, manifest) {
    // slice off the leading `/`
    let path = url.pathname.slice(1);
    let start = performance.now();
    function elapsed() {
        return Math.round((performance.now() - start) * 100);
    }
    ENV.trace("local", "await LOCAL_CACHE", url.href, elapsed());
    let localCache = await LOCAL_CACHE;
    ENV.trace("local", "got cache", url.href, elapsed());
    // If the path is in the manifest, we'll use the manifest digest information to invalidate the
    // cache. Otherwise, don't cache the assets at all, and let them be downloaded again on every fetch.
    if (manifest.has(path)) {
        ENV.trace("local", "await localCache.match(request)", url.href, elapsed());
        let cachedResponse = await localCache.match(request);
        if (cachedResponse === undefined) {
            ENV.trace("local", "await manifest.fetch(request, localCache)", url.href, elapsed());
            let response = await manifest.fetch(request, localCache);
            if (response) {
                ENV.trace("local", "return response", url.href, elapsed());
                return response;
            }
        } else {
            ENV.trace("local", "manifest.validate(request, cachedResponse, localCache)", url.href, elapsed());
            let result = await manifest.validate(request, cachedResponse, localCache);
            if (result) {
                ENV.trace("local", "return result", url.href, elapsed());
                return result;
            } else {
                ENV.trace("local", "await localCache.delete", url.href, elapsed());
                // Otherwise, the file is no longer in the manifest, so it shouldn't be cached. But we still
                // want to let it fall back to normal semantics, so don't reject.
                await localCache.delete(request);
            }
        }
    }
    ENV.trace("local", `await fetch(request, { cache: "reload" })`, url.href, elapsed());
    let response = await fetch(request, {
        cache: "reload"
    });
    ENV.trace("local", `return updatedResponse(response, ...)`, url.href, elapsed());
    return updatedResponse(response, {
        headers: {
            "Cache-Control": "no-cache"
        }
    });
}
class LongLivedFetchManager {
    matches(request, url) {
        if (FETCH_LOCAL.matches(request, url)) return false;
        let type = assetType(url.pathname);
        return type !== null;
    }
    async fetch(request, url) {
        let type = assetType(url.pathname);
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
    constructor(){
        this.name = "long-lived";
    }
}
const FETCH_LONG_LIVED = new LongLivedFetchManager();
function assetType(path) {
    if (path.endsWith(".ttf") || path.endsWith(".woff2")) return "font";
    if (path.endsWith(".wasm")) return "wasm";
    if (path.endsWith(".png")) return "image";
    return null;
}
class SkypackFetchManager {
    matches(request, url) {
        return url.hostname === "cdn.skypack.dev" && !url.pathname.startsWith("/-/");
    }
    fetch(request, { pathname , href  }) {
        if (pathname.startsWith("/-/")) return fetch(request);
        let match = pathname.match(/^\/(?<pkg>@?[^@]*)@(?<version>.*)$/);
        if (!match) throw Error(`fetchSkypack was unexpected called with an invalid Skypack URL (${href})`);
        let { pkg , version  } = match.groups;
        return PACKAGES.get(pkg, version);
    }
    constructor(){
        this.name = "skypack";
    }
}
const FETCH_SKYPACK = new SkypackFetchManager();
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
                    ENV1.trace("fetch", "skypack response", response);
                    if (response.status < 200 || response.status >= 300) {
                        ENV1.trace("error", `response was not 2xx`, response);
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
        if (!match) {
            delete this.versions[version];
            return this.get(version);
        }
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
        return pkg.get(version);
    }
    constructor(){
        this.packages = {
        };
    }
}
const PACKAGES = new Packages();
const TS_CACHE = caches.open("typescript.local");
const WASM_CACHE = caches.open("swc.wasm");
class WasmFetchManager {
    matches(request, url) {
        return url.pathname === "/bootstrap/swc.wasm";
    }
    async fetch(request, url) {
        let cache = await WASM_CACHE;
        let response = await cache.match(request);
        if (!response) {
            await cache.add(request);
            response = await cache.match(request);
        }
        return response;
    }
    constructor(){
        this.name = "wasm";
    }
}
const FETCH_WASM = new WasmFetchManager();
async function wasm() {
    let raw = await fetch("/bootstrap/wasm.js");
    let source = await raw.text();
    let bootWASM = new Function(`${await source};\n\nreturn sugar`)();
    return bootWASM();
}
let WASM = null;
async function transform(source, opts) {
    if (WASM === null) WASM = wasm();
    let { transform: transform1  } = await WASM;
    return transform1(source, opts);
}
class TypescriptFetchManager {
    matches(request, url) {
        return this.isMatch(url);
    }
    async fetch(originalRequest, originalURL, manifest) {
        let cache = await TS_CACHE;
        let url = new URL(`${originalURL.href}.ts`);
        let request = new Request(url.href, originalRequest);
        let response = manifest.fetch(request, cache);
        // let response = await fetchLocal(request, url, manifest);
        let string = await response.text();
        let transpiled = await transform(string);
        if (typeof transpiled === "string") throw Error(`Compilation error: ${transpiled}`);
        return updatedResponse(response, {
            body: transpiled.code,
            headers: {
                "Content-Type": "application/javascript"
            }
        });
    }
    constructor(isMatch){
        this.isMatch = isMatch;
        this.name = "typescript";
    }
}
class Manifest {
    static async load(manifestURL, clientId) {
        let entries = await fetchManifest(manifestURL);
        return new Manifest(entries, clientId);
    }
    get entries() {
        return [
            ...Object.keys(this.manifest)
        ];
    }
    has(path) {
        return path in this.manifest;
    }
    digest(url) {
        return this.manifest[url.pathname.slice(1)]?.hash;
    }
    async isDigestValid(url, response) {
        let cachedDigest = await DIGEST.response(response.clone());
        let expectedDigest = this.digest(url);
        ENV.trace("verbose", {
            expected: expectedDigest,
            cached: cachedDigest
        });
        return cachedDigest === expectedDigest;
    }
    async validate(request, response, cache) {
        ENV.trace("cache", `checking cache for file in manifest (${request.url})`);
        ENV.trace("verbose", {
            manifest: this.manifest,
            clientId: this.clientId
        });
        let valid = await this.isDigestValid(new URL(request.url), response);
        if (valid) {
            ENV.trace("cache", `cache hit (${request.url})`);
            return response;
        }
        ENV.trace("cache", `manifest invalidated cache for ${request.url}`);
        return await this.fetch(request, cache);
    }
    async fetch(request, cache) {
        let path = new URL(request.url).pathname.slice(1);
        let entry = this.manifest[path];
        if (entry === undefined) return;
        let fetchResponse = await fetch(request, {
            cache: "reload"
        });
        let responseDigest = await DIGEST.response(fetchResponse.clone());
        let expectedDigest = entry.hash;
        if (responseDigest === expectedDigest) {
            cache.put(request, fetchResponse.clone());
            return fetchResponse.clone();
        } else if (responseDigest !== expectedDigest) {
            ENV.trace("error", `response for ${path} didn't match the digest from the manifest\n\nexpected: ${expectedDigest}\ngot     : ${responseDigest}`);
            // The user needs to reload, because the file has been updated since the manifest was
            // retrieved at the beginning of this navigation. TODO: automate and consider semantics.
            return Response.error();
        }
    }
    constructor(manifest2, clientId2){
        this.manifest = manifest2;
        this.clientId = clientId2;
    }
}
async function fetchManifest(url) {
    let response = await fetch(url.href, {
        cache: "reload"
    });
    console.log("dev.json", await response.clone().json());
    return response.json();
}
class AppInstanceImpl {
    constructor(manifest1, clientId1){
        this.manifest = manifest1;
        this.clientId = clientId1;
    }
}
class InstalledServiceWorkerManagerImpl {
    async connect(_state, clientId) {
        ENV.trace("state", "connect");
        let manifest2 = await Manifest.load(this.manifestURL, clientId);
        return new AppInstanceImpl(manifest2, clientId);
    }
    async navigate(_state, request) {
        return fetch(request);
    }
    constructor(fetchManagers, manifestURL){
        this.fetchManagers = fetchManagers;
        this.manifestURL = manifestURL;
        console.log("manifestURL", manifestURL);
    }
}
class AppInstances {
    setInstalled(sw, manager) {
        this.installed.set(sw, manager);
    }
    async connect(manager, sw, state) {
        let installed = this.installed.get(sw);
        if (!installed) {
            installed = await manager.connect(state, sw);
            this.installed.set(sw, installed);
        }
        return installed;
    }
    getInstalled(sw) {
        return this.installed.get(sw);
    }
    async getWindowClient(id) {
        let client = await this.swGlobal.clients.get(id);
        if (client === undefined || client.type !== "window") return;
        return client;
    }
    async gcClients() {
        let allClients = await this.swGlobal.clients.matchAll({
            type: "window"
        });
        let ids = new Set(allClients.map((c)=>c.id
        ));
        let instances = new Map();
        for (let [key, value] of this.instances)if (ids.has(key)) instances.set(key, value);
        this.instances = instances;
    }
    async addAppInstance(clientId, instancePromise) {
        let [instance] = await Promise.all([
            instancePromise,
            this.gcClients()
        ]);
        if (this.instances.has(clientId)) throw Error(`addAppInstance should only be called once per SW client`);
        this.instances.set(clientId, instance);
        return instance;
    }
    async navigateAppInstance(clientId, connect) {
        await this.gcClients();
        let instance = this.instances.get(clientId);
        if (instance) throw Error(`ASSUMPTION ERROR: clientId already mapped onto an instance during navigation (clientId: ${clientId})`);
        instance = await connect(clientId);
        this.instances.set(clientId, instance);
    }
    async getAppInstance(clientId, connect) {
        await this.gcClients();
        let instance = this.instances.get(clientId);
        if (!instance) {
            instance = await connect(clientId);
            this.instances.set(clientId, instance);
        }
        return instance;
    }
    constructor(swGlobal){
        this.swGlobal = swGlobal;
        this.installed = new WeakMap();
        this.instances = new Map();
    }
}
class ServiceWorkerInstance {
    constructor(sw1, manager1){
        this.sw = sw1;
        this.manager = manager1;
    }
}
class DefaultFetchManager {
    matches() {
        return true;
    }
    fetch(request) {
        return fetch(request);
    }
    constructor(){
        this.name = "default";
    }
}
const DEFAULT_FETCH_MANAGER = new DefaultFetchManager();
class FetchManagers {
    static default() {
        return new FetchManagers([], DEFAULT_FETCH_MANAGER);
    }
    add(...managers) {
        return new FetchManagers([
            ...this.fetchManagers,
            ...managers
        ], this.defaultManager);
    }
    default(manager) {
        return new FetchManagers(this.fetchManagers, manager);
    }
    match(request, url) {
        for (let manager2 of this.fetchManagers)if (manager2.matches(request, url)) return manager2;
        return this.defaultManager;
    }
    async fetch(request, url, manifest) {
        let manager2 = this.match(request, url);
        let response = await manager2.fetch(request, url, manifest);
        if (response.status === 0) return response;
        return updatedResponse(response, {
            headers: {
                "X-Fetch-Manager": manager2.name,
                "Cache-Control": "no-cache"
            }
        });
    }
    constructor(fetchManagers1, defaultManager = new DefaultFetchManager()){
        this.fetchManagers = fetchManagers1;
        this.defaultManager = defaultManager;
    }
}
function initializeSW(swGlobal1, manager2) {
    const STATE = ServiceWorkerStateImpl.of(swGlobal1);
    swGlobal1.addEventListener("install", (e)=>{
        const target = swFromEvent(e, "install");
        async function install() {
            ENV.trace("manager", "on:install start");
            await manager2.prefetch(STATE);
            let installed = await manager2.install(STATE, target);
            STATE.instances.setInstalled(target, installed);
            if (manager2.skipWaiting) await swGlobal1.skipWaiting();
            ENV.trace("manager", "on:install end");
        }
        e.waitUntil(install());
    });
    swGlobal1.addEventListener("activate", (e)=>{
        async function activate() {
            ENV.trace("manager", "on:activate start");
            if (manager2.skipWaiting) {
                ENV.trace("manager", "on:activate waiting for clients.claim");
                await swGlobal1.clients.claim();
            }
            ENV.trace("manager", "on:activate end");
        }
        e.waitUntil(activate());
    });
    swGlobal1.addEventListener("fetch", (e)=>{
        const sw1 = swFromEvent(e, "fetch");
        const request = e.request;
        const url = new URL(request.url);
        // let handledFetch = handleFetch();
        e.respondWith(handleFetch());
        async function handleFetch() {
            let installed = await STATE.instances.connect(manager2, sw1, STATE);
            if (request.mode === "navigate") {
                ENV.trace("state", "navigate", {
                    clientId: e.resultingClientId
                });
                let connectPromise = STATE.instances.navigateAppInstance(e.resultingClientId, (id)=>installed.connect(STATE, id)
                );
                let [_connect, response] = await Promise.all([
                    connectPromise,
                    handleNavigation(installed), 
                ]);
                return response;
            }
            ENV.trace("state", "fetch", {
                clientId: e.clientId,
                url: request.url
            });
            ENV.trace("local", "await STATE.instances.getAppInstance", request.url);
            let instance = await STATE.instances.getAppInstance(e.clientId, (id)=>installed.connect(STATE, id)
            );
            ENV.trace("local", "instance", request.url);
            let url1 = new URL(request.url);
            return installed.fetchManagers.fetch(request, url1, instance.manifest);
        }
        async function handleNavigation(installed) {
            // let client = await STATE.instances.getWindowClient(e.clientId);
            let navigation = await installed.navigate(STATE, request);
            console.log("navigation", navigation);
            await swGlobal1.clients.claim();
            return navigation;
        }
    });
}
class ServiceWorkerStateImpl {
    static of(sw) {
        let instances = new AppInstances(sw);
        return new ServiceWorkerStateImpl(instances);
    }
    constructor(instances){
        this.instances = instances;
    }
}
const FETCH_MANAGERS = FetchManagers.default().add(FETCH_WASM, FETCH_SKYPACK, FETCH_LONG_LIVED, new TypescriptFetchManager((url)=>{
    return url.pathname.startsWith("/app/") || url.pathname.startsWith("/bootstrap/");
}), FETCH_LOCAL);
class ServiceWorkerManagerImpl {
    async prefetch() {
        await wasm();
    }
    async install(state, sw) {
        return new InstalledServiceWorkerManagerImpl(FETCH_MANAGERS, new URL("/dev.json", origin));
    }
    async connect(state, sw) {
        return new InstalledServiceWorkerManagerImpl(FETCH_MANAGERS, new URL("/dev.json", origin));
    }
    constructor(sw2){
        this.sw = sw2;
        this.skipWaiting = true;
    }
}
function isSW(target) {
    return typeof target === "object" && target !== null && target instanceof ServiceWorker;
}
function swFromEvent(e, name) {
    let target = assertServiceWorkerEventTarget(e.target, name);
    return target.serviceWorker;
}
function assertServiceWorkerEventTarget(target, name) {
    if (target === null) throw Error(`ASSUMPTION ERROR: e.target in a service worker event (${name}) was null`);
    if ("serviceWorker" in target) {
        if (isSW(target.serviceWorker)) return target;
        else throw Error(`ASSUMPTION ERROR: e.target.serviceWorker in a service worker event (${name}) was not an instance of ServiceWorker`);
    } else throw Error(`ASSUMPTION ERROR: e.target in a service worker event (${name}) did not have a serviceWorker property`);
}
async function boot() {
    const sw3 = self;
    ENV.trace("top-level", "top level");
    initializeSW(sw3, new ServiceWorkerManagerImpl(sw3));
}
boot();
