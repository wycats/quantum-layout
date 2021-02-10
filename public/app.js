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
        console.log(ROOT, files);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC1zcmMvYm9vdHN0cmFwL2FwcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9nbG9iYWxzLmQudHNcIj5cblxuaW1wb3J0IFNpbXBsZUZTLCB7XG4gIFN0YXRzLFxufSBmcm9tIFwiaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvQGZvcmxhZ3NodXNldC9zaW1wbGUtZnNAMC40LjFcIjtcbmltcG9ydCB7IEVsZW1lbnRGYWNhZGUsIEZvcm1EZXNjLCBGb3JtRmFjYWRlIH0gZnJvbSBcIi4vZG9tLmpzXCI7XG5pbXBvcnQgeyBib290IH0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCB7IE1heWJlLCBSZXN1bHQgfSBmcm9tIFwiLi9yZXN1bHQuanNcIjtcbmltcG9ydCB0eXBlICogYXMgc3djIGZyb20gXCJAc3djL2NvcmVcIjtcbmltcG9ydCB7IGJvb3RPYnNlcnZlcnMgfSBmcm9tIFwiLi9yZXNpemUuanNcIjtcbmltcG9ydCB7IFN1Z2FyeUV4cG9ydHMgfSBmcm9tIFwiLi93YXNtLmpzXCI7XG5cbmNvbnN0IEVMRU1FTlRTID0ge1xuICBmb3JtOiB7XG4gICAgaXRzZWxmOiBuZXcgRm9ybUZhY2FkZTxTb3VyY2U-KFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0cmFuc2Zvcm1cIikgYXMgSFRNTEZvcm1FbGVtZW50XG4gICAgKSxcbiAgICBuYW1lOiBuZXcgRWxlbWVudEZhY2FkZShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbW9kdWxlLW5hbWVcIikgYXMgSFRNTElucHV0RWxlbWVudFxuICAgICksXG4gICAgc291cmNlOiBuZXcgRWxlbWVudEZhY2FkZShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbW9kdWxlLXNvdXJjZVwiKSBhcyBIVE1MVGV4dEFyZWFFbGVtZW50XG4gICAgKSxcbiAgICBkZWxldGU6IG5ldyBFbGVtZW50RmFjYWRlKFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZWxldGVcIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcbiAgICApLFxuICB9LFxuICBvdXRwdXQ6IG5ldyBFbGVtZW50RmFjYWRlKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjb3V0cHV0XCIpIGFzIEhUTUxEaXZFbGVtZW50XG4gICksXG4gIG5hdjogbmV3IEVsZW1lbnRGYWNhZGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtb2R1bGUtbGlzdFwiKSBhcyBIVE1MRWxlbWVudCksXG59O1xuXG5jb25zdCBERUZBVUxUX0NPREUgPSBzdHJpcGBcbiAgaW1wb3J0IHsgVElUTEUgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbiAgaW1wb3J0IHR5cGUgeyBCb3ggfSBmcm9tIFwiLi9ib3hcIjtcblxuICBmdW5jdGlvbiBoZWxsb1dvcmxkKGlucHV0OiBCb3g8c3RyaW5nPik6IHN0cmluZyB7XG4gICAgcmV0dXJuIFRJVExFICsgaW5wdXQuY29udGVudDtcbiAgfVxuYDtcblxuY29uc3QgREVGQVVMVF9TT1VSQ0VTOiBTb3VyY2VbXSA9IFtcbiAge1xuICAgIGZpbGVuYW1lOiBcImhlbGxvLnRzXCIsXG4gICAgY29kZTogREVGQVVMVF9DT0RFLFxuICB9LFxuXTtcblxubGV0IGlkID0gMDtcblxuZnVuY3Rpb24gY3JlYXRlUGxhY2Vob2xkZXJTb3VyY2UoKTogU291cmNlIHtcbiAgcmV0dXJuIHtcbiAgICBmaWxlbmFtZTogYGhlbGxvLSR7aWQrK30udHNgLFxuICAgIGNvZGU6IERFRkFVTFRfQ09ERSxcbiAgfTtcbn1cblxuaW50ZXJmYWNlIFNvdXJjZSBleHRlbmRzIEZvcm1EZXNjIHtcbiAgZmlsZW5hbWU6IHN0cmluZztcbiAgY29kZTogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgQXBwRGVsZWdhdGUge1xuICByZWFkb25seSBzdGF0ZToge1xuICAgIHNvdXJjZXM6IHJlYWRvbmx5IFNvdXJjZVtdO1xuICB9O1xuICByZWFkb25seSBmb3JtOiBGb3JtRmFjYWRlPFNvdXJjZT47XG4gIHJlYWRvbmx5IGRlbGV0ZTogRWxlbWVudEZhY2FkZTxIVE1MQnV0dG9uRWxlbWVudD47XG4gIHJlYWRvbmx5IHdhc206IFN1Z2FyeUV4cG9ydHM7XG59XG5cbnR5cGUgSURCVmFsdWUgPVxuICB8IHN0cmluZ1xuICB8IG51bWJlclxuICB8IGJvb2xlYW5cbiAgfCBudWxsXG4gIHwgeyBbUCBpbiBzdHJpbmddOiBJREJWYWx1ZSB9XG4gIHwgSURCVmFsdWVbXTtcblxuY29uc3QgRlMgPSBuZXcgU2ltcGxlRlMoKTtcblxuZnVuY3Rpb24gcmVsYXRpdmUocm9vdDogc3RyaW5nLCBjaGlsZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCFjaGlsZC5zdGFydHNXaXRoKHJvb3QpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2NoaWxkfSBpcyBub3QgbmVzdGVkIHVuZGVyICR7cm9vdH1gKTtcbiAgfVxuXG4gIHJldHVybiBjaGlsZC5zbGljZShyb290Lmxlbmd0aCArIDEpO1xufVxuXG5jb25zdCBST09UID0gXCIvYXBwL3NvdXJjZXNcIjtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U291cmNlcygpOiBQcm9taXNlPHJlYWRvbmx5IFNvdXJjZVtdPiB7XG4gIGxldCBmaWxlczogU291cmNlW10gPSBbXTtcblxuICBmb3IgKGxldCBzb3VyY2Ugb2YgYXdhaXQgRlMubHMoUk9PVCkpIHtcbiAgICBsZXQgYm9keSA9IGF3YWl0IEZTLnJlYWRGaWxlKHNvdXJjZS5wYXRoKTtcbiAgICBmaWxlcy5wdXNoKHtcbiAgICAgIGZpbGVuYW1lOiByZWxhdGl2ZShST09ULCBzb3VyY2UucGF0aCksXG4gICAgICBjb2RlOiBhd2FpdCBib2R5LnRleHQoKSxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBmaWxlcztcbn1cblxuZXhwb3J0IGNsYXNzIEFwcCB7XG4gIHN0YXRpYyBhc3luYyBib290KCk6IFByb21pc2U8QXBwPiB7XG4gICAgYXdhaXQgYm9vdE9ic2VydmVycygpO1xuICAgIGxldCBzb3VyY2VzID0gYXdhaXQgQXBwLmluaXRpYWxpemVTb3VyY2VzKCk7XG5cbiAgICBjb25zdCBzdGF0ZSA9IHtcbiAgICAgIHNvdXJjZXMsXG4gICAgfTtcblxuICAgIGNvbnN0IHdhc20gPSBhd2FpdCBib290KCk7XG4gICAgY29uc3QgZm9ybSA9IEVMRU1FTlRTLmZvcm0uaXRzZWxmO1xuXG4gICAgbGV0IGFwcCA9IG5ldyBBcHAoe1xuICAgICAgc3RhdGUsXG4gICAgICBmb3JtLFxuICAgICAgZGVsZXRlOiBFTEVNRU5UUy5mb3JtLmRlbGV0ZSxcbiAgICAgIHdhc20sXG4gICAgfSk7XG5cbiAgICBhcHAuYm9vdCgpO1xuICAgIHJldHVybiBhcHA7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgaW5pdGlhbGl6ZVNvdXJjZXMoKTogUHJvbWlzZTxyZWFkb25seSBTb3VyY2VbXT4ge1xuICAgIGF3YWl0IEZTLm1rZGlyUGFyZW50cyhST09UKTtcbiAgICBsZXQgZmlsZXMgPSBhd2FpdCBGUy5scyhST09UKTtcbiAgICBjb25zb2xlLmxvZyhST09ULCBmaWxlcyk7XG5cbiAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBmb3IgKGxldCBzb3VyY2Ugb2YgREVGQVVMVF9TT1VSQ0VTKSB7XG4gICAgICAgIEZTLndyaXRlRmlsZShgJHtST09UfS8ke3NvdXJjZS5maWxlbmFtZX1gLCBuZXcgQmxvYihbc291cmNlLmNvZGVdKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldFNvdXJjZXMoKTtcbiAgfVxuXG4gICNkZWxlZ2F0ZTogQXBwRGVsZWdhdGU7XG5cbiAgY29uc3RydWN0b3IoZGVsZWdhdGU6IEFwcERlbGVnYXRlKSB7XG4gICAgdGhpcy4jZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGZvcm0oKTogRm9ybUZhY2FkZTxTb3VyY2U-IHtcbiAgICByZXR1cm4gdGhpcy4jZGVsZWdhdGUuZm9ybTtcbiAgfVxuXG4gIHByaXZhdGUgdHJhbnNmb3JtKGNvZGU6IHN0cmluZyk6IFJlc3VsdDxzd2MuT3V0cHV0PiB7XG4gICAgcmV0dXJuIFJlc3VsdC5saWZ0KHRoaXMuI2RlbGVnYXRlLndhc20udHJhbnNmb3JtKGNvZGUpKTtcbiAgfVxuXG4gIGJvb3QoKSB7XG4gICAgdGhpcy5wb3B1bGF0ZU5hdigpO1xuXG4gICAgdGhpcy4jZGVsZWdhdGUuZGVsZXRlLm9uKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5kZWxldGVTb3VyY2UodGhpcy5mb3JtLmRhdGEpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5mb3JtLm9uKFwic3VibWl0XCIsICgpID0-IHtcbiAgICAgIHRoaXMuYWRkU291cmNlKHRoaXMuZm9ybS5kYXRhKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZm9ybS5vbihcbiAgICAgIFwia2V5ZG93blwiLFxuICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgIC8vIFRPRE86IEEgYmV0dGVyIHBvcnRhYmxlIHNvbHV0aW9uICh0aGlzIHdpbGwgY2F1c2Ugd2luLVMgdG8gdHJpZ2dlciBzYXZlIG9uIFdpbmRvd3MgaW5zdGVhZFxuICAgICAgICAvLyBvZiB0aGUgV2luZG93cyBzZWFyY2gpLlxuICAgICAgICBsZXQgbW9kaWZpZXJPbiA9IGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleTtcblxuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBcInNcIiAmJiBtb2RpZmllck9uKSB7XG4gICAgICAgICAgdGhpcy5hZGRTb3VyY2UodGhpcy5mb3JtLmRhdGEpO1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7IGFsbG93RGVmYXVsdDogdHJ1ZSB9XG4gICAgKTtcblxuICAgIHRoaXMuZm9ybS5vbihcImlucHV0XCIsICgpID0-IHtcbiAgICAgIHRoaXMudHJhbnNmb3JtKHRoaXMuZm9ybS5kYXRhLmNvZGUpLmRvKHtcbiAgICAgICAgaWZPazogKHRyYW5zZm9ybWVkKSA9PiB7XG4gICAgICAgICAgRUxFTUVOVFMub3V0cHV0LnJlcGxhY2VUZXh0KHRyYW5zZm9ybWVkLmNvZGUpO1xuICAgICAgICB9LFxuICAgICAgICBpZkVycjogKHJlYXNvbikgPT4ge1xuICAgICAgICAgIEVMRU1FTlRTLm91dHB1dC5yZXBsYWNlVGV4dChyZWFzb24pO1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZmlyc3RTb3VyY2UoKTogUHJvbWlzZTxTb3VyY2U-IHtcbiAgICBsZXQgc291cmNlcyA9IGF3YWl0IEFwcC5pbml0aWFsaXplU291cmNlcygpO1xuICAgIHJldHVybiBzb3VyY2VzWzBdIGFzIFNvdXJjZTtcbiAgfVxuXG4gIGFzeW5jIGFkZFNvdXJjZShzb3VyY2U6IFNvdXJjZSkge1xuICAgIGF3YWl0IEZTLndyaXRlRmlsZShgJHtST09UfS8ke3NvdXJjZS5maWxlbmFtZX1gLCBuZXcgQmxvYihbc291cmNlLmNvZGVdKSk7XG5cbiAgICB0aGlzLiNkZWxlZ2F0ZS5zdGF0ZS5zb3VyY2VzID0gYXdhaXQgZ2V0U291cmNlcygpO1xuXG4gICAgdGhpcy5wb3B1bGF0ZU5hdigpO1xuICB9XG5cbiAgYXN5bmMgZGVsZXRlU291cmNlKHNvdXJjZTogU291cmNlKSB7XG4gICAgYXdhaXQgRlMudW5saW5rKGAke1JPT1R9LyR7c291cmNlLmZpbGVuYW1lfWApO1xuICAgIGF3YWl0IEFwcC5pbml0aWFsaXplU291cmNlcygpO1xuICAgIHRoaXMuI2RlbGVnYXRlLnN0YXRlLnNvdXJjZXMgPSBhd2FpdCBnZXRTb3VyY2VzKCk7XG4gICAgdGhpcy5waWNrU291cmNlKGF3YWl0IHRoaXMuZmlyc3RTb3VyY2UoKSk7XG5cbiAgICB0aGlzLnBvcHVsYXRlTmF2KCk7XG4gIH1cblxuICBwaWNrU291cmNlKHNvdXJjZTogU291cmNlKSB7XG4gICAgRUxFTUVOVFMuZm9ybS5uYW1lLmF0dHIoXCJ2YWx1ZVwiLCBzb3VyY2UuZmlsZW5hbWUpO1xuICAgIEVMRU1FTlRTLmZvcm0uc291cmNlLnJlcGxhY2VUZXh0KHNvdXJjZS5jb2RlKTtcbiAgICB0aGlzLmZvcm0uZmlyZShuZXcgSW5wdXRFdmVudChcImlucHV0XCIpKTtcbiAgfVxuXG4gIHBvcHVsYXRlTmF2KCk6IHZvaWQge1xuICAgIEVMRU1FTlRTLm5hdi5yZXBsYWNlQ29udGVudHMoKGFwcGVuZCkgPT4ge1xuICAgICAgZm9yIChsZXQgc291cmNlIG9mIHRoaXMuI2RlbGVnYXRlLnN0YXRlLnNvdXJjZXMpIHtcbiAgICAgICAgbGV0IHNvdXJjZU5hdiA9IG5ldyBFbGVtZW50RmFjYWRlKFxuICAgICAgICAgIGVsKGA8YnV0dG9uIGNsYXNzPVwiZmlsZW5hbWVcIj4ke3NvdXJjZS5maWxlbmFtZX08L2J1dHRvbj5gKVxuICAgICAgICApLm9uKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMucGlja1NvdXJjZShzb3VyY2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgdHJhc2hOYXYgPSBuZXcgRWxlbWVudEZhY2FkZShcbiAgICAgICAgICBlbChcbiAgICAgICAgICAgIGA8YnV0dG9uIGFyaWEtbGFiZWw9XCJEZWxldGUgTW9kdWxlXCI-PGkgY2xhc3M9XCJmYSBmYS10cmFzaFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2J1dHRvbj5gXG4gICAgICAgICAgKVxuICAgICAgICApLm9uKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZGVsZXRlU291cmNlKHNvdXJjZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcGVuZChzb3VyY2VOYXYuZWxlbWVudCk7XG4gICAgICAgIGFwcGVuZCh0cmFzaE5hdi5lbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgbGV0IHBsdXNOYXYgPSBuZXcgRWxlbWVudEZhY2FkZShlbChgPGJ1dHRvbj4rPC9idXR0b24-YCkpLm9uKFxuICAgICAgICBcImNsaWNrXCIsXG4gICAgICAgIGFzeW5jICgpID0-IHtcbiAgICAgICAgICBhd2FpdCB0aGlzLmFkZFNvdXJjZShjcmVhdGVQbGFjZWhvbGRlclNvdXJjZSgpKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIGFwcGVuZChwbHVzTmF2LmVsZW1lbnQpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZyYWcoY29udGVudDogc3RyaW5nKSB7XG4gIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZW1wbGF0ZVwiKTtcbiAgdGVtcGxhdGUuaW5uZXJIVE1MID0gY29udGVudDtcbiAgcmV0dXJuIHRlbXBsYXRlLmNvbnRlbnQ7XG59XG5cbmZ1bmN0aW9uIGVsPEUgZXh0ZW5kcyBFbGVtZW50ID0gSFRNTEVsZW1lbnQ-KGNvbnRlbnQ6IHN0cmluZyk6IEUge1xuICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGVtcGxhdGVcIik7XG4gIHRlbXBsYXRlLmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gIHJldHVybiB0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkIGFzIEU7XG59XG5cbmZ1bmN0aW9uIHN0cmlwKFt0ZXh0XTogVGVtcGxhdGVTdHJpbmdzQXJyYXkpOiBzdHJpbmcge1xuICBsZXQgbGluZXMgPSB0ZXh0LnNwbGl0KFwiXFxuXCIpLnNsaWNlKDEsIC0xKTtcblxuICBsZXQgbWluSW5kZW50ID0gbGluZXMucmVkdWNlKChtaW4sIGwpID0-IHtcbiAgICAvLyBwdXJlIHdoaXRlc3BhY2UgbGluZXMgZG9uJ3QgYWZmZWN0IHRoZSBjYWxjdWxhdGlvbi5cbiAgICBpZiAobC5tYXRjaCgvXlxccyokLykpIHtcbiAgICAgIHJldHVybiBtaW47XG4gICAgfVxuXG4gICAgcmV0dXJuIE1hdGgubWluKG1pbiwgbC5tYXRjaCgvXihcXHMqKS8pIVsxXS5sZW5ndGgpO1xuICB9LCBJbmZpbml0eSk7XG4gIHJldHVybiBsaW5lcy5tYXAoKGwpID0-IGwuc2xpY2UobWluSW5kZW50KSkuam9pbihcIlxcblwiKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLEVBQUEsbUNBQUE7T0FFQSxRQUFBLE9BRUEscURBQUE7U0FDQSxhQUFBLEVBQUEsVUFBQSxTQUFBLFFBQUE7U0FDQSxJQUFBLFNBQUEsVUFBQTtTQUNBLE1BQUEsU0FBQSxXQUFBO1NBRUEsYUFBQSxTQUFBLFdBQUE7TUFHQSxRQUFBO0FBQ0EsUUFBQTtBQUNBLGNBQUEsTUFBQSxVQUFBLENBQ0EsUUFBQSxDQUFBLGFBQUEsRUFBQSxVQUFBO0FBRUEsWUFBQSxNQUFBLGFBQUEsQ0FDQSxRQUFBLENBQUEsYUFBQSxFQUFBLFlBQUE7QUFFQSxjQUFBLE1BQUEsYUFBQSxDQUNBLFFBQUEsQ0FBQSxhQUFBLEVBQUEsY0FBQTtBQUVBLGNBQUEsTUFBQSxhQUFBLENBQ0EsUUFBQSxDQUFBLGFBQUEsRUFBQSxPQUFBOztBQUdBLFVBQUEsTUFBQSxhQUFBLENBQ0EsUUFBQSxDQUFBLGFBQUEsRUFBQSxPQUFBO0FBRUEsT0FBQSxNQUFBLGFBQUEsQ0FBQSxRQUFBLENBQUEsYUFBQSxFQUFBLFlBQUE7O01BR0EsWUFBQSxHQUFBLEtBQUEsQ0FBQSw4S0FPQTtNQUVBLGVBQUE7O0FBRUEsZ0JBQUEsR0FBQSxRQUFBO0FBQ0EsWUFBQSxFQUFBLFlBQUE7OztJQUlBLEVBQUEsR0FBQSxDQUFBO1NBRUEsdUJBQUE7O0FBRUEsZ0JBQUEsR0FBQSxNQUFBLEVBQUEsRUFBQSxHQUFBLEdBQUE7QUFDQSxZQUFBLEVBQUEsWUFBQTs7O01BMEJBLEVBQUEsT0FBQSxRQUFBO1NBRUEsUUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBO1NBQ0EsS0FBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBO2tCQUNBLEtBQUEsSUFBQSxLQUFBLENBQUEscUJBQUEsRUFBQSxJQUFBOztXQUdBLEtBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBOztNQUdBLElBQUEsSUFBQSxZQUFBO2VBRUEsVUFBQTtRQUNBLEtBQUE7YUFFQSxNQUFBLFVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBO1lBQ0EsSUFBQSxTQUFBLEVBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLElBQUE7QUFDQSxhQUFBLENBQUEsSUFBQTtBQUNBLG9CQUFBLEVBQUEsUUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsSUFBQTtBQUNBLGdCQUFBLFFBQUEsSUFBQSxDQUFBLElBQUE7OztXQUlBLEtBQUE7O2FBR0EsR0FBQTtpQkFDQSxJQUFBO2NBQ0EsYUFBQTtZQUNBLE9BQUEsU0FBQSxHQUFBLENBQUEsaUJBQUE7Y0FFQSxLQUFBO0FBQ0EsbUJBQUE7O2NBR0EsSUFBQSxTQUFBLElBQUE7Y0FDQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBO1lBRUEsR0FBQSxPQUFBLEdBQUE7QUFDQSxpQkFBQTtBQUNBLGdCQUFBO0FBQ0Esa0JBQUEsRUFBQSxRQUFBLENBQUEsSUFBQSxDQUFBLE1BQUE7QUFDQSxnQkFBQTs7QUFHQSxXQUFBLENBQUEsSUFBQTtlQUNBLEdBQUE7O2lCQUdBLGlCQUFBO2NBQ0EsRUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBO1lBQ0EsS0FBQSxTQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLEtBQUE7WUFFQSxLQUFBLENBQUEsTUFBQSxLQUFBLENBQUE7cUJBQ0EsTUFBQSxJQUFBLGVBQUE7QUFDQSxrQkFBQSxDQUFBLFNBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxRQUFBLFFBQUEsSUFBQTtBQUFBLDBCQUFBLENBQUEsSUFBQTs7OztlQUlBLFVBQUE7O1FBU0EsSUFBQTsyQ0FDQSxTQUFBLEVBQUEsSUFBQTs7QUFHQSxhQUFBLENBQUEsSUFBQTtlQUNBLE1BQUEsQ0FBQSxJQUFBLDZCQUFBLFNBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLElBQUE7O0FBR0EsUUFBQTthQUNBLFdBQUE7b0NBRUEsU0FBQSxFQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsS0FBQTt1QkFDQSxZQUFBLE1BQUEsSUFBQSxDQUFBLElBQUE7O2FBR0EsSUFBQSxDQUFBLEVBQUEsRUFBQSxNQUFBO2lCQUNBLFNBQUEsTUFBQSxJQUFBLENBQUEsSUFBQTs7YUFHQSxJQUFBLENBQUEsRUFBQSxFQUNBLE9BQUEsSUFDQSxLQUFBO0FBQ0EsY0FBQSwyRkFBQTtBQUNBLGNBQUEsd0JBQUE7Z0JBQ0EsVUFBQSxHQUFBLEtBQUEsQ0FBQSxPQUFBLElBQUEsS0FBQSxDQUFBLE9BQUE7Z0JBRUEsS0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsVUFBQTtxQkFDQSxTQUFBLE1BQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxxQkFBQSxDQUFBLGNBQUE7OztBQUdBLHdCQUFBLEVBQUEsSUFBQTs7YUFHQSxJQUFBLENBQUEsRUFBQSxFQUFBLEtBQUE7aUJBQ0EsU0FBQSxNQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLEVBQUE7QUFDQSxvQkFBQSxHQUFBLFdBQUE7QUFDQSw0QkFBQSxDQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsV0FBQSxDQUFBLElBQUE7O0FBRUEscUJBQUEsR0FBQSxNQUFBO0FBQ0EsNEJBQUEsQ0FBQSxNQUFBLENBQUEsV0FBQSxDQUFBLE1BQUE7QUFDQSwyQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBOzs7OztVQU1BLFdBQUE7WUFDQSxPQUFBLFNBQUEsR0FBQSxDQUFBLGlCQUFBO2VBQ0EsT0FBQSxDQUFBLENBQUE7O1VBR0EsU0FBQSxDQUFBLE1BQUE7Y0FDQSxFQUFBLENBQUEsU0FBQSxJQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLFFBQUEsUUFBQSxJQUFBO0FBQUEsa0JBQUEsQ0FBQSxJQUFBOztvQ0FFQSxTQUFBLEVBQUEsS0FBQSxDQUFBLE9BQUEsU0FBQSxVQUFBO2FBRUEsV0FBQTs7VUFHQSxZQUFBLENBQUEsTUFBQTtjQUNBLEVBQUEsQ0FBQSxNQUFBLElBQUEsSUFBQSxDQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsUUFBQTtjQUNBLEdBQUEsQ0FBQSxpQkFBQTtvQ0FDQSxTQUFBLEVBQUEsS0FBQSxDQUFBLE9BQUEsU0FBQSxVQUFBO2FBQ0EsVUFBQSxZQUFBLFdBQUE7YUFFQSxXQUFBOztBQUdBLGNBQUEsQ0FBQSxNQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBO2FBQ0EsSUFBQSxDQUFBLElBQUEsS0FBQSxVQUFBLEVBQUEsS0FBQTs7QUFHQSxlQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxFQUFBLE1BQUE7cUJBQ0EsTUFBQSxnQ0FBQSxTQUFBLEVBQUEsS0FBQSxDQUFBLE9BQUE7b0JBQ0EsU0FBQSxPQUFBLGFBQUEsQ0FDQSxFQUFBLEVBQUEseUJBQUEsRUFBQSxNQUFBLENBQUEsUUFBQSxDQUFBLFNBQUEsSUFDQSxFQUFBLEVBQUEsS0FBQTt5QkFDQSxVQUFBLENBQUEsTUFBQTs7b0JBR0EsUUFBQSxPQUFBLGFBQUEsQ0FDQSxFQUFBLEVBQ0EsMEZBQUEsSUFFQSxFQUFBLEVBQUEsS0FBQTt5QkFDQSxZQUFBLENBQUEsTUFBQTs7QUFHQSxzQkFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBO0FBQ0Esc0JBQUEsQ0FBQSxRQUFBLENBQUEsT0FBQTs7Z0JBR0EsT0FBQSxPQUFBLGFBQUEsQ0FBQSxFQUFBLEVBQUEsa0JBQUEsSUFBQSxFQUFBLEVBQ0EsS0FBQTsyQkFFQSxTQUFBLENBQUEsdUJBQUE7O0FBR0Esa0JBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQTs7O2dCQTFHQSxRQUFBO0FBRkEsaUJBQUE7O3dCQUFBLENBQUE7O29DQUdBLFNBQUEsRUFBQSxRQUFBOzs7SUFIQSxTQUFBO1NBaUhBLElBQUEsQ0FBQSxPQUFBO1FBQ0EsUUFBQSxHQUFBLFFBQUEsQ0FBQSxhQUFBLEVBQUEsUUFBQTtBQUNBLFlBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQTtXQUNBLFFBQUEsQ0FBQSxPQUFBOztTQUdBLEVBQUEsQ0FBQSxPQUFBO1FBQ0EsUUFBQSxHQUFBLFFBQUEsQ0FBQSxhQUFBLEVBQUEsUUFBQTtBQUNBLFlBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQTtXQUNBLFFBQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUE7O1NBR0EsS0FBQSxFQUFBLElBQUE7UUFDQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQSxFQUFBLEdBQUEsS0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBO1FBRUEsU0FBQSxHQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLG9EQUFBO1lBQ0EsQ0FBQSxDQUFBLEtBQUE7bUJBQ0EsR0FBQTs7ZUFHQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLENBQUEsS0FBQSxXQUFBLENBQUEsRUFBQSxNQUFBO09BQ0EsUUFBQTtXQUNBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQTtNQUFBLElBQUEsRUFBQSxFQUFBIn0=