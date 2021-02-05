// import { parseSync, transformSync, unwrapErr } from "./wasm.js";

import type * as swc from "@swc/core";
import { Result } from "./result.js";
import { boot as bootWASM, PublicExports } from "./wasm.js";

export interface SugaryExports {
  transform: (source: string, opts?: swc.Options) => Result<swc.Output>;
}

export async function boot(): Promise<SugaryExports> {
  let wasm = await bootWASM();
  return { transform: transform(wasm) };
}

/** The defaults correspond to Stage 3 */

const DEFAULT_OPTIONS: swc.Options = {
  isModule: true,
};

const DEFAULT_PARSER_OPTIONS = {
  typescript: {
    syntax: "typescript",
    tsx: false,
    decorators: false,
    dynamicImport: true,
  },
  ecmascript: {
    syntax: "ecmascript",
    jsx: false,
    numericSeparator: true,
    classPrivateProperty: true,
    privateMethod: true,
    classProperty: true,
    functionBind: false,
    decorators: false,
    decoratorsBeforeExport: false,
    dynamicImport: true,
    nullishCoalescing: true,
    exportDefaultFrom: true,
    exportNamespaceFrom: true,
    importMeta: true,
  },
} as const;

const DEFAULT_JSC_OPTIONS: swc.JscConfig = {
  target: "es2020" as swc.JscTarget,
} as const;

// TODO: this is necessary because transformSync otherwise crashes the browser (O_O). Get that
// fixed.
function smokeParse(imports: PublicExports, source: string): Result<{}> {
  try {
    imports.parse(source, {
      syntax: "typescript",
      tsx: true,
      decorators: true,
      dynamicImport: true,
    });

    return Result.ok({});
  } catch (e: unknown) {
    return Result.err(e);
  }
}

const transform = (imports: PublicExports) => (
  source: string,
  options?: swc.Options
): Result<swc.Output> => {
  return smokeParse(imports, source).map(() => {
    let builtParserOptions: swc.TsParserConfig | swc.EsParserConfig;

    let passedParserOptions = options?.jsc?.parser;
    if (passedParserOptions) {
      builtParserOptions = {
        ...DEFAULT_PARSER_OPTIONS[passedParserOptions.syntax],
        ...passedParserOptions,
      };
    } else {
      builtParserOptions = DEFAULT_PARSER_OPTIONS.typescript;
    }

    let builtJscOptions: swc.JscConfig = {
      ...DEFAULT_JSC_OPTIONS,
      ...options?.jsc,
      parser: builtParserOptions,
    };

    let builtOptions: swc.Options = {
      ...DEFAULT_OPTIONS,
      ...options,
      jsc: builtJscOptions,
    } as const;

    return imports.transform(source, builtOptions);
  });
};
