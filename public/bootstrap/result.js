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
export class Maybe {
    static is(value) {
        return typeof value === "object" && value !== null && value instanceof Maybe;
    }
    static some(value) {
        return new Some(value);
    }
    static none() {
        return new None();
    }
    static lift(value) {
        if (Maybe.is(value)) {
            return value;
        } else if (value === null || value === undefined) {
            return Maybe.none();
        } else {
            return Maybe.some(value);
        }
    }
    resolve(ifNone) {
        return this.into({
            ifSome: (value)=>value
            ,
            ifNone
        });
    }
    do({ ifSome , ifNone  }) {
        return this.chain({
            ifSome: (value)=>{
                ifSome(value);
                return Maybe.some(value);
            },
            ifNone: ()=>{
                ifNone();
                return Maybe.none();
            }
        });
    }
    ifOk(callback) {
        return this.do({
            ifSome: callback,
            ifNone: ()=>{
            }
        });
    }
    map(ifSome) {
        return this.chain({
            ifSome: (value)=>Maybe.lift(ifSome(value))
            ,
            ifNone: ()=>Maybe.none()
        });
    }
    mapNone(ifNone) {
        return this.chain({
            ifSome: (value)=>Maybe.some(value)
            ,
            ifNone: ()=>Maybe.lift(ifNone())
        });
    }
}
class Some extends Maybe {
    into({ ifSome  }) {
        return ifSome(_classPrivateFieldGet(this, _value1));
    }
    chain({ ifSome  }) {
        return ifSome(_classPrivateFieldGet(this, _value1));
    }
    constructor(value1){
        super();
        _value1.set(this, {
            writable: true,
            value: void 0
        });
        _classPrivateFieldSet(this, _value1, value1);
    }
}
var _value1 = new WeakMap();
class None extends Maybe {
    chain({ ifNone  }) {
        return ifNone();
    }
    into({ ifNone  }) {
        return ifNone();
    }
}
export class Result {
    static is(value) {
        return typeof value === "object" && value !== null && value instanceof Result;
    }
    static ok(value) {
        return new Ok(value);
    }
    static err(reason) {
        if (reason === undefined) {
            debugger;
        }
        if (reason instanceof Error) {
            return new Err(reason.stack || reason.message || `An unexpected error occurred (class: ${reason.constructor.name})`);
        } else if (typeof reason === "string") {
            return new Err(reason);
        } else {
            console.error("An unxpected error occurred", reason);
            return new Err(`An unexpected error occurred (${String(reason)})`);
        }
    }
    static lift(value) {
        if (Result.is(value)) {
            return value;
        } else if (typeof value === "object" && value !== null) {
            return Result.ok(value);
        } else {
            return Result.err(value);
        }
    }
    do({ ifOk , ifErr  }) {
        return this.chain({
            ifOk: (value2)=>{
                ifOk(value2);
                return Result.ok(value2);
            },
            ifErr: (reason)=>{
                ifErr(reason);
                return Result.err(reason);
            }
        });
    }
    ifOk(callback) {
        return this.do({
            ifOk: callback,
            ifErr: ()=>{
            }
        });
    }
    map(ifOk) {
        return this.chain({
            ifOk: (value2)=>Result.lift(ifOk(value2))
            ,
            ifErr: (reason)=>Result.err(reason)
        });
    }
    mapErr(ifErr) {
        return this.chain({
            ifOk: (value2)=>Result.ok(value2)
            ,
            ifErr: (reason)=>Result.lift(ifErr(reason))
        });
    }
}
export class Ok extends Result {
    chain({ ifOk  }) {
        return ifOk(_classPrivateFieldGet(this, _value2));
    }
    constructor(value2){
        super();
        this.status = "ok";
        _value2.set(this, {
            writable: true,
            value: void 0
        });
        _classPrivateFieldSet(this, _value2, value2);
    }
}
var _value2 = new WeakMap();
export class Err extends Result {
    chain({ ifErr  }) {
        return ifErr(_classPrivateFieldGet(this, _reason));
    }
    constructor(reason){
        super();
        this.status = "err";
        _reason.set(this, {
            writable: true,
            value: void 0
        });
        _classPrivateFieldSet(this, _reason, reason);
    }
}
var _reason = new WeakMap();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC9yZXN1bHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29tcGlsZUJ1bmRsZU9wdGlvbnMgfSBmcm9tIFwiQHN3Yy9jb3JlL3NwYWNrXCI7XG5cbnR5cGUgSW50b1Jlc3VsdDxUIGV4dGVuZHMgb2JqZWN0PiA9IFQgfCBSZXN1bHQ8VD4gfCBzdHJpbmc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNYXliZTxUPiB7XG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIE1heWJlPHVua25vd24-IHtcbiAgICByZXR1cm4gKFxuICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlIGluc3RhbmNlb2YgTWF5YmVcbiAgICApO1xuICB9XG5cbiAgc3RhdGljIHNvbWU8VD4odmFsdWU6IFQpOiBTb21lPFQ-IHtcbiAgICByZXR1cm4gbmV3IFNvbWUodmFsdWUpO1xuICB9XG5cbiAgc3RhdGljIG5vbmU8VD4oKTogTm9uZTxUPiB7XG4gICAgcmV0dXJuIG5ldyBOb25lKCk7XG4gIH1cblxuICBzdGF0aWMgbGlmdDxUPih2YWx1ZTogVCB8IE1heWJlPFQ-IHwgbnVsbCB8IHVuZGVmaW5lZCk6IE1heWJlPFQ-IHtcbiAgICBpZiAoTWF5YmUuaXModmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gTWF5YmUubm9uZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTWF5YmUuc29tZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgYWJzdHJhY3QgY2hhaW48VT4oY2hvaWNlOiB7XG4gICAgaWZTb21lOiAodmFsdWU6IFQpID0-IE1heWJlPFU-O1xuICAgIGlmTm9uZTogKCkgPT4gTWF5YmU8VT47XG4gIH0pOiBNYXliZTxVPjtcblxuICBhYnN0cmFjdCBpbnRvPFU-KGNob2ljZTogeyBpZlNvbWU6ICh2YWx1ZTogVCkgPT4gVTsgaWZOb25lOiAoKSA9PiBVIH0pOiBVO1xuXG4gIHJlc29sdmUoaWZOb25lOiAoKSA9PiBUKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuaW50byh7XG4gICAgICBpZlNvbWU6ICh2YWx1ZSkgPT4gdmFsdWUsXG4gICAgICBpZk5vbmUsXG4gICAgfSk7XG4gIH1cblxuICBkbyh7XG4gICAgaWZTb21lLFxuICAgIGlmTm9uZSxcbiAgfToge1xuICAgIGlmU29tZTogKHZhbHVlOiBUKSA9PiB2b2lkO1xuICAgIGlmTm9uZTogKCkgPT4gdm9pZDtcbiAgfSk6IE1heWJlPFQ-IHtcbiAgICByZXR1cm4gdGhpcy5jaGFpbih7XG4gICAgICBpZlNvbWU6ICh2YWx1ZSkgPT4ge1xuICAgICAgICBpZlNvbWUodmFsdWUpO1xuICAgICAgICByZXR1cm4gTWF5YmUuc29tZSh2YWx1ZSk7XG4gICAgICB9LFxuICAgICAgaWZOb25lOiAoKSA9PiB7XG4gICAgICAgIGlmTm9uZSgpO1xuICAgICAgICByZXR1cm4gTWF5YmUubm9uZSgpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGlmT2soY2FsbGJhY2s6ICgpID0-IHZvaWQpOiBNYXliZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMuZG8oeyBpZlNvbWU6IGNhbGxiYWNrLCBpZk5vbmU6ICgpID0-IHt9IH0pO1xuICB9XG5cbiAgbWFwPFUgZXh0ZW5kcyBvYmplY3Q-KGlmU29tZTogKHZhbHVlOiBUKSA9PiBVIHwgTWF5YmU8VT4pOiBNYXliZTxVPiB7XG4gICAgcmV0dXJuIHRoaXMuY2hhaW4oe1xuICAgICAgaWZTb21lOiAodmFsdWUpID0-IE1heWJlLmxpZnQoaWZTb21lKHZhbHVlKSksXG4gICAgICBpZk5vbmU6ICgpID0-IE1heWJlLm5vbmUoKSxcbiAgICB9KTtcbiAgfVxuXG4gIG1hcE5vbmU8VT4oaWZOb25lOiAoKSA9PiBVIHwgTWF5YmU8VT4pOiBNYXliZTxUIHwgVT4ge1xuICAgIHJldHVybiB0aGlzLmNoYWluPFQgfCBVPih7XG4gICAgICBpZlNvbWU6ICh2YWx1ZSkgPT4gTWF5YmUuc29tZSh2YWx1ZSksXG4gICAgICBpZk5vbmU6ICgpID0-IE1heWJlLmxpZnQoaWZOb25lKCkpLFxuICAgIH0pO1xuICB9XG59XG5cbmNsYXNzIFNvbWU8VD4gZXh0ZW5kcyBNYXliZTxUPiB7XG4gICN2YWx1ZTogVDtcblxuICBjb25zdHJ1Y3Rvcih2YWx1ZTogVCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy4jdmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIGludG88VT4oeyBpZlNvbWUgfTogeyBpZlNvbWU6ICh2YWx1ZTogVCkgPT4gVTsgaWZOb25lOiAoKSA9PiBVIH0pOiBVIHtcbiAgICByZXR1cm4gaWZTb21lKHRoaXMuI3ZhbHVlKTtcbiAgfVxuXG4gIGNoYWluPFU-KHtcbiAgICBpZlNvbWUsXG4gIH06IHtcbiAgICBpZlNvbWU6ICh2YWx1ZTogVCkgPT4gTWF5YmU8VT47XG4gICAgaWZOb25lOiAoKSA9PiBNYXliZTxVPjtcbiAgfSk6IE1heWJlPFU-IHtcbiAgICByZXR1cm4gaWZTb21lKHRoaXMuI3ZhbHVlKTtcbiAgfVxufVxuXG5jbGFzcyBOb25lPFQ-IGV4dGVuZHMgTWF5YmU8VD4ge1xuICBjaGFpbjxVPih7XG4gICAgaWZOb25lLFxuICB9OiB7XG4gICAgaWZTb21lOiAodmFsdWU6IFQpID0-IE1heWJlPFU-O1xuICAgIGlmTm9uZTogKCkgPT4gTWF5YmU8VT47XG4gIH0pOiBNYXliZTxVPiB7XG4gICAgcmV0dXJuIGlmTm9uZSgpO1xuICB9XG5cbiAgaW50bzxVPih7IGlmTm9uZSB9OiB7IGlmU29tZTogKHZhbHVlOiBUKSA9PiBVOyBpZk5vbmU6ICgpID0-IFUgfSk6IFUge1xuICAgIHJldHVybiBpZk5vbmUoKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVzdWx0PFQgZXh0ZW5kcyBvYmplY3Q-IHtcbiAgc3RhdGljIGlzKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUmVzdWx0PG9iamVjdD4ge1xuICAgIHJldHVybiAoXG4gICAgICB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgaW5zdGFuY2VvZiBSZXN1bHRcbiAgICApO1xuICB9XG5cbiAgc3RhdGljIG9rPFQgZXh0ZW5kcyBvYmplY3Q-KHZhbHVlOiBUKTogT2s8VD4ge1xuICAgIHJldHVybiBuZXcgT2sodmFsdWUpO1xuICB9XG5cbiAgc3RhdGljIGVycjxUIGV4dGVuZHMgb2JqZWN0PihyZWFzb246IHVua25vd24pOiBFcnI8VD4ge1xuICAgIGlmIChyZWFzb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGVidWdnZXI7XG4gICAgfVxuXG4gICAgaWYgKHJlYXNvbiBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICByZXR1cm4gbmV3IEVycihcbiAgICAgICAgcmVhc29uLnN0YWNrIHx8XG4gICAgICAgICAgcmVhc29uLm1lc3NhZ2UgfHxcbiAgICAgICAgICBgQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZCAoY2xhc3M6ICR7cmVhc29uLmNvbnN0cnVjdG9yLm5hbWV9KWBcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmVhc29uID09PSBcInN0cmluZ1wiKSB7XG4gICAgICByZXR1cm4gbmV3IEVycihyZWFzb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQW4gdW54cGVjdGVkIGVycm9yIG9jY3VycmVkXCIsIHJlYXNvbik7XG4gICAgICByZXR1cm4gbmV3IEVycihgQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZCAoJHtTdHJpbmcocmVhc29uKX0pYCk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGxpZnQ8VCBleHRlbmRzIG9iamVjdD4odmFsdWU6IEludG9SZXN1bHQ8VD4pOiBSZXN1bHQ8VD4ge1xuICAgIGlmIChSZXN1bHQuaXModmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBSZXN1bHQub2sodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUmVzdWx0LmVycih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgYWJzdHJhY3QgcmVhZG9ubHkgc3RhdHVzOiBcIm9rXCIgfCBcImVyclwiO1xuXG4gIGFic3RyYWN0IGNoYWluPFUgZXh0ZW5kcyBvYmplY3Q-KGNob2ljZToge1xuICAgIGlmT2s6ICh2YWx1ZTogVCkgPT4gUmVzdWx0PFU-O1xuICAgIGlmRXJyOiAocmVhc29uOiBzdHJpbmcpID0-IFJlc3VsdDxVPjtcbiAgfSk6IFJlc3VsdDxVPjtcblxuICBkbyh7XG4gICAgaWZPayxcbiAgICBpZkVycixcbiAgfToge1xuICAgIGlmT2s6ICh2YWx1ZTogVCkgPT4gdm9pZDtcbiAgICBpZkVycjogKHJlYXNvbjogc3RyaW5nKSA9PiB2b2lkO1xuICB9KTogUmVzdWx0PFQ-IHtcbiAgICByZXR1cm4gdGhpcy5jaGFpbih7XG4gICAgICBpZk9rOiAodmFsdWUpID0-IHtcbiAgICAgICAgaWZPayh2YWx1ZSk7XG4gICAgICAgIHJldHVybiBSZXN1bHQub2sodmFsdWUpO1xuICAgICAgfSxcbiAgICAgIGlmRXJyOiAocmVhc29uKSA9PiB7XG4gICAgICAgIGlmRXJyKHJlYXNvbik7XG4gICAgICAgIHJldHVybiBSZXN1bHQuZXJyKHJlYXNvbik7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgaWZPayhjYWxsYmFjazogKCkgPT4gdm9pZCk6IFJlc3VsdDxUPiB7XG4gICAgcmV0dXJuIHRoaXMuZG8oeyBpZk9rOiBjYWxsYmFjaywgaWZFcnI6ICgpID0-IHt9IH0pO1xuICB9XG5cbiAgbWFwPFUgZXh0ZW5kcyBvYmplY3Q-KGlmT2s6ICh2YWx1ZTogVCkgPT4gVSB8IFJlc3VsdDxVPik6IFJlc3VsdDxVPiB7XG4gICAgcmV0dXJuIHRoaXMuY2hhaW4oe1xuICAgICAgaWZPazogKHZhbHVlKSA9PiBSZXN1bHQubGlmdChpZk9rKHZhbHVlKSksXG4gICAgICBpZkVycjogKHJlYXNvbikgPT4gUmVzdWx0LmVycihyZWFzb24pLFxuICAgIH0pO1xuICB9XG5cbiAgbWFwRXJyPFUgZXh0ZW5kcyBvYmplY3Q-KFxuICAgIGlmRXJyOiAocmVhc29uOiBzdHJpbmcpID0-IEludG9SZXN1bHQ8VT5cbiAgKTogUmVzdWx0PFQgfCBVPiB7XG4gICAgcmV0dXJuIHRoaXMuY2hhaW48VCB8IFU-KHtcbiAgICAgIGlmT2s6ICh2YWx1ZSkgPT4gUmVzdWx0Lm9rKHZhbHVlKSxcbiAgICAgIGlmRXJyOiAocmVhc29uKSA9PiBSZXN1bHQubGlmdChpZkVycihyZWFzb24pKSxcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2s8VCBleHRlbmRzIG9iamVjdD4gZXh0ZW5kcyBSZXN1bHQ8VD4ge1xuICByZWFkb25seSBzdGF0dXMgPSBcIm9rXCI7XG5cbiAgI3ZhbHVlOiBUO1xuXG4gIGNvbnN0cnVjdG9yKHZhbHVlOiBUKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLiN2YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgY2hhaW48VSBleHRlbmRzIG9iamVjdD4oe1xuICAgIGlmT2ssXG4gIH06IHtcbiAgICBpZk9rOiAodmFsdWU6IFQpID0-IFJlc3VsdDxVPjtcbiAgICBpZkVycjogKHJlYXNvbjogc3RyaW5nKSA9PiBSZXN1bHQ8VT47XG4gIH0pOiBSZXN1bHQ8VT4ge1xuICAgIHJldHVybiBpZk9rKHRoaXMuI3ZhbHVlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRXJyPFQgZXh0ZW5kcyBvYmplY3Q-IGV4dGVuZHMgUmVzdWx0PFQ-IHtcbiAgcmVhZG9ubHkgc3RhdHVzID0gXCJlcnJcIjtcblxuICAjcmVhc29uOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocmVhc29uOiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuI3JlYXNvbiA9IHJlYXNvbjtcbiAgfVxuXG4gIGNoYWluPFUgZXh0ZW5kcyBvYmplY3Q-KHtcbiAgICBpZkVycixcbiAgfToge1xuICAgIGlmT2s6ICh2YWx1ZTogVCkgPT4gUmVzdWx0PFU-O1xuICAgIGlmRXJyOiAocmVhc29uOiBzdHJpbmcpID0-IFJlc3VsdDxVPjtcbiAgfSk6IFJlc3VsdDxVPiB7XG4gICAgcmV0dXJuIGlmRXJyKHRoaXMuI3JlYXNvbik7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OzthQUlBLEtBQUE7V0FDQSxFQUFBLENBQUEsS0FBQTtzQkFFQSxLQUFBLE1BQUEsTUFBQSxLQUFBLEtBQUEsS0FBQSxJQUFBLElBQUEsS0FBQSxZQUFBLEtBQUE7O1dBSUEsSUFBQSxDQUFBLEtBQUE7bUJBQ0EsSUFBQSxDQUFBLEtBQUE7O1dBR0EsSUFBQTttQkFDQSxJQUFBOztXQUdBLElBQUEsQ0FBQSxLQUFBO1lBQ0EsS0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBO21CQUNBLEtBQUE7bUJBQ0EsS0FBQSxLQUFBLElBQUEsSUFBQSxLQUFBLEtBQUEsU0FBQTttQkFDQSxLQUFBLENBQUEsSUFBQTs7bUJBRUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBOzs7QUFXQSxXQUFBLENBQUEsTUFBQTtvQkFDQSxJQUFBO0FBQ0Esa0JBQUEsR0FBQSxLQUFBLEdBQUEsS0FBQTs7QUFDQSxrQkFBQTs7O0FBSUEsTUFBQSxHQUNBLE1BQUEsR0FDQSxNQUFBO29CQUtBLEtBQUE7QUFDQSxrQkFBQSxHQUFBLEtBQUE7QUFDQSxzQkFBQSxDQUFBLEtBQUE7dUJBQ0EsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBOztBQUVBLGtCQUFBO0FBQ0Esc0JBQUE7dUJBQ0EsS0FBQSxDQUFBLElBQUE7Ozs7QUFLQSxRQUFBLENBQUEsUUFBQTtvQkFDQSxFQUFBO0FBQUEsa0JBQUEsRUFBQSxRQUFBO0FBQUEsa0JBQUE7Ozs7QUFHQSxPQUFBLENBQUEsTUFBQTtvQkFDQSxLQUFBO0FBQ0Esa0JBQUEsR0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQTs7QUFDQSxrQkFBQSxNQUFBLEtBQUEsQ0FBQSxJQUFBOzs7QUFJQSxXQUFBLENBQUEsTUFBQTtvQkFDQSxLQUFBO0FBQ0Esa0JBQUEs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