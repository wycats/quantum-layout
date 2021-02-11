function _classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver).value;
}
function _classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    var descriptor = privateMap.get(receiver);
    if (!descriptor.writable) {
        throw new TypeError("attempted to set read only private field");
    }
    descriptor.value = value;
    return value;
}
export class ElementFacade {
    get element() {
        return _classPrivateFieldGet(this, _element);
    }
    attr(qualifiedName, value) {
        if (value === null) {
            _classPrivateFieldGet(this, _element).removeAttribute(qualifiedName);
        } else {
            _classPrivateFieldGet(this, _element).setAttribute(qualifiedName, value || "");
        }
    }
    appendTo(parent, { before =null  } = {
    }) {
        parent.insertBefore(this.element, before);
    }
    replaceContents(callback) {
        _classPrivateFieldGet(this, _element).innerHTML = "";
        callback((node)=>{
            _classPrivateFieldGet(this, _element).append(node);
        });
    }
    replaceText(text) {
        _classPrivateFieldGet(this, _element).innerHTML = "";
        this.appendText(text);
    }
    appendText(text) {
        let strings = text.split("\n");
        if (strings.length === 0) {
            return;
        }
        let head = strings.slice(0, -1);
        let tail = strings[strings.length - 1];
        for (let string of head){
            this.element.append(document.createTextNode(string));
            this.element.append(document.createTextNode("\n"));
        }
        this.element.append(document.createTextNode(tail));
    }
    on(event, callback, options) {
        let handler = options === undefined ? (event)=>{
            event.preventDefault();
            return callback(event);
        } : callback;
        _classPrivateFieldGet(this, _element).addEventListener(event, handler);
        return this;
    }
    fire(event, { sync =false  } = {
    }) {
        Promise.resolve().then(()=>_classPrivateFieldGet(this, _element).dispatchEvent(event)
        );
    }
    constructor(element){
        _element.set(this, {
            writable: true,
            value: void 0
        });
        _classPrivateFieldSet(this, _element, element);
    }
}
var _element = new WeakMap();
export class FormFacade extends ElementFacade {
    get data() {
        let data = new FormData(this.element);
        let out = {
        };
        for (let key of _classPrivateFieldGet(this, _keys)){
            out[key] = data.get(key);
        }
        return out;
    }
    constructor(element1){
        super(element1);
        _keys.set(this, {
            writable: true,
            value: void 0
        });
        _classPrivateFieldSet(this, _keys, [
            ...element1.querySelectorAll("[name]")
        ].map((el)=>el.getAttribute("name")
        ));
    }
}
var _keys = new WeakMap();

