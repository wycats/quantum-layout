import { Environment } from "./env.js";
const CATEGORIES = [
    "state:pending",
    "state:active",
    "state:done",
    "state:error",
    "state:reload",
    "state:transition", 
];
const ENV = Environment.default("🧙").icon("page", "📃").icon("state:pending", "⌛").icon("state:update", "👀").icon("state:active", "✅").icon("state:done", "🏁").icon("state:error", "⛔").icon("state:reload", "🔄").icon("state:transition", "⌛").enable("state:error");
async function registerSW() {
    if ("serviceWorker" in navigator) {
        let sw = navigator.serviceWorker;
        try {
            let reg = await sw.register("/sw.js", {
                scope: "/"
            });
            ENV.trace("page", "registration", reg.scope);
            reg = await sw.ready;
            ENV.trace("page", "ready", reg.scope);
            if (sw.controller) {
                var url = sw.controller.scriptURL;
                ENV.trace("state:active", {
                    controller: true,
                    url
                });
                return sw.controller;
            } else {
                ENV.trace("state:active", "reloading", {
                    controller: false
                });
                location.reload();
                // never resolve, waiting for reload to take effect
                return new Promise(()=>{
                });
            }
        } catch (e) {
            ENV.trace(true, "state:error", `SW Registration failed with ${e}`);
            return Promise.reject(e);
        }
    } else {
        return Promise.reject();
    }
}
function waitForController(sw) {
    if (sw.state === "activated" && navigator.serviceWorker.controller === null) {
        location.reload(); // this is really `=> never`
        return Promise.reject();
    } else {
        return sw;
    }
}
function wait(sw) {
    return new Promise((fulfill)=>{
        sw.addEventListener("statechange", (e)=>{
            if (sw.state === "activated") {
                ENV.trace("state:active", "state -> activated");
                fulfill(sw);
            } else {
                ENV.trace("state:transition", "state ->", sw.state);
            }
        });
    });
}
function navigate() {
    location.href = "/index.html";
}
export const SW = registerSW();

