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
const ENV = Environment.default("\u{1f9d9}").enable("*").icon("page", "\u{1f4c3}").icon("state:pending", "\u231b").icon("state:update", "\u{1f440}").icon("state:active", "\u2705").icon("state:done", "\u{1f3c1}").icon("state:error", "\u26d4").icon("state:reload", "\u{1f504}").icon("state:transition", "\u231b");
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
                // console.log('serviceWorker.controller', url);
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
    } else return Promise.reject();
}
const SW = registerSW();
async function boot() {
    try {
        await SW;
        const { App  } = await import("../bootstrap/app.js");
        await App.boot();
        // const { hello } = await import("./app/hello");
        // console.log(hello());
        document.body.classList.replace("rendered:loading", "rendered:loaded");
    } catch (e) {
        document.body.classList.replace("rendered:loading", "rendered:error");
        console.error(e);
        throw e;
    }
}
boot();
const global = window;
function COMPUTE_STYLE(key, value) {
    let element = document.createElement("div");
    element.style[key] = `calc(${value})`;
    document.body.append(element);
    let computedValue = getComputedStyle(element)[key];
    element.remove();
    return computedValue;
}
global.COMPUTE_STYLE = COMPUTE_STYLE;
