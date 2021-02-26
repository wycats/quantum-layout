import { DirectoryName, FileName, Glob, Manifest } from "./manifest.js";

const ROOT = await FileName.root(
  process.env.WAND_ROOT || process.cwd()
).asDir();
const MANIFEST = await Manifest.root(ROOT);

await MANIFEST.bundle(ROOT.join("bootstrap-src/sw"));
await MANIFEST.bundle(ROOT.join("bootstrap-src/register-sw"));
await MANIFEST.copy(
  await Glob.of(ROOT.join("bootstrap-src"), "bootstrap/**/*.ts"),
  await ROOT.join("public").asDir()
);
await MANIFEST.notice(await Glob.of(ROOT.join("public"), "styles/**/*"));

await MANIFEST.writeManifest(ROOT.join("public/dev.json"));
