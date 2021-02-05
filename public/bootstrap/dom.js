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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC9kb20udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW50ZXJmYWNlIEV2ZW50T3B0aW9ucyB7XG4gIGFsbG93RGVmYXVsdD86IHRydWU7XG59XG5cbmludGVyZmFjZSBFdmVudE1hcCB7XG4gIFtrZXk6IHN0cmluZ106IEV2ZW50O1xuICBrZXlwcmVzczogS2V5Ym9hcmRFdmVudDtcbiAga2V5ZG93bjogS2V5Ym9hcmRFdmVudDtcbiAga2V5dXA6IEtleWJvYXJkRXZlbnQ7XG4gIGNsaWNrOiBNb3VzZUV2ZW50O1xufVxuXG5leHBvcnQgY2xhc3MgRWxlbWVudEZhY2FkZTxFIGV4dGVuZHMgRWxlbWVudD4ge1xuICAjZWxlbWVudDogRTtcblxuICBjb25zdHJ1Y3RvcihlbGVtZW50OiBFKSB7XG4gICAgdGhpcy4jZWxlbWVudCA9IGVsZW1lbnQ7XG4gIH1cblxuICBnZXQgZWxlbWVudCgpOiBFIHtcbiAgICByZXR1cm4gdGhpcy4jZWxlbWVudDtcbiAgfVxuXG4gIGF0dHIocXVhbGlmaWVkTmFtZTogc3RyaW5nLCB2YWx1ZT86IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcbiAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuI2VsZW1lbnQucmVtb3ZlQXR0cmlidXRlKHF1YWxpZmllZE5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiNlbGVtZW50LnNldEF0dHJpYnV0ZShxdWFsaWZpZWROYW1lLCB2YWx1ZSB8fCBcIlwiKTtcbiAgICB9XG4gIH1cblxuICBhcHBlbmRUbyhcbiAgICBwYXJlbnQ6IE5vZGUgJiBQYXJlbnROb2RlLFxuICAgIHsgYmVmb3JlID0gbnVsbCB9OiB7IGJlZm9yZT86IE5vZGUgfCBudWxsIH0gPSB7fVxuICApOiB2b2lkIHtcbiAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKHRoaXMuZWxlbWVudCwgYmVmb3JlKTtcbiAgfVxuXG4gIHJlcGxhY2VDb250ZW50cyhjYWxsYmFjazogKGFkZDogKG5vZGU6IE5vZGUpID0-IHZvaWQpID0-IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLiNlbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XG4gICAgY2FsbGJhY2soKG5vZGUpID0-IHtcbiAgICAgIHRoaXMuI2VsZW1lbnQuYXBwZW5kKG5vZGUpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVwbGFjZVRleHQodGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy4jZWxlbWVudC5pbm5lckhUTUwgPSBcIlwiO1xuICAgIHRoaXMuYXBwZW5kVGV4dCh0ZXh0KTtcbiAgfVxuXG4gIGFwcGVuZFRleHQodGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IHN0cmluZ3MgPSB0ZXh0LnNwbGl0KFwiXFxuXCIpO1xuXG4gICAgaWYgKHN0cmluZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGhlYWQgPSBzdHJpbmdzLnNsaWNlKDAsIC0xKTtcbiAgICBsZXQgdGFpbCA9IHN0cmluZ3Nbc3RyaW5ncy5sZW5ndGggLSAxXTtcbiAgICBmb3IgKGxldCBzdHJpbmcgb2YgaGVhZCkge1xuICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdHJpbmcpKTtcbiAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcXG5cIikpO1xuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGFpbCkpO1xuICB9XG5cbiAgb248SyBleHRlbmRzIGtleW9mIEV2ZW50TWFwPihcbiAgICBldmVudDogSyxcbiAgICBjYWxsYmFjazogKGV2ZW50OiBFdmVudE1hcFtLXSkgPT4gdm9pZCxcbiAgICBvcHRpb25zPzogRXZlbnRPcHRpb25zXG4gICk6IHRoaXMge1xuICAgIGxldCBoYW5kbGVyID1cbiAgICAgIG9wdGlvbnMgPT09IHVuZGVmaW5lZFxuICAgICAgICA_IChldmVudDogRXZlbnRNYXBbS10pID0-IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgOiBjYWxsYmFjaztcblxuICAgIHRoaXMuI2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCBhcyBzdHJpbmcsIGhhbmRsZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZmlyZShldmVudDogRXZlbnQsIHsgc3luYyA9IGZhbHNlIH06IHsgc3luYz86IGJvb2xlYW4gfSA9IHt9KTogdm9pZCB7XG4gICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB0aGlzLiNlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGb3JtRGVzYzxLIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IHsgW1AgaW4gS106IHN0cmluZyB9O1xuXG50eXBlIERhdGFLZXk8RCBleHRlbmRzIEZvcm1EZXNjPiA9IGtleW9mIEQgJiBzdHJpbmc7XG5cbmV4cG9ydCBjbGFzcyBGb3JtRmFjYWRlPFxuICBEIGV4dGVuZHMgRm9ybURlc2Ncbj4gZXh0ZW5kcyBFbGVtZW50RmFjYWRlPEhUTUxGb3JtRWxlbWVudD4ge1xuICAja2V5czogcmVhZG9ubHkgRGF0YUtleTxEPltdO1xuXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxGb3JtRWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQpO1xuICAgIHRoaXMuI2tleXMgPSBbLi4uZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW25hbWVdXCIpXS5tYXAoXG4gICAgICAoZWwpID0-IGVsLmdldEF0dHJpYnV0ZShcIm5hbWVcIikgYXMgc3RyaW5nXG4gICAgKTtcbiAgfVxuXG4gIGdldCBkYXRhKCk6IEQge1xuICAgIGxldCBkYXRhID0gbmV3IEZvcm1EYXRhKHRoaXMuZWxlbWVudCk7XG4gICAgbGV0IG91dDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXG4gICAgZm9yIChsZXQga2V5IG9mIHRoaXMuI2tleXMpIHtcbiAgICAgIG91dFtrZXldID0gZGF0YS5nZXQoa2V5KSBhcyBzdHJpbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dCBhcyBEO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7YUFZQSxhQUFBO1FBT0EsT0FBQTsyQ0FDQSxRQUFBOztBQUdBLFFBQUEsQ0FBQSxhQUFBLEVBQUEsS0FBQTtZQUNBLEtBQUEsS0FBQSxJQUFBO3dDQUNBLFFBQUEsRUFBQSxlQUFBLENBQUEsYUFBQTs7d0NBRUEsUUFBQSxFQUFBLFlBQUEsQ0FBQSxhQUFBLEVBQUEsS0FBQTs7O0FBSUEsWUFBQSxDQUNBLE1BQUEsSUFDQSxNQUFBLEVBQUEsSUFBQTs7QUFFQSxjQUFBLENBQUEsWUFBQSxNQUFBLE9BQUEsRUFBQSxNQUFBOztBQUdBLG1CQUFBLENBQUEsUUFBQTtvQ0FDQSxRQUFBLEVBQUEsU0FBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQTt3Q0FDQSxRQUFBLEVBQUEsTUFBQSxDQUFBLElBQUE7OztBQUlBLGVBQUEsQ0FBQSxJQUFBO29DQUNBLFFBQUEsRUFBQSxTQUFBO2FBQ0EsVUFBQSxDQUFBLElBQUE7O0FBR0EsY0FBQSxDQUFBLElBQUE7WUFDQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQSxFQUFBO1lBRUEsT0FBQSxDQUFBLE1BQUEsS0FBQSxDQUFBOzs7WUFJQSxJQUFBLEdBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQTtZQUNBLElBQUEsR0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBO2lCQUNBLE1BQUEsSUFBQSxJQUFBO2lCQUNBLE9BQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBO2lCQUNBLE9BQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLGNBQUEsRUFBQSxFQUFBOzthQUdBLE9BQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBOztBQUdBLE1BQUEsQ0FDQSxLQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUE7WUFFQSxPQUFBLEdBQ0EsT0FBQSxLQUFBLFNBQUEsSUFDQSxLQUFBO0FBQ0EsaUJBQUEsQ0FBQSxjQUFBO21CQUNBLFFBQUEsQ0FBQSxLQUFBO1lBRUEsUUFBQTtvQ0FFQSxRQUFBLEVBQUEsZ0JBQUEsQ0FBQSxLQUFBLEVBQUEsT0FBQTs7O0FBSUEsUUFBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLEVBQUEsS0FBQTs7QUFDQSxlQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsaUNBQUEsUUFBQSxFQUFBLGFBQUEsQ0FBQSxLQUFBOzs7Z0JBdEVBLE9BQUE7QUFGQSxnQkFBQTs7d0JBQUEsQ0FBQTs7b0NBR0EsUUFBQSxFQUFBLE9BQUE7OztJQUhBLFFBQUE7YUFnRkEsVUFBQSxTQUVBLGFBQUE7UUFVQSxJQUFBO1lBQ0EsSUFBQSxPQUFBLFFBQUEsTUFBQSxPQUFBO1lBQ0EsR0FBQTs7aUJBRUEsR0FBQSxnQ0FBQSxLQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUE7O2VBR0EsR0FBQTs7Z0JBZkEsUUFBQTtBQUNBLGFBQUEsQ0FBQSxRQUFBO0FBSEEsYUFBQTs7d0JBQUEsQ0FBQTs7b0NBSUEsS0FBQTtlQUFBLFFBQUEsQ0FBQSxnQkFBQSxFQUFBLE1BQUE7VUFBQSxHQUFBLEVBQ0EsRUFBQSxHQUFBLEVBQUEsQ0FBQSxZQUFBLEVBQUEsSUFBQTs7OztJQUxBLEtBQUEifQ==