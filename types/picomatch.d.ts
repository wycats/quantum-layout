declare module "picomatch" {
  export interface Parsed {}

  export function parse(pattern: string, options?: object): Parsed;
  export function compileRe(parsed: Parsed, options?: object): RegExp;
}
