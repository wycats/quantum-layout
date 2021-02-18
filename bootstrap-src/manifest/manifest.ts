import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import * as swc from "@swc/core";
import shelljs from "shelljs";
import globby from "globby";

export interface ManifestEntry {
  filename: string;
  hash: string;
}

export interface FileName {
  readonly absolute: string;
}

export const FileName = {
  root: (filename: string): UnknownFileName => {
    if (path.isAbsolute(filename)) {
      return new UnknownFileName(filename);
    } else {
      throw Error(`${filename} was not an absolute path`);
    }
  },
};

export type IntoDirectoryName = UnknownFileName | DirectoryName;
export type IntoRegularFileName = UnknownFileName | RegularFileName;

export class UnknownFileName implements FileName {
  constructor(readonly root: string, readonly relative?: string) {}

  get absolute(): string {
    if (this.relative) {
      return path.resolve(this.root, this.relative);
    } else {
      return this.root;
    }
  }

  async asDir(): Promise<DirectoryName> {
    let stat = await fs.stat(this.absolute);
    if (stat.isDirectory()) {
      return new DirectoryName(this.root, this.relative);
    }

    throw Error(`${this.absolute} was not a directory`);
  }

  async asRegularFile({
    allow,
  }: { allow?: "missing" } = {}): Promise<RegularFileName> {
    if (this.relative === undefined) {
      throw Error(
        `${this.absolute} was a root directory, so it cannot be turned into a regular file`
      );
    }

    let stat = await getStat(this.absolute);

    if (stat === null) {
      if (allow === "missing") {
        return new RegularFileName(new DirectoryName(this.root), this.relative);
      } else {
        throw new Error(
          `${this.absolute} was not found (pass { allow: "missing" } to asRegularFile to allow missing files)`
        );
      }
    }

    if (stat.isFile()) {
      return new RegularFileName(new DirectoryName(this.root), this.relative);
    }

    throw Error(`${this.absolute} was not a regular file`);
  }

  join(relative: string): UnknownFileName {
    if (this.relative) {
      return new UnknownFileName(this.root, path.join(this.relative, relative));
    } else {
      return new UnknownFileName(this.root, relative);
    }
  }
}

async function getStat(filename: string): Promise<import("fs").Stats | null> {
  try {
    return await fs.stat(filename);
  } catch (e) {
    return null;
  }
}

export class Glob {
  static async of(root: IntoDirectoryName, glob: string): Promise<Glob> {
    return new Glob(await DirectoryName.of(root), glob);
  }

  static async search(
    root: IntoDirectoryName,
    glob: string
  ): Promise<readonly RegularFileName[]> {
    let g = await Glob.of(root, glob);
    return g.files();
  }

  constructor(
    private readonly root: DirectoryName,
    private readonly glob: string
  ) {}

  async files(): Promise<readonly RegularFileName[]> {
    let files = await globby(this.glob, {
      cwd: this.root.absolute,
    });

    return files.map((f) => new RegularFileName(this.root, f));
  }
}

export class DirectoryName implements FileName {
  static async of(name: IntoDirectoryName): Promise<DirectoryName> {
    if (name instanceof DirectoryName) {
      return name;
    } else {
      return name.asDir();
    }
  }

  constructor(
    private readonly root: string,
    private readonly relative?: string
  ) {}

  get absolute(): string {
    if (this.relative) {
      return path.resolve(this.root, this.relative);
    } else {
      return this.root;
    }
  }

  join(relative: string): UnknownFileName {
    if (this.relative) {
      return new UnknownFileName(this.root, path.join(this.relative, relative));
    } else {
      return new UnknownFileName(this.root, relative);
    }
  }
}

export class RegularFileName implements FileName {
  static async of(
    name: IntoRegularFileName,
    options?: { allow: "missing" }
  ): Promise<RegularFileName> {
    if (name instanceof RegularFileName) {
      return name;
    } else {
      return name.asRegularFile(options);
    }
  }

  constructor(readonly root: DirectoryName, readonly relative: string) {}

  get absolute(): string {
    return path.resolve(this.root.absolute, this.relative);
  }

  async read(): Promise<LoadedFile> {
    return LoadedFile.read(this);
  }

  async text(): Promise<string> {
    let file = await this.read();
    return file.text;
  }

  async write(source: string | Uint8Array): Promise<LoadedFile> {
    let dir = path.dirname(this.absolute);
    shelljs.mkdir("-p", dir);

    await fs.writeFile(this.absolute, source, {
      encoding: "utf-8",
    });

    return new LoadedFile(this, Buffer.from(source));
  }
}

export class LoadedFile {
  /**
   * @param file an absolute file name
   */
  static async read(filename: RegularFileName): Promise<LoadedFile> {
    let buffer = await fs.readFile(filename.absolute);
    return new LoadedFile(filename, buffer);
  }

  constructor(readonly filename: RegularFileName, readonly buffer: Buffer) {}

  get text(): string {
    return this.buffer.toString("utf-8");
  }

  get hash(): crypto.Hash {
    return crypto.createHash("sha256").update(this.buffer);
  }
}

export type ManifestEntries = {
  [P in string]: ManifestEntry;
};

export class Manifest {
  static root(dir: DirectoryName): Manifest {
    return new Manifest(dir);
  }

  static cwd(): Manifest {
    return new Manifest(new DirectoryName(process.cwd()));
  }

  readonly entries: ManifestEntries = {};

  constructor(readonly root: DirectoryName) {}

  async add(webPath: string, file: LoadedFile): Promise<void> {
    this.entries[webPath] = {
      filename: file.filename.absolute,
      hash: file.hash.digest("hex"),
    };
  }

  async writeManifest(filename: IntoRegularFileName): Promise<void> {
    let file = await RegularFileName.of(filename, { allow: "missing" });
    file.write(JSON.stringify(this.entries, null, 2));
  }

  /**
   * @param from the root of `from` should be the project root (for source maps)
   * @param to the root of `to` should be the web root
   */
  async transpile(from: RegularFileName, to: RegularFileName) {
    let source = await from.read();
    let output = await swc.transform(source.text, {
      filename: from.absolute,
      sourceMaps: "inline",
      sourceRoot: from.root.absolute,
      jsc: {
        target: "es2020" as "es2019",
        parser: {
          syntax: "typescript",
          dynamicImport: true,
        },
      },
    });

    let file = await to.write(output.code);
    await this.add(to.relative, file);
  }

  async copy(from: Glob, to: DirectoryName) {
    for (let file of await from.files()) {
      let source = await file.read();
      let target = await to
        .join(file.relative)
        .asRegularFile({ allow: "missing" });

      await target.write(source.buffer);

      await this.add(file.relative, source);
    }
  }

  async bundle(from: IntoDirectoryName) {
    let source = await DirectoryName.of(from);

    let configFile = await source.join("spack.json").asRegularFile();
    let config = JSON.parse(await configFile.text()) as {
      entry: string;
      public: string;
    };

    shelljs.exec(`spack --config ${source.join("spack.config.cjs").absolute}`, {
      async: false,
      silent: true,
    });
    let target = await this.root
      .join("public")
      .join(config.public)
      .asRegularFile();

    await this.add(config.public, await target.read());
  }
}
