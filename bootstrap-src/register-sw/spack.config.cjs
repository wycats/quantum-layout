const path = require("path");
const config = require("./spack.json");

require("@swc/core");

const ROOT = path.resolve(__dirname, "..", "..");

const OPTIONS = {
  configFile: path.resolve(ROOT, ".swcrc"),
};

module.exports = {
  entry: {
    bootstrap: path.resolve(__dirname, config.entry),
  },
  output: {
    path: path.resolve(ROOT, "public"),
    name: config.public,
  },

  options: OPTIONS,
};
