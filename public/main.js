// @ts-check

import { App } from "./bootstrap/app.js";

async function boot() {
  try {
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
 *
 * @param {any} key
 * @param {string} value
 */
function COMPUTE_STYLE(key, value) {
  let element = document.createElement("div");
  element.style[key] = `calc(${value})`;
  document.body.append(element);
  let computedValue = getComputedStyle(element)[key];
  element.remove();
  return computedValue;
}
