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
const ENV = Environment.default("\u{1f9d9}").enable("manager");
const ENV1 = ENV;
function addingHeaders2(original, adding) {
    let headers = new Headers(original);
    for (let [key, value] of Object.entries(adding))headers.set(key, value);
    return headers;
}
const addingHeaders1 = addingHeaders2;
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
class LocalFetchManager {
    matches(request, url) {
        return url.origin === origin;
    }
    async fetch(request, url) {
        return fetchLocal(request);
    }
}
const FETCH_LOCAL = new LocalFetchManager();
async function fetchLocal(request) {
    let response = await fetch(request);
    return updatedResponse(response, {
        headers: {
            "Cache-Control": "no-cache"
        }
    });
}
class LongevityFetchManager {
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
}
const FETCH_LONG_LIVED = new LongevityFetchManager();
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
}
const FETCH_WASM = new WasmFetchManager();
async function wasm() {
    let source = await fetch("./bootstrap/wasm.js");
    let bootWASM = new Function(`${await source.text()};\n\nreturn sugar`)();
    return bootWASM();
}
let WASM = null;
class LoadingManifest {
    async index() {
        return this.indexResponse;
    }
    async entries() {
        let entries = await this.manifest;
        return new Manifest(entries);
    }
    constructor(manifest, indexResponse){
        this.manifest = manifest;
        this.indexResponse = indexResponse;
    }
}
class Manifest {
    static load({ indexRequest , manifestURL  }) {
        let manifest1 = fetchManifest(manifestURL);
        let index = fetch(indexRequest);
        return new LoadingManifest(manifest1, index);
    }
    has(path) {
        return path in this.manifest;
    }
    constructor(manifest1){
        this.manifest = manifest1;
    }
}
async function fetchManifest(url) {
    let response = await fetch(url.href);
    return response.json();
}
class AppInstanceImpl {
    index() {
        return this.indexResponse;
    }
    constructor(manifest2, indexResponse1){
        this.manifest = manifest2;
        this.indexResponse = indexResponse1;
    }
}
class InstalledServiceWorkerManagerImpl {
    async navigate(state, request) {
        let loading = Manifest.load({
            indexRequest: request,
            manifestURL: this.manifestURL
        });
        let manifest3 = await loading.entries();
        return new AppInstanceImpl(manifest3, loading.indexResponse);
    }
    constructor(fetchManagers, manifestURL){
        this.fetchManagers = fetchManagers;
        this.manifestURL = manifestURL;
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
        let client = await this.sw.clients.get(id);
        if (client === undefined || client.type !== "window") return;
        return client;
    }
    async addAppInstance(client, instancePromise) {
        let instance = await instancePromise;
        if (this.instances.has(client)) throw Error(`addAppInstance should only be called once per SW client`);
        this.instances.set(client, instance);
        return instance;
    }
    constructor(sw2){
        this.sw = sw2;
        this.installed = new WeakMap();
        this.instances = new WeakMap();
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
    constructor(fetchManagers1, defaultManager = new DefaultFetchManager()){
        this.fetchManagers = fetchManagers1;
        this.defaultManager = defaultManager;
    }
}
function initializeSW(sw2, manager2) {
    const STATE = ServiceWorkerStateImpl.of(sw2);
    sw2.addEventListener("install", (e)=>{
        const target = swFromEvent(e, "install");
        async function install() {
            ENV.trace("manager", "on:install start");
            await manager2.prefetch(STATE);
            let installed = await manager2.install(STATE, target);
            STATE.instances.setInstalled(target, installed);
            if (manager2.skipWaiting) await sw2.skipWaiting();
            ENV.trace("manager", "on:install end");
        }
        e.waitUntil(install());
    });
    sw2.addEventListener("activate", (e)=>{
        async function activate() {
            ENV.trace("manager", "on:activate start");
            if (manager2.skipWaiting) {
                ENV.trace("manager", "on:activate waiting for clients.claim");
                await sw2.clients.claim();
            }
            ENV.trace("manager", "on:activate end");
        }
        e.waitUntil(activate());
    });
    sw2.addEventListener("fetch", (e)=>{
        const sw11 = swFromEvent(e, "fetch");
        const request = e.request;
        e.respondWith(handleFetch());
        async function handleFetch() {
            let installed = await STATE.instances.connect(manager2, sw11, STATE);
            if (request.mode === "navigate") return handleNavigation(installed);
            let url = new URL(request.url);
            let fetchManager = installed.fetchManagers.match(request, url);
            return fetchManager.fetch(request, url);
        }
        async function handleNavigation(installed) {
            // let client = await STATE.instances.getWindowClient(e.clientId);
            let navigation = installed.navigate(STATE, request);
            let instance = await navigation;
            // let instance = await STATE.instances.addAppInstance(client, navigation);
            return instance.index(new URL(request.url));
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
const FETCH_MANAGERS = FetchManagers.default().add(FETCH_WASM, FETCH_SKYPACK, FETCH_LONG_LIVED, FETCH_LOCAL);
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
    constructor(sw3){
        this.sw = sw3;
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
    const sw4 = self;
    ENV.trace("top-level", "top level");
    initializeSW(sw4, new ServiceWorkerManagerImpl(sw4));
}
boot();
