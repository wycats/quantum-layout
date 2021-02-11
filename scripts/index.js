import { FileName, Manifest } from "./manifest.js";
const ROOT = await FileName.root(process.env.WAND_ROOT || process.cwd()).asDir();
const MANIFEST = await Manifest.root(ROOT);
await MANIFEST.bundle(ROOT.join("bootstrap-src/sw"));
await MANIFEST.bundle(ROOT.join("bootstrap-src/main"));
await MANIFEST.writeManifest(ROOT.join("public/dev.json"));

