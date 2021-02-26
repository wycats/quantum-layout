export interface LogOptions<Category extends string> {
  readonly icons: { [P in string]: string } & { default: string };
  readonly enabled: Set<Category | "*">;
}

export interface Options<Category extends string> {
  readonly log: LogOptions<Category>;
}

export class Environment<Category extends string> {
  static default<Category extends string>(
    defaultIcon: string
  ): Environment<Category> {
    return new Environment({
      icons: {
        default: defaultIcon,
      },
      enabled: new Set(),
    });
  }

  private log: LogOptions<Category>;

  constructor(log: LogOptions<Category>) {
    this.log = log;
  }

  icon(category: Category, icon: string): Environment<Category> {
    return new Environment({
      ...this.log,
      icons: {
        ...this.log.icons,
        [category]: icon,
      },
    });
  }

  enable(...categories: (Category | "*")[]): Environment<Category> {
    return new Environment({
      ...this.log,
      enabled: new Set([...this.log.enabled, ...categories]),
    });
  }

  private getIcon(category: Category): string {
    let icons = this.log.icons;
    return icons[category] || icons.default;
  }

  trace(
    ...args:
      | [category: Category, ...message: unknown[]]
      | [force: true, category: Category, ...message: unknown[]]
  ): void {
    let { force, category, message } = traceArgs(args);

    if (force || this.log.enabled.has(category) || this.log.enabled.has("*")) {
      console.log(`${this.getIcon(category)} <${category}>`, ...message);
    }
  }
}

type TraceArgs<Category extends string> =
  | [category: Category, ...message: unknown[]]
  | [force: true, category: Category, ...message: unknown[]];

function traceArgs<Category extends string>(args: TraceArgs<Category>) {
  if (typeof args[0] === "boolean") {
    let [, category, ...message] = args as [
      force: true,
      category: Category,
      ...message: unknown[]
    ];

    return { force: true, category, message };
  } else {
    let [category, ...message] = args as [
      category: Category,
      ...message: unknown[]
    ];

    return {
      force: false,
      category,
      message,
    };
  }
}
