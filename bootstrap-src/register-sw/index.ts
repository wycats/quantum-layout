import { Environment } from "../bootstrap/env.js";

const CATEGORIES = [
  "state:pending",
  "state:active",
  "state:done",
  "state:error",
  "state:reload",
  "state:transition",
];
type Category = typeof CATEGORIES[number];

const ENV = Environment.default<Category>("🧙")
  .icon("page", "📃")
  .icon("state:pending", "⌛")
  .icon("state:update", "👀")
  .icon("state:active", "✅")
  .icon("state:done", "🏁")
  .icon("state:error", "⛔")
  .icon("state:reload", "🔄")
  .icon("state:transition", "⌛")
  .enable("state:transition");

async function registerSW(): Promise<ServiceWorker> {
  if ("serviceWorker" in navigator) {
    let sw = navigator.serviceWorker;

    try {
      let reg = await sw.register("/sw.js", {
        scope: "/",
      });

      ENV.trace("page", "registration", reg.scope);

      reg = await sw.ready;

      ENV.trace("page", "ready", reg.scope);

      if (sw.controller) {
        var url = sw.controller.scriptURL;
        ENV.trace("state:active", { controller: true, url });
        return sw.controller;
      } else {
        ENV.trace("state:active", "reloading", { controller: false });
        location.reload();

        // never resolve, waiting for reload to take effect
        return new Promise(() => {});
        // ENV.trace("state:active", "awaiting controller");

        // return new Promise(async (fulfill) => {
        //   sw.addEventListener("controllerchange", (e) => {
        //     let controller = e.target as ServiceWorker;
        //     ENV.trace(
        //       "state:transition",
        //       "controllerchange",
        //       controller.scriptURL
        //     );
        //     fulfill(controller);
        //   });
        // });
      }
    } catch (e) {
      ENV.trace(true, "state:error", `SW Registration failed with ${e}`);
      return Promise.reject(e);
    }

    // if (reg.waiting) {
    //   ENV.trace(true, "state:pending", "waiting", { waiting: reg.waiting });

    //   await wait(reg.waiting);
    // }

    // if (reg.installing) {
    //   ENV.trace(true, "state:pending", "installing", {
    //     installing: reg.installing,
    //   });

    //   await wait(reg.installing);
    // }

    // if (reg.active) {
    //   let activeIsController =
    //     reg.active === navigator.serviceWorker.controller;

    //   ENV.trace(true, "state:active", `active`, {
    //     active: reg.active,
    //     controller: navigator.serviceWorker.controller,
    //     isController: activeIsController,
    //   });

    //   ENV.trace(true, "state:finished", "service worker finished resolving");
    //   return waitForController(reg.active);
    // } else {
    //   throw new Error(
    //     `there is unexpectedly no active SW, even though installation has finished`
    //   );
    // }
  } else {
    return Promise.reject();
  }
}

function waitForController(sw: ServiceWorker) {
  if (sw.state === "activated" && navigator.serviceWorker.controller === null) {
    location.reload(); // this is really `=> never`
    return Promise.reject();
  } else {
    return sw;
  }
}

function wait(sw: ServiceWorker): Promise<ServiceWorker> {
  return new Promise((fulfill) => {
    sw.addEventListener("statechange", (e) => {
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
