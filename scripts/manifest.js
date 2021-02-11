import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import * as swc from "@swc/core";
import shelljs from "shelljs";
export const FileName = {
    root: (filename)=>{
        if (path.isAbsolute(filename)) {
            return new UnknownFileName(filename);
        } else {
            throw Error(`${filename} was not an absolute path`);
        }
    }
};
export class UnknownFileName {
    get absolute() {
        if (this.relative) {
            return path.resolve(this.root, this.relative);
        } else {
            return this.root;
        }
    }
    async asDir() {
        let stat = await fs.stat(this.absolute);
        if (stat.isDirectory()) {
            return new DirectoryName(this.root, this.relative);
        }
        throw Error(`${this.absolute} was not a directory`);
    }
    async asRegularFile({ allow  } = {
    }) {
        if (this.relative === undefined) {
            throw Error(`${this.absolute} was a root directory, so it cannot be turned into a regular file`);
        }
        let stat = await getStat(this.absolute);
        if (stat === null) {
            if (allow === "missing") {
                return new RegularFileName(new DirectoryName(this.root), this.relative);
            } else {
                throw new Error(`${this.absolute} was not found (pass { allow: "missing" } to asRegularFile to allow missing files)`);
            }
        }
        if (stat.isFile()) {
            return new RegularFileName(new DirectoryName(this.root), this.relative);
        }
        throw Error(`${this.absolute} was not a regular file`);
    }
    join(relative) {
        if (this.relative) {
            return new UnknownFileName(this.root, path.join(this.relative, relative));
        } else {
            return new UnknownFileName(this.root, relative);
        }
    }
    constructor(root, relative1){
        this.root = root;
        this.relative = relative1;
    }
}
async function getStat(filename) {
    try {
        return await fs.stat(filename);
    } catch (e) {
        return null;
    }
}
export class DirectoryName {
    static async of(name) {
        if (name instanceof DirectoryName) {
            return name;
        } else {
            return name.asDir();
        }
    }
    get absolute() {
        if (this.relative) {
            return path.resolve(this.root, this.relative);
        } else {
            return this.root;
        }
    }
    join(relative) {
        if (this.relative) {
            return new UnknownFileName(this.root, path.join(this.relative, relative));
        } else {
            return new UnknownFileName(this.root, relative);
        }
    }
    constructor(root1, relative2){
        this.root = root1;
        this.relative = relative2;
    }
}
export class RegularFileName {
    static async of(name, options) {
        if (name instanceof RegularFileName) {
            return name;
        } else {
            return name.asRegularFile(options);
        }
    }
    get absolute() {
        return path.resolve(this.root.absolute, this.relative);
    }
    async read() {
        return LoadedFile.read(this);
    }
    async text() {
        let file = await this.read();
        return file.text;
    }
    async write(source) {
        await fs.writeFile(this.absolute, source, {
            encoding: "utf-8"
        });
        return new LoadedFile(this, Buffer.from(source));
    }
    constructor(root2, relative3){
        this.root = root2;
        this.relative = relative3;
    }
}
export class LoadedFile {
    /**
   * @param file an absolute file name
   */ static async read(filename) {
        let buffer = await fs.readFile(filename.absolute);
        return new LoadedFile(filename, buffer);
    }
    get text() {
        return this.buffer.toString("utf-8");
    }
    get hash() {
        return crypto.createHash("sha256").update(this.buffer);
    }
    constructor(filename1, buffer){
        this.filename = filename1;
        this.buffer = buffer;
    }
}
export class Manifest {
    static root(dir) {
        return new Manifest(dir);
    }
    static cwd() {
        return new Manifest(new DirectoryName(process.cwd()));
    }
    async add(webPath, file) {
        this.entries[webPath] = {
            filename: file.filename.absolute,
            hash: file.hash.digest("hex")
        };
    }
    async writeManifest(filename) {
        let file = await RegularFileName.of(filename, {
            allow: "missing"
        });
        file.write(JSON.stringify(this.entries, null, 2));
    }
    /**
   * @param from the root of `from` should be the project root (for source maps)
   * @param to the root of `to` should be the web root
   */ async transpile(from, to) {
        let source = await from.read();
        let output = await swc.transform(source.text, {
            filename: from.absolute,
            sourceMaps: "inline",
            sourceRoot: from.root.absolute,
            jsc: {
                target: "es2020",
                parser: {
                    syntax: "typescript",
                    dynamicImport: true
                }
            }
        });
        let file = await to.write(output.code);
        this.add(to.relative, file);
    }
    async bundle(from) {
        let source = await DirectoryName.of(from);
        let configFile = await source.join("spack.json").asRegularFile();
        let config = JSON.parse(await configFile.text());
        shelljs.exec(`spack --config ${source.join("spack.config.cjs").absolute}`, {
            async: false,
            silent: true
        });
        let target = await this.root.join("public").join(config.public).asRegularFile();
        this.add(config.public, await target.read());
    }
    constructor(root3){
        this.root = root3;
        this.entries = {
        };
    }
}

