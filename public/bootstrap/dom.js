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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC1zcmMvYm9vdHN0cmFwL2RvbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbnRlcmZhY2UgRXZlbnRPcHRpb25zIHtcbiAgYWxsb3dEZWZhdWx0PzogdHJ1ZTtcbn1cblxuaW50ZXJmYWNlIEV2ZW50TWFwIHtcbiAgW2tleTogc3RyaW5nXTogRXZlbnQ7XG4gIGtleXByZXNzOiBLZXlib2FyZEV2ZW50O1xuICBrZXlkb3duOiBLZXlib2FyZEV2ZW50O1xuICBrZXl1cDogS2V5Ym9hcmRFdmVudDtcbiAgY2xpY2s6IE1vdXNlRXZlbnQ7XG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50RmFjYWRlPEUgZXh0ZW5kcyBFbGVtZW50PiB7XG4gICNlbGVtZW50OiBFO1xuXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEUpIHtcbiAgICB0aGlzLiNlbGVtZW50ID0gZWxlbWVudDtcbiAgfVxuXG4gIGdldCBlbGVtZW50KCk6IEUge1xuICAgIHJldHVybiB0aGlzLiNlbGVtZW50O1xuICB9XG5cbiAgYXR0cihxdWFsaWZpZWROYW1lOiBzdHJpbmcsIHZhbHVlPzogc3RyaW5nIHwgbnVsbCk6IHZvaWQge1xuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy4jZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUocXVhbGlmaWVkTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuI2VsZW1lbnQuc2V0QXR0cmlidXRlKHF1YWxpZmllZE5hbWUsIHZhbHVlIHx8IFwiXCIpO1xuICAgIH1cbiAgfVxuXG4gIGFwcGVuZFRvKFxuICAgIHBhcmVudDogTm9kZSAmIFBhcmVudE5vZGUsXG4gICAgeyBiZWZvcmUgPSBudWxsIH06IHsgYmVmb3JlPzogTm9kZSB8IG51bGwgfSA9IHt9XG4gICk6IHZvaWQge1xuICAgIHBhcmVudC5pbnNlcnRCZWZvcmUodGhpcy5lbGVtZW50LCBiZWZvcmUpO1xuICB9XG5cbiAgcmVwbGFjZUNvbnRlbnRzKGNhbGxiYWNrOiAoYWRkOiAobm9kZTogTm9kZSkgPT4gdm9pZCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuI2VsZW1lbnQuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBjYWxsYmFjaygobm9kZSkgPT4ge1xuICAgICAgdGhpcy4jZWxlbWVudC5hcHBlbmQobm9kZSk7XG4gICAgfSk7XG4gIH1cblxuICByZXBsYWNlVGV4dCh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLiNlbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XG4gICAgdGhpcy5hcHBlbmRUZXh0KHRleHQpO1xuICB9XG5cbiAgYXBwZW5kVGV4dCh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgc3RyaW5ncyA9IHRleHQuc3BsaXQoXCJcXG5cIik7XG5cbiAgICBpZiAoc3RyaW5ncy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgaGVhZCA9IHN0cmluZ3Muc2xpY2UoMCwgLTEpO1xuICAgIGxldCB0YWlsID0gc3RyaW5nc1tzdHJpbmdzLmxlbmd0aCAtIDFdO1xuICAgIGZvciAobGV0IHN0cmluZyBvZiBoZWFkKSB7XG4gICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0cmluZykpO1xuICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlxcblwiKSk7XG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0YWlsKSk7XG4gIH1cblxuICBvbjxLIGV4dGVuZHMga2V5b2YgRXZlbnRNYXA-KFxuICAgIGV2ZW50OiBLLFxuICAgIGNhbGxiYWNrOiAoZXZlbnQ6IEV2ZW50TWFwW0tdKSA9PiB2b2lkLFxuICAgIG9wdGlvbnM_OiBFdmVudE9wdGlvbnNcbiAgKTogdGhpcyB7XG4gICAgbGV0IGhhbmRsZXIgPVxuICAgICAgb3B0aW9ucyA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gKGV2ZW50OiBFdmVudE1hcFtLXSkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICA6IGNhbGxiYWNrO1xuXG4gICAgdGhpcy4jZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50IGFzIHN0cmluZywgaGFuZGxlcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBmaXJlKGV2ZW50OiBFdmVudCwgeyBzeW5jID0gZmFsc2UgfTogeyBzeW5jPzogYm9vbGVhbiB9ID0ge30pOiB2b2lkIHtcbiAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0-IHRoaXMuI2VsZW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCkpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIEZvcm1EZXNjPEsgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc-ID0geyBbUCBpbiBLXTogc3RyaW5nIH07XG5cbnR5cGUgRGF0YUtleTxEIGV4dGVuZHMgRm9ybURlc2M-ID0ga2V5b2YgRCAmIHN0cmluZztcblxuZXhwb3J0IGNsYXNzIEZvcm1GYWNhZGU8XG4gIEQgZXh0ZW5kcyBGb3JtRGVzY1xuPiBleHRlbmRzIEVsZW1lbnRGYWNhZGU8SFRNTEZvcm1FbGVtZW50PiB7XG4gICNrZXlzOiByZWFkb25seSBEYXRhS2V5PEQ-W107XG5cbiAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEZvcm1FbGVtZW50KSB7XG4gICAgc3VwZXIoZWxlbWVudCk7XG4gICAgdGhpcy4ja2V5cyA9IFsuLi5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbbmFtZV1cIildLm1hcChcbiAgICAgIChlbCkgPT4gZWwuZ2V0QXR0cmlidXRlKFwibmFtZVwiKSBhcyBzdHJpbmdcbiAgICApO1xuICB9XG5cbiAgZ2V0IGRhdGEoKTogRCB7XG4gICAgbGV0IGRhdGEgPSBuZXcgRm9ybURhdGEodGhpcy5lbGVtZW50KTtcbiAgICBsZXQgb3V0OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc-ID0ge307XG5cbiAgICBmb3IgKGxldCBrZXkgb2YgdGhpcy4ja2V5cykge1xuICAgICAgb3V0W2tleV0gPSBkYXRhLmdldChrZXkpIGFzIHN0cmluZztcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0IGFzIEQ7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OzthQVlBLGFBQUE7UUFPQSxPQUFBOzJDQUNBLFFBQUE7O0FBR0EsUUFBQSxDQUFBLGFBQUEsRUFBQSxLQUFBO1lBQ0EsS0FBQSxLQUFBLElBQUE7d0NBQ0EsUUFBQSxFQUFBLGVBQUEsQ0FBQSxhQUFBOzt3Q0FFQSxRQUFBLEVBQUEsWUFBQSxDQUFBLGFBQUEsRUFBQSxLQUFBOzs7QUFJQSxZQUFBLENBQ0EsTUFBQSxJQUNBLE1BQUEsRUFBQSxJQUFBOztBQUVBLGNBQUEsQ0FBQSxZQUFBLE1BQUEsT0FBQSxFQUFBLE1BQUE7O0FBR0EsbUJBQUEsQ0FBQSxRQUFBO29DQUNBLFFBQUEsRUFBQSxTQUFBO0FBQ0EsZ0JBQUEsRUFBQSxJQUFBO3dDQUNBLFFBQUEsRUFBQSxNQUFBLENBQUEsSUFBQTs7O0FBSUEsZUFBQSxDQUFBLElBQUE7b0NBQ0EsUUFBQSxFQUFBLFNBQUE7YUFDQSxVQUFBLENBQUEsSUFBQTs7QUFHQSxjQUFBLENBQUEsSUFBQTtZQUNBLE9BQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxFQUFBLEVBQUE7WUFFQSxPQUFBLENBQUEsTUFBQSxLQUFBLENBQUE7OztZQUlBLElBQUEsR0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBO1lBQ0EsSUFBQSxHQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxHQUFBLENBQUE7aUJBQ0EsTUFBQSxJQUFBLElBQUE7aUJBQ0EsT0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsY0FBQSxDQUFBLE1BQUE7aUJBQ0EsT0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsY0FBQSxFQUFBLEVBQUE7O2FBR0EsT0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsY0FBQSxDQUFBLElBQUE7O0FBR0EsTUFBQSxDQUNBLEtBQUEsRUFDQSxRQUFBLEVBQ0EsT0FBQTtZQUVBLE9BQUEsR0FDQSxPQUFBLEtBQUEsU0FBQSxJQUNBLEtBQUE7QUFDQSxpQkFBQSxDQUFBLGNBQUE7bUJBQ0EsUUFBQSxDQUFBLEtBQUE7WUFFQSxRQUFBO29DQUVBLFFBQUEsRUFBQSxnQkFBQSxDQUFBLEtBQUEsRUFBQSxPQUFBOzs7QUFJQSxRQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsRUFBQSxLQUFBOztBQUNBLGVBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxpQ0FBQSxRQUFBLEVBQUEsYUFBQSxDQUFBLEtBQUE7OztnQkF0RUEsT0FBQTtBQUZBLGdCQUFBOzt3QkFBQSxDQUFBOztvQ0FHQSxRQUFBLEVBQUEsT0FBQTs7O0lBSEEsUUFBQTthQWdGQSxVQUFBLFNBRUEsYUFBQTtRQVVBLElBQUE7WUFDQSxJQUFBLE9BQUEsUUFBQSxNQUFBLE9BQUE7WUFDQSxHQUFBOztpQkFFQSxHQUFBLGdDQUFBLEtBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQTs7ZUFHQSxHQUFBOztnQkFmQSxRQUFBO0FBQ0EsYUFBQSxDQUFBLFFBQUE7QUFIQSxhQUFBOzt3QkFBQSxDQUFBOztvQ0FJQSxLQUFBO2VBQUEsUUFBQSxDQUFBLGdCQUFBLEVBQUEsTUFBQTtVQUFBLEdBQUEsRUFDQSxFQUFBLEdBQUEsRUFBQSxDQUFBLFlBQUEsRUFBQSxJQUFBOzs7O0lBTEEsS0FBQSJ9