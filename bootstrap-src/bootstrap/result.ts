import { compileBundleOptions } from "@swc/core/spack";

type IntoResult<T extends object> = T | Result<T> | string;

export abstract class Maybe<T> {
  static is(value: unknown): value is Maybe<unknown> {
    return (
      typeof value === "object" && value !== null && value instanceof Maybe
    );
  }

  static some<T>(value: T): Some<T> {
    return new Some(value);
  }

  static none<T>(): None<T> {
    return new None();
  }

  static lift<T>(value: T | Maybe<T> | null | undefined): Maybe<T> {
    if (Maybe.is(value)) {
      return value;
    } else if (value === null || value === undefined) {
      return Maybe.none();
    } else {
      return Maybe.some(value);
    }
  }

  abstract chain<U>(choice: {
    ifSome: (value: T) => Maybe<U>;
    ifNone: () => Maybe<U>;
  }): Maybe<U>;

  abstract into<U>(choice: { ifSome: (value: T) => U; ifNone: () => U }): U;

  resolve(ifNone: () => T): T {
    return this.into({
      ifSome: (value) => value,
      ifNone,
    });
  }

  do({
    ifSome,
    ifNone,
  }: {
    ifSome: (value: T) => void;
    ifNone: () => void;
  }): Maybe<T> {
    return this.chain({
      ifSome: (value) => {
        ifSome(value);
        return Maybe.some(value);
      },
      ifNone: () => {
        ifNone();
        return Maybe.none();
      },
    });
  }

  ifOk(callback: () => void): Maybe<T> {
    return this.do({ ifSome: callback, ifNone: () => {} });
  }

  map<U extends object>(ifSome: (value: T) => U | Maybe<U>): Maybe<U> {
    return this.chain({
      ifSome: (value) => Maybe.lift(ifSome(value)),
      ifNone: () => Maybe.none(),
    });
  }

  mapNone<U>(ifNone: () => U | Maybe<U>): Maybe<T | U> {
    return this.chain<T | U>({
      ifSome: (value) => Maybe.some(value),
      ifNone: () => Maybe.lift(ifNone()),
    });
  }
}

class Some<T> extends Maybe<T> {
  #value: T;

  constructor(value: T) {
    super();
    this.#value = value;
  }

  into<U>({ ifSome }: { ifSome: (value: T) => U; ifNone: () => U }): U {
    return ifSome(this.#value);
  }

  chain<U>({
    ifSome,
  }: {
    ifSome: (value: T) => Maybe<U>;
    ifNone: () => Maybe<U>;
  }): Maybe<U> {
    return ifSome(this.#value);
  }
}

class None<T> extends Maybe<T> {
  chain<U>({
    ifNone,
  }: {
    ifSome: (value: T) => Maybe<U>;
    ifNone: () => Maybe<U>;
  }): Maybe<U> {
    return ifNone();
  }

  into<U>({ ifNone }: { ifSome: (value: T) => U; ifNone: () => U }): U {
    return ifNone();
  }
}

export abstract class Result<T extends object> {
  static is(value: unknown): value is Result<object> {
    return (
      typeof value === "object" && value !== null && value instanceof Result
    );
  }

  static ok<T extends object>(value: T): Ok<T> {
    return new Ok(value);
  }

  static err<T extends object>(reason: unknown): Err<T> {
    if (reason === undefined) {
      debugger;
    }

    if (reason instanceof Error) {
      return new Err(
        reason.stack ||
          reason.message ||
          `An unexpected error occurred (class: ${reason.constructor.name})`
      );
    } else if (typeof reason === "string") {
      return new Err(reason);
    } else {
      console.error("An unxpected error occurred", reason);
      return new Err(`An unexpected error occurred (${String(reason)})`);
    }
  }

  static lift<T extends object>(value: IntoResult<T>): Result<T> {
    if (Result.is(value)) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return Result.ok(value);
    } else {
      return Result.err(value);
    }
  }

  abstract readonly status: "ok" | "err";

  abstract chain<U extends object>(choice: {
    ifOk: (value: T) => Result<U>;
    ifErr: (reason: string) => Result<U>;
  }): Result<U>;

  do({
    ifOk,
    ifErr,
  }: {
    ifOk: (value: T) => void;
    ifErr: (reason: string) => void;
  }): Result<T> {
    return this.chain({
      ifOk: (value) => {
        ifOk(value);
        return Result.ok(value);
      },
      ifErr: (reason) => {
        ifErr(reason);
        return Result.err(reason);
      },
    });
  }

  ifOk(callback: () => void): Result<T> {
    return this.do({ ifOk: callback, ifErr: () => {} });
  }

  map<U extends object>(ifOk: (value: T) => U | Result<U>): Result<U> {
    return this.chain({
      ifOk: (value) => Result.lift(ifOk(value)),
      ifErr: (reason) => Result.err(reason),
    });
  }

  mapErr<U extends object>(
    ifErr: (reason: string) => IntoResult<U>
  ): Result<T | U> {
    return this.chain<T | U>({
      ifOk: (value) => Result.ok(value),
      ifErr: (reason) => Result.lift(ifErr(reason)),
    });
  }
}

export class Ok<T extends object> extends Result<T> {
  readonly status = "ok";

  #value: T;

  constructor(value: T) {
    super();
    this.#value = value;
  }

  chain<U extends object>({
    ifOk,
  }: {
    ifOk: (value: T) => Result<U>;
    ifErr: (reason: string) => Result<U>;
  }): Result<U> {
    return ifOk(this.#value);
  }
}

export class Err<T extends object> extends Result<T> {
  readonly status = "err";

  #reason: string;

  constructor(reason: string) {
    super();
    this.#reason = reason;
  }

  chain<U extends object>({
    ifErr,
  }: {
    ifOk: (value: T) => Result<U>;
    ifErr: (reason: string) => Result<U>;
  }): Result<U> {
    return ifErr(this.#reason);
  }
}
