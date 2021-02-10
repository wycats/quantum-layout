// @ts-check
const { config } = require("@swc/core/spack");

const path = require("path");

const OPTIONS = {
  configFile: path.resolve(__dirname, ".swcrc"),
};

const TO_BUNDLE = process.env["TO_BUNDLE"];

const BUNDLES = {
  sw: {
    input: "sw",
  },
  main: {
    input: "main",
  },
  manifest: {
    input: "manifest",
    output: "./script/manifest.js",
  },
};

let bundle = BUNDLES[TO_BUNDLE];

function output(bundle) {
  if (bundle.output) {
    return bundle.output;
  } else {
    return {
      path: path.resolve(__dirname, "public"),
      file: `${BUNDLES[TO_BUNDLE].input}.js`,
    };
  }
}

module.exports = {
  entry: {
    [TO_BUNDLE]: path.resolve(
      __dirname,
      "bootstrap-src",
      `${bundle.input}/index.ts`
    ),
  },
  output: output(bundle),
  module: {},
  options: OPTIONS,
};
