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
        return _classPrivateFieldGet(this, _delegate).wasm.transform(code);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC9hcHAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZ2xvYmFscy5kLnRzXCI-XG5cbmltcG9ydCBTaW1wbGVGUywge1xuICBTdGF0cyxcbn0gZnJvbSBcImh0dHBzOi8vY2RuLnNreXBhY2suZGV2L0Bmb3JsYWdzaHVzZXQvc2ltcGxlLWZzQDAuNC4xXCI7XG5pbXBvcnQgeyBFbGVtZW50RmFjYWRlLCBGb3JtRGVzYywgRm9ybUZhY2FkZSB9IGZyb20gXCIuL2RvbS5qc1wiO1xuaW1wb3J0IHsgYm9vdCwgU3VnYXJ5RXhwb3J0cyB9IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBNYXliZSwgUmVzdWx0IH0gZnJvbSBcIi4vcmVzdWx0LmpzXCI7XG5pbXBvcnQgdHlwZSAqIGFzIHN3YyBmcm9tIFwiQHN3Yy9jb3JlXCI7XG5pbXBvcnQgeyBib290T2JzZXJ2ZXJzIH0gZnJvbSBcIi4vcmVzaXplLmpzXCI7XG5cbmNvbnN0IEVMRU1FTlRTID0ge1xuICBmb3JtOiB7XG4gICAgaXRzZWxmOiBuZXcgRm9ybUZhY2FkZTxTb3VyY2U-KFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0cmFuc2Zvcm1cIikgYXMgSFRNTEZvcm1FbGVtZW50XG4gICAgKSxcbiAgICBuYW1lOiBuZXcgRWxlbWVudEZhY2FkZShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbW9kdWxlLW5hbWVcIikgYXMgSFRNTElucHV0RWxlbWVudFxuICAgICksXG4gICAgc291cmNlOiBuZXcgRWxlbWVudEZhY2FkZShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbW9kdWxlLXNvdXJjZVwiKSBhcyBIVE1MVGV4dEFyZWFFbGVtZW50XG4gICAgKSxcbiAgICBkZWxldGU6IG5ldyBFbGVtZW50RmFjYWRlKFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZWxldGVcIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnRcbiAgICApLFxuICB9LFxuICBvdXRwdXQ6IG5ldyBFbGVtZW50RmFjYWRlKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjb3V0cHV0XCIpIGFzIEhUTUxEaXZFbGVtZW50XG4gICksXG4gIG5hdjogbmV3IEVsZW1lbnRGYWNhZGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtb2R1bGUtbGlzdFwiKSBhcyBIVE1MRWxlbWVudCksXG59O1xuXG5jb25zdCBERUZBVUxUX0NPREUgPSBzdHJpcGBcbiAgaW1wb3J0IHsgVElUTEUgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbiAgaW1wb3J0IHR5cGUgeyBCb3ggfSBmcm9tIFwiLi9ib3hcIjtcblxuICBmdW5jdGlvbiBoZWxsb1dvcmxkKGlucHV0OiBCb3g8c3RyaW5nPik6IHN0cmluZyB7XG4gICAgcmV0dXJuIFRJVExFICsgaW5wdXQuY29udGVudDtcbiAgfVxuYDtcblxuY29uc3QgREVGQVVMVF9TT1VSQ0VTOiBTb3VyY2VbXSA9IFtcbiAge1xuICAgIGZpbGVuYW1lOiBcImhlbGxvLnRzXCIsXG4gICAgY29kZTogREVGQVVMVF9DT0RFLFxuICB9LFxuXTtcblxubGV0IGlkID0gMDtcblxuZnVuY3Rpb24gY3JlYXRlUGxhY2Vob2xkZXJTb3VyY2UoKTogU291cmNlIHtcbiAgcmV0dXJuIHtcbiAgICBmaWxlbmFtZTogYGhlbGxvLSR7aWQrK30udHNgLFxuICAgIGNvZGU6IERFRkFVTFRfQ09ERSxcbiAgfTtcbn1cblxuaW50ZXJmYWNlIFNvdXJjZSBleHRlbmRzIEZvcm1EZXNjIHtcbiAgZmlsZW5hbWU6IHN0cmluZztcbiAgY29kZTogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgQXBwRGVsZWdhdGUge1xuICByZWFkb25seSBzdGF0ZToge1xuICAgIHNvdXJjZXM6IHJlYWRvbmx5IFNvdXJjZVtdO1xuICB9O1xuICByZWFkb25seSBmb3JtOiBGb3JtRmFjYWRlPFNvdXJjZT47XG4gIHJlYWRvbmx5IGRlbGV0ZTogRWxlbWVudEZhY2FkZTxIVE1MQnV0dG9uRWxlbWVudD47XG4gIHJlYWRvbmx5IHdhc206IFN1Z2FyeUV4cG9ydHM7XG59XG5cbnR5cGUgSURCVmFsdWUgPVxuICB8IHN0cmluZ1xuICB8IG51bWJlclxuICB8IGJvb2xlYW5cbiAgfCBudWxsXG4gIHwgeyBbUCBpbiBzdHJpbmddOiBJREJWYWx1ZSB9XG4gIHwgSURCVmFsdWVbXTtcblxuY29uc3QgRlMgPSBuZXcgU2ltcGxlRlMoKTtcblxuZnVuY3Rpb24gcmVsYXRpdmUocm9vdDogc3RyaW5nLCBjaGlsZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCFjaGlsZC5zdGFydHNXaXRoKHJvb3QpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2NoaWxkfSBpcyBub3QgbmVzdGVkIHVuZGVyICR7cm9vdH1gKTtcbiAgfVxuXG4gIHJldHVybiBjaGlsZC5zbGljZShyb290Lmxlbmd0aCArIDEpO1xufVxuXG5jb25zdCBST09UID0gXCIvYXBwL3NvdXJjZXNcIjtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U291cmNlcygpOiBQcm9taXNlPHJlYWRvbmx5IFNvdXJjZVtdPiB7XG4gIGxldCBmaWxlczogU291cmNlW10gPSBbXTtcblxuICBmb3IgKGxldCBzb3VyY2Ugb2YgYXdhaXQgRlMubHMoUk9PVCkpIHtcbiAgICBsZXQgYm9keSA9IGF3YWl0IEZTLnJlYWRGaWxlKHNvdXJjZS5wYXRoKTtcbiAgICBmaWxlcy5wdXNoKHtcbiAgICAgIGZpbGVuYW1lOiByZWxhdGl2ZShST09ULCBzb3VyY2UucGF0aCksXG4gICAgICBjb2RlOiBhd2FpdCBib2R5LnRleHQoKSxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBmaWxlcztcbn1cblxuZXhwb3J0IGNsYXNzIEFwcCB7XG4gIHN0YXRpYyBhc3luYyBib290KCk6IFByb21pc2U8QXBwPiB7XG4gICAgYXdhaXQgYm9vdE9ic2VydmVycygpO1xuICAgIGxldCBzb3VyY2VzID0gYXdhaXQgQXBwLmluaXRpYWxpemVTb3VyY2VzKCk7XG5cbiAgICBjb25zdCBzdGF0ZSA9IHtcbiAgICAgIHNvdXJjZXMsXG4gICAgfTtcblxuICAgIGNvbnN0IHdhc20gPSBhd2FpdCBib290KCk7XG4gICAgY29uc3QgZm9ybSA9IEVMRU1FTlRTLmZvcm0uaXRzZWxmO1xuXG4gICAgbGV0IGFwcCA9IG5ldyBBcHAoe1xuICAgICAgc3RhdGUsXG4gICAgICBmb3JtLFxuICAgICAgZGVsZXRlOiBFTEVNRU5UUy5mb3JtLmRlbGV0ZSxcbiAgICAgIHdhc20sXG4gICAgfSk7XG5cbiAgICBhcHAuYm9vdCgpO1xuICAgIHJldHVybiBhcHA7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgaW5pdGlhbGl6ZVNvdXJjZXMoKTogUHJvbWlzZTxyZWFkb25seSBTb3VyY2VbXT4ge1xuICAgIGF3YWl0IEZTLm1rZGlyUGFyZW50cyhST09UKTtcbiAgICBsZXQgZmlsZXMgPSBhd2FpdCBGUy5scyhST09UKTtcbiAgICBjb25zb2xlLmxvZyhST09ULCBmaWxlcyk7XG5cbiAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBmb3IgKGxldCBzb3VyY2Ugb2YgREVGQVVMVF9TT1VSQ0VTKSB7XG4gICAgICAgIEZTLndyaXRlRmlsZShgJHtST09UfS8ke3NvdXJjZS5maWxlbmFtZX1gLCBuZXcgQmxvYihbc291cmNlLmNvZGVdKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldFNvdXJjZXMoKTtcbiAgfVxuXG4gICNkZWxlZ2F0ZTogQXBwRGVsZWdhdGU7XG5cbiAgY29uc3RydWN0b3IoZGVsZWdhdGU6IEFwcERlbGVnYXRlKSB7XG4gICAgdGhpcy4jZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGZvcm0oKTogRm9ybUZhY2FkZTxTb3VyY2U-IHtcbiAgICByZXR1cm4gdGhpcy4jZGVsZWdhdGUuZm9ybTtcbiAgfVxuXG4gIHByaXZhdGUgdHJhbnNmb3JtKGNvZGU6IHN0cmluZyk6IFJlc3VsdDxzd2MuT3V0cHV0PiB7XG4gICAgcmV0dXJuIHRoaXMuI2RlbGVnYXRlLndhc20udHJhbnNmb3JtKGNvZGUpO1xuICB9XG5cbiAgYm9vdCgpIHtcbiAgICB0aGlzLnBvcHVsYXRlTmF2KCk7XG5cbiAgICB0aGlzLiNkZWxlZ2F0ZS5kZWxldGUub24oXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCB0aGlzLmRlbGV0ZVNvdXJjZSh0aGlzLmZvcm0uZGF0YSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmZvcm0ub24oXCJzdWJtaXRcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5hZGRTb3VyY2UodGhpcy5mb3JtLmRhdGEpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5mb3JtLm9uKFxuICAgICAgXCJrZXlkb3duXCIsXG4gICAgICAoZXZlbnQpID0-IHtcbiAgICAgICAgLy8gVE9ETzogQSBiZXR0ZXIgcG9ydGFibGUgc29sdXRpb24gKHRoaXMgd2lsbCBjYXVzZSB3aW4tUyB0byB0cmlnZ2VyIHNhdmUgb24gV2luZG93cyBpbnN0ZWFkXG4gICAgICAgIC8vIG9mIHRoZSBXaW5kb3dzIHNlYXJjaCkuXG4gICAgICAgIGxldCBtb2RpZmllck9uID0gZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5O1xuXG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IFwic1wiICYmIG1vZGlmaWVyT24pIHtcbiAgICAgICAgICB0aGlzLmFkZFNvdXJjZSh0aGlzLmZvcm0uZGF0YSk7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHsgYWxsb3dEZWZhdWx0OiB0cnVlIH1cbiAgICApO1xuXG4gICAgdGhpcy5mb3JtLm9uKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgdGhpcy50cmFuc2Zvcm0odGhpcy5mb3JtLmRhdGEuY29kZSkuZG8oe1xuICAgICAgICBpZk9rOiAodHJhbnNmb3JtZWQpID0-IHtcbiAgICAgICAgICBFTEVNRU5UUy5vdXRwdXQucmVwbGFjZVRleHQodHJhbnNmb3JtZWQuY29kZSk7XG4gICAgICAgIH0sXG4gICAgICAgIGlmRXJyOiAocmVhc29uKSA9PiB7XG4gICAgICAgICAgRUxFTUVOVFMub3V0cHV0LnJlcGxhY2VUZXh0KHJlYXNvbik7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBmaXJzdFNvdXJjZSgpOiBQcm9taXNlPFNvdXJjZT4ge1xuICAgIGxldCBzb3VyY2VzID0gYXdhaXQgQXBwLmluaXRpYWxpemVTb3VyY2VzKCk7XG4gICAgcmV0dXJuIHNvdXJjZXNbMF0gYXMgU291cmNlO1xuICB9XG5cbiAgYXN5bmMgYWRkU291cmNlKHNvdXJjZTogU291cmNlKSB7XG4gICAgYXdhaXQgRlMud3JpdGVGaWxlKGAke1JPT1R9LyR7c291cmNlLmZpbGVuYW1lfWAsIG5ldyBCbG9iKFtzb3VyY2UuY29kZV0pKTtcblxuICAgIHRoaXMuI2RlbGVnYXRlLnN0YXRlLnNvdXJjZXMgPSBhd2FpdCBnZXRTb3VyY2VzKCk7XG5cbiAgICB0aGlzLnBvcHVsYXRlTmF2KCk7XG4gIH1cblxuICBhc3luYyBkZWxldGVTb3VyY2Uoc291cmNlOiBTb3VyY2UpIHtcbiAgICBhd2FpdCBGUy51bmxpbmsoYCR7Uk9PVH0vJHtzb3VyY2UuZmlsZW5hbWV9YCk7XG4gICAgYXdhaXQgQXBwLmluaXRpYWxpemVTb3VyY2VzKCk7XG4gICAgdGhpcy4jZGVsZWdhdGUuc3RhdGUuc291cmNlcyA9IGF3YWl0IGdldFNvdXJjZXMoKTtcbiAgICB0aGlzLnBpY2tTb3VyY2UoYXdhaXQgdGhpcy5maXJzdFNvdXJjZSgpKTtcblxuICAgIHRoaXMucG9wdWxhdGVOYXYoKTtcbiAgfVxuXG4gIHBpY2tTb3VyY2Uoc291cmNlOiBTb3VyY2UpIHtcbiAgICBFTEVNRU5UUy5mb3JtLm5hbWUuYXR0cihcInZhbHVlXCIsIHNvdXJjZS5maWxlbmFtZSk7XG4gICAgRUxFTUVOVFMuZm9ybS5zb3VyY2UucmVwbGFjZVRleHQoc291cmNlLmNvZGUpO1xuICAgIHRoaXMuZm9ybS5maXJlKG5ldyBJbnB1dEV2ZW50KFwiaW5wdXRcIikpO1xuICB9XG5cbiAgcG9wdWxhdGVOYXYoKTogdm9pZCB7XG4gICAgRUxFTUVOVFMubmF2LnJlcGxhY2VDb250ZW50cygoYXBwZW5kKSA9PiB7XG4gICAgICBmb3IgKGxldCBzb3VyY2Ugb2YgdGhpcy4jZGVsZWdhdGUuc3RhdGUuc291cmNlcykge1xuICAgICAgICBsZXQgc291cmNlTmF2ID0gbmV3IEVsZW1lbnRGYWNhZGUoXG4gICAgICAgICAgZWwoYDxidXR0b24gY2xhc3M9XCJmaWxlbmFtZVwiPiR7c291cmNlLmZpbGVuYW1lfTwvYnV0dG9uPmApXG4gICAgICAgICkub24oXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5waWNrU291cmNlKHNvdXJjZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCB0cmFzaE5hdiA9IG5ldyBFbGVtZW50RmFjYWRlKFxuICAgICAgICAgIGVsKFxuICAgICAgICAgICAgYDxidXR0b24gYXJpYS1sYWJlbD1cIkRlbGV0ZSBNb2R1bGVcIj48aSBjbGFzcz1cImZhIGZhLXRyYXNoXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI-PC9pPjwvYnV0dG9uPmBcbiAgICAgICAgICApXG4gICAgICAgICkub24oXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kZWxldGVTb3VyY2Uoc291cmNlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwZW5kKHNvdXJjZU5hdi5lbGVtZW50KTtcbiAgICAgICAgYXBwZW5kKHRyYXNoTmF2LmVsZW1lbnQpO1xuICAgICAgfVxuXG4gICAgICBsZXQgcGx1c05hdiA9IG5ldyBFbGVtZW50RmFjYWRlKGVsKGA8YnV0dG9uPis8L2J1dHRvbj5gKSkub24oXG4gICAgICAgIFwiY2xpY2tcIixcbiAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGF3YWl0IHRoaXMuYWRkU291cmNlKGNyZWF0ZVBsYWNlaG9sZGVyU291cmNlKCkpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgICAgYXBwZW5kKHBsdXNOYXYuZWxlbWVudCk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZnJhZyhjb250ZW50OiBzdHJpbmcpIHtcbiAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRlbXBsYXRlXCIpO1xuICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBjb250ZW50O1xuICByZXR1cm4gdGVtcGxhdGUuY29udGVudDtcbn1cblxuZnVuY3Rpb24gZWw8RSBleHRlbmRzIEVsZW1lbnQgPSBIVE1MRWxlbWVudD4oY29udGVudDogc3RyaW5nKTogRSB7XG4gIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZW1wbGF0ZVwiKTtcbiAgdGVtcGxhdGUuaW5uZXJIVE1MID0gY29udGVudDtcbiAgcmV0dXJuIHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQgYXMgRTtcbn1cblxuZnVuY3Rpb24gc3RyaXAoW3RleHRdOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSk6IHN0cmluZyB7XG4gIGxldCBsaW5lcyA9IHRleHQuc3BsaXQoXCJcXG5cIikuc2xpY2UoMSwgLTEpO1xuXG4gIGxldCBtaW5JbmRlbnQgPSBsaW5lcy5yZWR1Y2UoKG1pbiwgbCkgPT4ge1xuICAgIC8vIHB1cmUgd2hpdGVzcGFjZSBsaW5lcyBkb24ndCBhZmZlY3QgdGhlIGNhbGN1bGF0aW9uLlxuICAgIGlmIChsLm1hdGNoKC9eXFxzKiQvKSkge1xuICAgICAgcmV0dXJuIG1pbjtcbiAgICB9XG5cbiAgICByZXR1cm4gTWF0aC5taW4obWluLCBsLm1hdGNoKC9eKFxccyopLykhWzFdLmxlbmd0aCk7XG4gIH0sIEluZmluaXR5KTtcbiAgcmV0dXJuIGxpbmVzLm1hcCgobCkgPT4gbC5zbGljZShtaW5JbmRlbnQpKS5qb2luKFwiXFxuXCIpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsRUFBQSxtQ0FBQTtPQUVBLFFBQUEsT0FFQSxxREFBQTtTQUNBLGFBQUEsRUFBQSxVQUFBLFNBQUEsUUFBQTtTQUNBLElBQUEsU0FBQSxVQUFBO1NBR0EsYUFBQSxTQUFBLFdBQUE7TUFFQSxRQUFBO0FBQ0EsUUFBQTtBQUNBLGNBQUEsTUFBQSxVQUFBLENBQ0EsUUFBQSxDQUFBLGFBQUEsRUFBQSxVQUFBO0FBRUEsWUFBQSxNQUFBLGFBQUEsQ0FDQSxRQUFBLENBQUEsYUFBQSxFQUFBLFlBQUE7QUFFQSxjQUFBLE1BQUEsYUFBQSxDQUNBLFFBQUEsQ0FBQSxhQUFBLEVBQUEsY0FBQTtBQUVBLGNBQUEsTUFBQSxhQUFBLENBQ0EsUUFBQSxDQUFBLGFBQUEsRUFBQSxPQUFBOztBQUdBLFVBQUEsTUFBQSxhQUFBLENBQ0EsUUFBQSxDQUFBLGFBQUEsRUFBQSxPQUFBO0FBRUEsT0FBQSxNQUFBLGFBQUEsQ0FBQSxRQUFBLENBQUEsYUFBQSxFQUFBLFlBQUE7O01BR0EsWUFBQSxHQUFBLEtBQUEsQ0FBQSw4S0FPQTtNQUVBLGVBQUE7O0FBRUEsZ0JBQUEsR0FBQSxRQUFBO0FBQ0EsWUFBQSxFQUFBLFlBQUE7OztJQUlBLEVBQUEsR0FBQSxDQUFBO1NB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LHNCQUFBLENBQUEsUUFBQSxDQUFBLE9BQUE7O2dCQUdBLE9BQUEsT0FBQSxhQUFBLENBQUEsRUFBQSxFQUFBLGtCQUFBLElBQUEsRUFBQSxFQUNBLEtBQUE7MkJBRUEsU0FBQSxDQUFBLHVCQUFBOztBQUdBLGtCQUFBLENBQUEsT0FBQSxDQUFBLE9BQUE7OztnQkExR0EsUUFBQTtBQUZBLGlCQUFBOzt3QkFBQSxDQUFBOztvQ0FHQSxTQUFBLEVBQUEsUUFBQTs7O0lBSEEsU0FBQTtTQWlIQSxJQUFBLENBQUEsT0FBQTtRQUNBLFFBQUEsR0FBQSxRQUFBLENBQUEsYUFBQSxFQUFBLFFBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxHQUFBLE9BQUE7V0FDQSxRQUFBLENBQUEsT0FBQTs7U0FHQSxFQUFBLENBQUEsT0FBQTtRQUNBLFFBQUEsR0FBQSxRQUFBLENBQUEsYUFBQSxFQUFBLFFBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxHQUFBLE9BQUE7V0FDQSxRQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBOztTQUdBLEtBQUEsRUFBQSxJQUFBO1FBQ0EsS0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQTtRQUVBLFNBQUEsR0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxvREFBQTtZQUNBLENBQUEsQ0FBQSxLQUFBO21CQUNBLEdBQUE7O2VBR0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsV0FBQSxDQUFBLEVBQUEsTUFBQTtPQUNBLFFBQUE7V0FDQSxLQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFNBQUE7TUFBQSxJQUFBLEVBQUEsRUFBQSJ9