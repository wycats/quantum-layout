export default class SimpleFS {
  constructor(options?: { storage: StorageAPI });
  ls(path: string, filters?: LsFilters): readonly FileInfo[];
  mkdir(path: string): Promise<Path>;
  mkdirParents(path: string): Promise<Path>; // wraps mkdir -p
  rmdir(path: string): Promise<void>;
  rmdirRecursive(path: string): Promise<void>; // removes dirs recursively
  readFile(path: string, options = {}): Promise<Blob>; // returns Blob
  writeFile(path: string, data: Blob, options = {}): Promise<Blob>; // data should be Blob type
  outputFile(path: string, data: Blob, options = {}): Promise<Blob>; // Wraps writeFile and recursively creates path if not exists
  bulkOutputFiles(files: OutputFile[]): Promise<void>; // Output files in one transaction, speeds up in chrome
  /**
   *
   * @param path
   * @returns the number of unlinked files
   */
  unlink(path: string): Promise<number>;
  exists(path: string): Promise<FileInfo>;
  stats(path: string): Promise<Stats>;
}

interface LsFilters {}

export interface Modes {
  DIR: "DIR";
  FILE: "FILE";
  SYMBOLIC_LINK: "SYMBOLIC_LINK";
}

export type Mode = keyof Modes;

// Timestamps in simple-fs are the return value of Date.now()
type Timestamp = number;

export class FileInfo {
  readonly path: string;
  readonly mode: Mode;
  readonly size: number;
  // TODO
  readonly flags: {};
  readonly atime: Timestamp;
  readonly ctime: Timestamp;
  readonly mtime: Timestamp;
  // TODO: Is this used? If so, determine unit
  readonly blksize: undefined | number;
  // TODO: Is this used?
  readonly nblocks: number;
  // TODO: What else (inline comments say "you name it")
  readonly data: Blob | ArrayBuffer | string;
}

export class Stats {
  isFile(): boolean;
  isDirectory(): boolean;
  isSymbolicLink(): boolean;

  isSocket(): false;
  isFIFO(): false;
  isCharacterDevice(): false;
  isBlockDevice(): false;
}

export class Path {
  normalize(): Path;
  readonly basename: string | undefined;
  readonly extension: string | undefined;
  readonly parent: Path;
  readonly isRoot: boolean;
}

// TODO: https://github.com/fagbokforlaget/simple-fs/blob/master/src/storages/base.js
interface StorageAPI {}

interface OutputFile {
  path: string;
  blob: Blob;
  options: {};
}
