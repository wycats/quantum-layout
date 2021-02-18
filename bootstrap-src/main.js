// @ts-check

// @ts-ignore
import { SW } from "./register-sw.js";

console.log("BYE!!");

async function boot() {
  try {
    await SW;
    const { App } = await import("./bootstrap/app");

    await App.boot();

    document.body.classList.replace("rendered:loading", "rendered:loaded");
  } catch (e) {
    document.body.classList.replace("rendered:loading", "rendered:error");
    console.error(e);
    throw e;
  }
}

boot();

/** @type {Record<string, any>} */
const global = window;

/**
 * @param {any} key
 * @param {string} value
 * @returns {string}
 */
function COMPUTE_STYLE(key, value) {
  let element = document.createElement("div");
  element.style[key] = `calc(${value})`;
  document.body.append(element);
  let computedValue = getComputedStyle(element)[key];
  element.remove();
  return computedValue;
}

global.COMPUTE_STYLE = COMPUTE_STYLE;
