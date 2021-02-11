import { SW } from "../bootstrap/register-sw.js";

console.log("BYE!!");

async function boot() {
  try {
    await SW;
    const { App } = await import("../bootstrap/app.js");

    await App.boot();

    document.body.classList.replace("rendered:loading", "rendered:loaded");
  } catch (e) {
    document.body.classList.replace("rendered:loading", "rendered:error");
    console.error(e);
    throw e;
  }
}

boot();

const global: Record<string, any> = window;

function COMPUTE_STYLE(key: any, value: string) {
  let element = document.createElement("div");
  element.style[key] = `calc(${value})`;
  document.body.append(element);
  let computedValue = getComputedStyle(element)[key];
  element.remove();
  return computedValue;
}

global.COMPUTE_STYLE = COMPUTE_STYLE;
