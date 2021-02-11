/// <reference path="./globals.d.ts">

import SimpleFS, {
  Stats,
} from "https://cdn.skypack.dev/@forlagshuset/simple-fs@0.4.1";
import { ElementFacade, FormDesc, FormFacade } from "./dom.js";
import { boot } from "./index.js";
import { Maybe, Result } from "./result.js";
import type * as swc from "@swc/core";
import { bootObservers } from "./resize.js";
import { SugaryExports } from "./wasm.js";

const ELEMENTS = {
  form: {
    itself: new FormFacade<Source>(
      document.querySelector("#transform") as HTMLFormElement
    ),
    name: new ElementFacade(
      document.querySelector("#module-name") as HTMLInputElement
    ),
    source: new ElementFacade(
      document.querySelector("#module-source") as HTMLTextAreaElement
    ),
    delete: new ElementFacade(
      document.querySelector("#delete") as HTMLButtonElement
    ),
  },
  output: new ElementFacade(
    document.querySelector("#output") as HTMLDivElement
  ),
  nav: new ElementFacade(document.querySelector("#module-list") as HTMLElement),
};

const DEFAULT_CODE = strip`
  import { TITLE } from "./constants";
  import type { Box } from "./box";

  function helloWorld(input: Box<string>): string {
    return TITLE + input.content;
  }
`;

const DEFAULT_SOURCES: Source[] = [
  {
    filename: "hello.ts",
    code: DEFAULT_CODE,
  },
];

let id = 0;

function createPlaceholderSource(): Source {
  return {
    filename: `hello-${id++}.ts`,
    code: DEFAULT_CODE,
  };
}

interface Source extends FormDesc {
  filename: string;
  code: string;
}

interface AppDelegate {
  readonly state: {
    sources: readonly Source[];
  };
  readonly form: FormFacade<Source>;
  readonly delete: ElementFacade<HTMLButtonElement>;
  readonly wasm: SugaryExports;
}

type IDBValue =
  | string
  | number
  | boolean
  | null
  | { [P in string]: IDBValue }
  | IDBValue[];

const FS = new SimpleFS();

function relative(root: string, child: string): string {
  if (!child.startsWith(root)) {
    throw new Error(`${child} is not nested under ${root}`);
  }

  return child.slice(root.length + 1);
}

const ROOT = "/app/sources";

async function getSources(): Promise<readonly Source[]> {
  let files: Source[] = [];

  for (let source of await FS.ls(ROOT)) {
    let body = await FS.readFile(source.path);
    files.push({
      filename: relative(ROOT, source.path),
      code: await body.text(),
    });
  }

  return files;
}

export class App {
  static async boot(): Promise<App> {
    await bootObservers();
    let sources = await App.initializeSources();

    const state = {
      sources,
    };

    const wasm = await boot();
    const form = ELEMENTS.form.itself;

    let app = new App({
      state,
      form,
      delete: ELEMENTS.form.delete,
      wasm,
    });

    app.boot();
    return app;
  }

  static async initializeSources(): Promise<readonly Source[]> {
    await FS.mkdirParents(ROOT);
    let files = await FS.ls(ROOT);

    if (files.length === 0) {
      for (let source of DEFAULT_SOURCES) {
        FS.writeFile(`${ROOT}/${source.filename}`, new Blob([source.code]));
      }
    }

    return getSources();
  }

  #delegate: AppDelegate;

  constructor(delegate: AppDelegate) {
    this.#delegate = delegate;
  }

  private get form(): FormFacade<Source> {
    return this.#delegate.form;
  }

  private transform(code: string): Result<swc.Output> {
    return Result.lift(this.#delegate.wasm.transform(code));
  }

  boot() {
    this.populateNav();

    this.#delegate.delete.on("click", async () => {
      await this.deleteSource(this.form.data);
    });

    this.form.on("submit", () => {
      this.addSource(this.form.data);
    });

    this.form.on(
      "keydown",
      (event) => {
        // TODO: A better portable solution (this will cause win-S to trigger save on Windows instead
        // of the Windows search).
        let modifierOn = event.ctrlKey || event.metaKey;

        if (event.key === "s" && modifierOn) {
          this.addSource(this.form.data);
          event.preventDefault();
        }
      },
      { allowDefault: true }
    );

    this.form.on("input", () => {
      this.transform(this.form.data.code).do({
        ifOk: (transformed) => {
          ELEMENTS.output.replaceText(transformed.code);
        },
        ifErr: (reason) => {
          ELEMENTS.output.replaceText(reason);
          console.error(reason);
        },
      });
    });
  }

  async firstSource(): Promise<Source> {
    let sources = await App.initializeSources();
    return sources[0] as Source;
  }

  async addSource(source: Source) {
    await FS.writeFile(`${ROOT}/${source.filename}`, new Blob([source.code]));

    this.#delegate.state.sources = await getSources();

    this.populateNav();
  }

  async deleteSource(source: Source) {
    await FS.unlink(`${ROOT}/${source.filename}`);
    await App.initializeSources();
    this.#delegate.state.sources = await getSources();
    this.pickSource(await this.firstSource());

    this.populateNav();
  }

  pickSource(source: Source) {
    ELEMENTS.form.name.attr("value", source.filename);
    ELEMENTS.form.source.replaceText(source.code);
    this.form.fire(new InputEvent("input"));
  }

  populateNav(): void {
    ELEMENTS.nav.replaceContents((append) => {
      for (let source of this.#delegate.state.sources) {
        let sourceNav = new ElementFacade(
          el(`<button class="filename">${source.filename}</button>`)
        ).on("click", () => {
          this.pickSource(source);
        });

        let trashNav = new ElementFacade(
          el(
            `<button aria-label="Delete Module"><i class="fa fa-trash" aria-hidden="true"></i></button>`
          )
        ).on("click", () => {
          this.deleteSource(source);
        });

        append(sourceNav.element);
        append(trashNav.element);
      }

      let plusNav = new ElementFacade(el(`<button>+</button>`)).on(
        "click",
        async () => {
          await this.addSource(createPlaceholderSource());
        }
      );
      append(plusNav.element);
    });
  }
}

function frag(content: string) {
  let template = document.createElement("template");
  template.innerHTML = content;
  return template.content;
}

function el<E extends Element = HTMLElement>(content: string): E {
  let template = document.createElement("template");
  template.innerHTML = content;
  return template.content.firstElementChild as E;
}

function strip([text]: TemplateStringsArray): string {
  let lines = text.split("\n").slice(1, -1);

  let minIndent = lines.reduce((min, l) => {
    // pure whitespace lines don't affect the calculation.
    if (l.match(/^\s*$/)) {
      return min;
    }

    return Math.min(min, l.match(/^(\s*)/)![1].length);
  }, Infinity);
  return lines.map((l) => l.slice(minIndent)).join("\n");
}
