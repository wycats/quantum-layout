interface EventOptions {
  allowDefault?: true;
}

interface EventMap {
  [key: string]: Event;
  keypress: KeyboardEvent;
  keydown: KeyboardEvent;
  keyup: KeyboardEvent;
  click: MouseEvent;
}

export class ElementFacade<E extends Element> {
  #element: E;

  constructor(element: E) {
    this.#element = element;
  }

  get element(): E {
    return this.#element;
  }

  attr(qualifiedName: string, value?: string | null): void {
    if (value === null) {
      this.#element.removeAttribute(qualifiedName);
    } else {
      this.#element.setAttribute(qualifiedName, value || "");
    }
  }

  appendTo(
    parent: Node & ParentNode,
    { before = null }: { before?: Node | null } = {}
  ): void {
    parent.insertBefore(this.element, before);
  }

  replaceContents(callback: (add: (node: Node) => void) => void): void {
    this.#element.innerHTML = "";
    callback((node) => {
      this.#element.append(node);
    });
  }

  replaceText(text: string): void {
    this.#element.innerHTML = "";
    this.appendText(text);
  }

  appendText(text: string): void {
    let strings = text.split("\n");

    if (strings.length === 0) {
      return;
    }

    let head = strings.slice(0, -1);
    let tail = strings[strings.length - 1];
    for (let string of head) {
      this.element.append(document.createTextNode(string));
      this.element.append(document.createTextNode("\n"));
    }

    this.element.append(document.createTextNode(tail));
  }

  on<K extends keyof EventMap>(
    event: K,
    callback: (event: EventMap[K]) => void,
    options?: EventOptions
  ): this {
    let handler =
      options === undefined
        ? (event: EventMap[K]) => {
            event.preventDefault();
            return callback(event);
          }
        : callback;

    this.#element.addEventListener(event as string, handler);
    return this;
  }

  fire(event: Event, { sync = false }: { sync?: boolean } = {}): void {
    Promise.resolve().then(() => this.#element.dispatchEvent(event));
  }
}

export type FormDesc<K extends string = string> = { [P in K]: string };

type DataKey<D extends FormDesc> = keyof D & string;

export class FormFacade<
  D extends FormDesc
> extends ElementFacade<HTMLFormElement> {
  #keys: readonly DataKey<D>[];

  constructor(element: HTMLFormElement) {
    super(element);
    this.#keys = [...element.querySelectorAll("[name]")].map(
      (el) => el.getAttribute("name") as string
    );
  }

  get data(): D {
    let data = new FormData(this.element);
    let out: Record<string, string> = {};

    for (let key of this.#keys) {
      out[key] = data.get(key) as string;
    }

    return out as D;
  }
}
