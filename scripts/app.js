function _classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver).value;
}
function _classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    var descriptor = privateMap.get(receiver);
    if (!descriptor.writable) {
        throw new TypeError("attempted to set read only private field");
    }
    descriptor.value = value;
    return value;
}
/// <reference path="./globals.d.ts">
import SimpleFS from "https://cdn.skypack.dev/@forlagshuset/simple-fs@0.4.1";
import { ElementFacade, FormFacade } from "./dom.js";
import { boot } from "./index.js";
import { Result } from "./result.js";
import { bootObservers } from "./resize.js";
const ELEMENTS = {
    form: {
        itself: new FormFacade(document.querySelector("#transform")),
        name: new ElementFacade(document.querySelector("#module-name")),
        source: new ElementFacade(document.querySelector("#module-source")),
        delete: new ElementFacade(document.querySelector("#delete"))
    },
    output: new ElementFacade(document.querySelector("#output")),
    nav: new ElementFacade(document.querySelector("#module-list"))
};
const DEFAULT_CODE = strip`\n  import { TITLE } from "./constants";\n  import type { Box } from "./box";\n\n  function helloWorld(input: Box<string>): string {\n    return TITLE + input.content;\n  }\n`;
const DEFAULT_SOURCES = [
    {
        filename: "hello.ts",
        code: DEFAULT_CODE
    }, 
];
let id = 0;
function createPlaceholderSource() {
    return {
        filename: `hello-${id++}.ts`,
        code: DEFAULT_CODE
    };
}
const FS = new SimpleFS();
function relative(root, child) {
    if (!child.startsWith(root)) {
        throw new Error(`${child} is not nested under ${root}`);
    }
    return child.slice(root.length + 1);
}
const ROOT = "/app/sources";
async function getSources() {
    let files = [];
    for (let source of await FS.ls(ROOT)){
        let body = await FS.readFile(source.path);
        files.push({
            filename: relative(ROOT, source.path),
            code: await body.text()
        });
    }
    return files;
}
export class App {
    static async boot() {
        await bootObservers();
        let sources = await App.initializeSources();
        const state = {
            sources
        };
        const wasm = await boot();
        const form = ELEMENTS.form.itself;
        let app = new App({
            state,
            form,
            delete: ELEMENTS.form.delete,
            wasm
        });
        app.boot();
        return app;
    }
    static async initializeSources() {
        await FS.mkdirParents(ROOT);
        let files = await FS.ls(ROOT);
        if (files.length === 0) {
            for (let source of DEFAULT_SOURCES){
                FS.writeFile(`${ROOT}/${source.filename}`, new Blob([
                    source.code
                ]));
            }
        }
        return getSources();
    }
    get form() {
        return _classPrivateFieldGet(this, _delegate).form;
    }
    transform(code) {
        return Result.lift(_classPrivateFieldGet(this, _delegate).wasm.transform(code));
    }
    boot() {
        this.populateNav();
        _classPrivateFieldGet(this, _delegate).delete.on("click", async ()=>{
            await this.deleteSource(this.form.data);
        });
        this.form.on("submit", ()=>{
            this.addSource(this.form.data);
        });
        this.form.on("keydown", (event)=>{
            // TODO: A better portable solution (this will cause win-S to trigger save on Windows instead
            // of the Windows search).
            let modifierOn = event.ctrlKey || event.metaKey;
            if (event.key === "s" && modifierOn) {
                this.addSource(this.form.data);
                event.preventDefault();
            }
        }, {
            allowDefault: true
        });
        this.form.on("input", ()=>{
            this.transform(this.form.data.code).do({
                ifOk: (transformed)=>{
                    ELEMENTS.output.replaceText(transformed.code);
                },
                ifErr: (reason)=>{
                    ELEMENTS.output.replaceText(reason);
                    console.error(reason);
                }
            });
        });
    }
    async firstSource() {
        let sources = await App.initializeSources();
        return sources[0];
    }
    async addSource(source) {
        await FS.writeFile(`${ROOT}/${source.filename}`, new Blob([
            source.code
        ]));
        _classPrivateFieldGet(this, _delegate).state.sources = await getSources();
        this.populateNav();
    }
    async deleteSource(source) {
        await FS.unlink(`${ROOT}/${source.filename}`);
        await App.initializeSources();
        _classPrivateFieldGet(this, _delegate).state.sources = await getSources();
        this.pickSource(await this.firstSource());
        this.populateNav();
    }
    pickSource(source) {
        ELEMENTS.form.name.attr("value", source.filename);
        ELEMENTS.form.source.replaceText(source.code);
        this.form.fire(new InputEvent("input"));
    }
    populateNav() {
        ELEMENTS.nav.replaceContents((append)=>{
            for (let source of _classPrivateFieldGet(this, _delegate).state.sources){
                let sourceNav = new ElementFacade(el(`<button class="filename">${source.filename}</button>`)).on("click", ()=>{
                    this.pickSource(source);
                });
                let trashNav = new ElementFacade(el(`<button aria-label="Delete Module"><i class="fa fa-trash" aria-hidden="true"></i></button>`)).on("click", ()=>{
                    this.deleteSource(source);
                });
                append(sourceNav.element);
                append(trashNav.element);
            }
            let plusNav = new ElementFacade(el(`<button>+</button>`)).on("click", async ()=>{
                await this.addSource(createPlaceholderSource());
            });
            append(plusNav.element);
        });
    }
    constructor(delegate){
        _delegate.set(this, {
            writable: true,
            value: void 0
        });
        _classPrivateFieldSet(this, _delegate, delegate);
    }
}
var _delegate = new WeakMap();
function frag(content) {
    let template = document.createElement("template");
    template.innerHTML = content;
    return template.content;
}
function el(content) {
    let template = document.createElement("template");
    template.innerHTML = content;
    return template.content.firstElementChild;
}
function strip([text]) {
    let lines = text.split("\n").slice(1, -1);
    let minIndent = lines.reduce((min, l)=>{
        // pure whitespace lines don't affect the calculation.
        if (l.match(/^\s*$/)) {
            return min;
        }
        return Math.min(min, l.match(/^(\s*)/)[1].length);
    }, Infinity);
    return lines.map((l)=>l.slice(minIndent)
    ).join("\n");
}

