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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC1zcmMvYm9vdHN0cmFwL3Jlc3VsdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJ0eXBlIEludG9SZXN1bHQ8VCBleHRlbmRzIG9iamVjdD4gPSBUIHwgUmVzdWx0PFQ-IHwgc3RyaW5nO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTWF5YmU8VD4ge1xuICBzdGF0aWMgaXModmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBNYXliZTx1bmtub3duPiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSBpbnN0YW5jZW9mIE1heWJlXG4gICAgKTtcbiAgfVxuXG4gIHN0YXRpYyBzb21lPFQ-KHZhbHVlOiBUKTogU29tZTxUPiB7XG4gICAgcmV0dXJuIG5ldyBTb21lKHZhbHVlKTtcbiAgfVxuXG4gIHN0YXRpYyBub25lPFQ-KCk6IE5vbmU8VD4ge1xuICAgIHJldHVybiBuZXcgTm9uZSgpO1xuICB9XG5cbiAgc3RhdGljIGxpZnQ8VD4odmFsdWU6IFQgfCBNYXliZTxUPiB8IG51bGwgfCB1bmRlZmluZWQpOiBNYXliZTxUPiB7XG4gICAgaWYgKE1heWJlLmlzKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIE1heWJlLm5vbmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE1heWJlLnNvbWUodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIGFic3RyYWN0IGNoYWluPFU-KGNob2ljZToge1xuICAgIGlmU29tZTogKHZhbHVlOiBUKSA9PiBNYXliZTxVPjtcbiAgICBpZk5vbmU6ICgpID0-IE1heWJlPFU-O1xuICB9KTogTWF5YmU8VT47XG5cbiAgYWJzdHJhY3QgaW50bzxVPihjaG9pY2U6IHsgaWZTb21lOiAodmFsdWU6IFQpID0-IFU7IGlmTm9uZTogKCkgPT4gVSB9KTogVTtcblxuICByZXNvbHZlKGlmTm9uZTogKCkgPT4gVCk6IFQge1xuICAgIHJldHVybiB0aGlzLmludG8oe1xuICAgICAgaWZTb21lOiAodmFsdWUpID0-IHZhbHVlLFxuICAgICAgaWZOb25lLFxuICAgIH0pO1xuICB9XG5cbiAgZG8oe1xuICAgIGlmU29tZSxcbiAgICBpZk5vbmUsXG4gIH06IHtcbiAgICBpZlNvbWU6ICh2YWx1ZTogVCkgPT4gdm9pZDtcbiAgICBpZk5vbmU6ICgpID0-IHZvaWQ7XG4gIH0pOiBNYXliZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMuY2hhaW4oe1xuICAgICAgaWZTb21lOiAodmFsdWUpID0-IHtcbiAgICAgICAgaWZTb21lKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIE1heWJlLnNvbWUodmFsdWUpO1xuICAgICAgfSxcbiAgICAgIGlmTm9uZTogKCkgPT4ge1xuICAgICAgICBpZk5vbmUoKTtcbiAgICAgICAgcmV0dXJuIE1heWJlLm5vbmUoKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBpZk9rKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogTWF5YmU8VD4ge1xuICAgIHJldHVybiB0aGlzLmRvKHsgaWZTb21lOiBjYWxsYmFjaywgaWZOb25lOiAoKSA9PiB7fSB9KTtcbiAgfVxuXG4gIG1hcDxVIGV4dGVuZHMgb2JqZWN0PihpZlNvbWU6ICh2YWx1ZTogVCkgPT4gVSB8IE1heWJlPFU-KTogTWF5YmU8VT4ge1xuICAgIHJldHVybiB0aGlzLmNoYWluKHtcbiAgICAgIGlmU29tZTogKHZhbHVlKSA9PiBNYXliZS5saWZ0KGlmU29tZSh2YWx1ZSkpLFxuICAgICAgaWZOb25lOiAoKSA9PiBNYXliZS5ub25lKCksXG4gICAgfSk7XG4gIH1cblxuICBtYXBOb25lPFU-KGlmTm9uZTogKCkgPT4gVSB8IE1heWJlPFU-KTogTWF5YmU8VCB8IFU-IHtcbiAgICByZXR1cm4gdGhpcy5jaGFpbjxUIHwgVT4oe1xuICAgICAgaWZTb21lOiAodmFsdWUpID0-IE1heWJlLnNvbWUodmFsdWUpLFxuICAgICAgaWZOb25lOiAoKSA9PiBNYXliZS5saWZ0KGlmTm9uZSgpKSxcbiAgICB9KTtcbiAgfVxufVxuXG5jbGFzcyBTb21lPFQ-IGV4dGVuZHMgTWF5YmU8VD4ge1xuICAjdmFsdWU6IFQ7XG5cbiAgY29uc3RydWN0b3IodmFsdWU6IFQpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuI3ZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBpbnRvPFU-KHsgaWZTb21lIH06IHsgaWZTb21lOiAodmFsdWU6IFQpID0-IFU7IGlmTm9uZTogKCkgPT4gVSB9KTogVSB7XG4gICAgcmV0dXJuIGlmU29tZSh0aGlzLiN2YWx1ZSk7XG4gIH1cblxuICBjaGFpbjxVPih7XG4gICAgaWZTb21lLFxuICB9OiB7XG4gICAgaWZTb21lOiAodmFsdWU6IFQpID0-IE1heWJlPFU-O1xuICAgIGlmTm9uZTogKCkgPT4gTWF5YmU8VT47XG4gIH0pOiBNYXliZTxVPiB7XG4gICAgcmV0dXJuIGlmU29tZSh0aGlzLiN2YWx1ZSk7XG4gIH1cbn1cblxuY2xhc3MgTm9uZTxUPiBleHRlbmRzIE1heWJlPFQ-IHtcbiAgY2hhaW48VT4oe1xuICAgIGlmTm9uZSxcbiAgfToge1xuICAgIGlmU29tZTogKHZhbHVlOiBUKSA9PiBNYXliZTxVPjtcbiAgICBpZk5vbmU6ICgpID0-IE1heWJlPFU-O1xuICB9KTogTWF5YmU8VT4ge1xuICAgIHJldHVybiBpZk5vbmUoKTtcbiAgfVxuXG4gIGludG88VT4oeyBpZk5vbmUgfTogeyBpZlNvbWU6ICh2YWx1ZTogVCkgPT4gVTsgaWZOb25lOiAoKSA9PiBVIH0pOiBVIHtcbiAgICByZXR1cm4gaWZOb25lKCk7XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlc3VsdDxUIGV4dGVuZHMgb2JqZWN0PiB7XG4gIHN0YXRpYyBpcyh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFJlc3VsdDxvYmplY3Q-IHtcbiAgICByZXR1cm4gKFxuICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlIGluc3RhbmNlb2YgUmVzdWx0XG4gICAgKTtcbiAgfVxuXG4gIHN0YXRpYyBvazxUIGV4dGVuZHMgb2JqZWN0Pih2YWx1ZTogVCk6IE9rPFQ-IHtcbiAgICByZXR1cm4gbmV3IE9rKHZhbHVlKTtcbiAgfVxuXG4gIHN0YXRpYyBlcnI8VCBleHRlbmRzIG9iamVjdD4ocmVhc29uOiB1bmtub3duKTogRXJyPFQ-IHtcbiAgICBpZiAocmVhc29uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGRlYnVnZ2VyO1xuICAgIH1cblxuICAgIGlmIChyZWFzb24gaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgcmV0dXJuIG5ldyBFcnIoXG4gICAgICAgIHJlYXNvbi5zdGFjayB8fFxuICAgICAgICAgIHJlYXNvbi5tZXNzYWdlIHx8XG4gICAgICAgICAgYEFuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQgKGNsYXNzOiAke3JlYXNvbi5jb25zdHJ1Y3Rvci5uYW1lfSlgXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlYXNvbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgcmV0dXJuIG5ldyBFcnIocmVhc29uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihcIkFuIHVueHBlY3RlZCBlcnJvciBvY2N1cnJlZFwiLCByZWFzb24pO1xuICAgICAgcmV0dXJuIG5ldyBFcnIoYEFuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQgKCR7U3RyaW5nKHJlYXNvbil9KWApO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBsaWZ0PFQgZXh0ZW5kcyBvYmplY3Q-KHZhbHVlOiBJbnRvUmVzdWx0PFQ-KTogUmVzdWx0PFQ-IHtcbiAgICBpZiAoUmVzdWx0LmlzKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gUmVzdWx0Lm9rKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFJlc3VsdC5lcnIodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIGFic3RyYWN0IHJlYWRvbmx5IHN0YXR1czogXCJva1wiIHwgXCJlcnJcIjtcblxuICBhYnN0cmFjdCBjaGFpbjxVIGV4dGVuZHMgb2JqZWN0PihjaG9pY2U6IHtcbiAgICBpZk9rOiAodmFsdWU6IFQpID0-IFJlc3VsdDxVPjtcbiAgICBpZkVycjogKHJlYXNvbjogc3RyaW5nKSA9PiBSZXN1bHQ8VT47XG4gIH0pOiBSZXN1bHQ8VT47XG5cbiAgZG8oe1xuICAgIGlmT2ssXG4gICAgaWZFcnIsXG4gIH06IHtcbiAgICBpZk9rOiAodmFsdWU6IFQpID0-IHZvaWQ7XG4gICAgaWZFcnI6IChyZWFzb246IHN0cmluZykgPT4gdm9pZDtcbiAgfSk6IFJlc3VsdDxUPiB7XG4gICAgcmV0dXJuIHRoaXMuY2hhaW4oe1xuICAgICAgaWZPazogKHZhbHVlKSA9PiB7XG4gICAgICAgIGlmT2sodmFsdWUpO1xuICAgICAgICByZXR1cm4gUmVzdWx0Lm9rKHZhbHVlKTtcbiAgICAgIH0sXG4gICAgICBpZkVycjogKHJlYXNvbikgPT4ge1xuICAgICAgICBpZkVycihyZWFzb24pO1xuICAgICAgICByZXR1cm4gUmVzdWx0LmVycihyZWFzb24pO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGlmT2soY2FsbGJhY2s6ICgpID0-IHZvaWQpOiBSZXN1bHQ8VD4ge1xuICAgIHJldHVybiB0aGlzLmRvKHsgaWZPazogY2FsbGJhY2ssIGlmRXJyOiAoKSA9PiB7fSB9KTtcbiAgfVxuXG4gIG1hcDxVIGV4dGVuZHMgb2JqZWN0PihpZk9rOiAodmFsdWU6IFQpID0-IFUgfCBSZXN1bHQ8VT4pOiBSZXN1bHQ8VT4ge1xuICAgIHJldHVybiB0aGlzLmNoYWluKHtcbiAgICAgIGlmT2s6ICh2YWx1ZSkgPT4gUmVzdWx0LmxpZnQoaWZPayh2YWx1ZSkpLFxuICAgICAgaWZFcnI6IChyZWFzb24pID0-IFJlc3VsdC5lcnIocmVhc29uKSxcbiAgICB9KTtcbiAgfVxuXG4gIG1hcEVycjxVIGV4dGVuZHMgb2JqZWN0PihcbiAgICBpZkVycjogKHJlYXNvbjogc3RyaW5nKSA9PiBJbnRvUmVzdWx0PFU-XG4gICk6IFJlc3VsdDxUIHwgVT4ge1xuICAgIHJldHVybiB0aGlzLmNoYWluPFQgfCBVPih7XG4gICAgICBpZk9rOiAodmFsdWUpID0-IFJlc3VsdC5vayh2YWx1ZSksXG4gICAgICBpZkVycjogKHJlYXNvbikgPT4gUmVzdWx0LmxpZnQoaWZFcnIocmVhc29uKSksXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9rPFQgZXh0ZW5kcyBvYmplY3Q-IGV4dGVuZHMgUmVzdWx0PFQ-IHtcbiAgcmVhZG9ubHkgc3RhdHVzID0gXCJva1wiO1xuXG4gICN2YWx1ZTogVDtcblxuICBjb25zdHJ1Y3Rvcih2YWx1ZTogVCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy4jdmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIGNoYWluPFUgZXh0ZW5kcyBvYmplY3Q-KHtcbiAgICBpZk9rLFxuICB9OiB7XG4gICAgaWZPazogKHZhbHVlOiBUKSA9PiBSZXN1bHQ8VT47XG4gICAgaWZFcnI6IChyZWFzb246IHN0cmluZykgPT4gUmVzdWx0PFU-O1xuICB9KTogUmVzdWx0PFU-IHtcbiAgICByZXR1cm4gaWZPayh0aGlzLiN2YWx1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVycjxUIGV4dGVuZHMgb2JqZWN0PiBleHRlbmRzIFJlc3VsdDxUPiB7XG4gIHJlYWRvbmx5IHN0YXR1cyA9IFwiZXJyXCI7XG5cbiAgI3JlYXNvbjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJlYXNvbjogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLiNyZWFzb24gPSByZWFzb247XG4gIH1cblxuICBjaGFpbjxVIGV4dGVuZHMgb2JqZWN0Pih7XG4gICAgaWZFcnIsXG4gIH06IHtcbiAgICBpZk9rOiAodmFsdWU6IFQpID0-IFJlc3VsdDxVPjtcbiAgICBpZkVycjogKHJlYXNvbjogc3RyaW5nKSA9PiBSZXN1bHQ8VT47XG4gIH0pOiBSZXN1bHQ8VT4ge1xuICAgIHJldHVybiBpZkVycih0aGlzLiNyZWFzb24pO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7YUFFQSxLQUFBO1dBQ0EsRUFBQSxDQUFBLEtBQUE7c0JBRUEsS0FBQSxNQUFBLE1BQUEsS0FBQSxLQUFBLEtBQUEsSUFBQSxJQUFBLEtBQUEsWUFBQSxLQUFBOztXQUlBLElBQUEsQ0FBQSxLQUFBO21CQUNBLElBQUEsQ0FBQSxLQUFBOztXQUdBLElBQUE7bUJBQ0EsSUFBQTs7V0FHQSxJQUFBLENBQUEsS0FBQTtZQUNBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQTttQkFDQSxLQUFBO21CQUNBLEtBQUEsS0FBQSxJQUFBLElBQUEsS0FBQSxLQUFBLFNBQUE7bUJBQ0EsS0FBQSxDQUFBLElBQUE7O21CQUVBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTs7O0FBV0EsV0FBQSxDQUFBLE1BQUE7b0JBQ0EsSUFBQTtBQUNBLGtCQUFBLEdBQUEsS0FBQSxHQUFBLEtBQUE7O0FBQ0Esa0JBQUE7OztBQUlBLE1BQUEsR0FDQSxNQUFBLEdBQ0EsTUFBQTtvQkFLQSxLQUFBO0FBQ0Esa0JBQUEsR0FBQSxLQUFBO0FBQ0Esc0JBQUEsQ0FBQSxLQUFBO3VCQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTs7QUFFQSxrQkFBQTtBQUNBLHNCQUFBO3VCQUNBLEtBQUEsQ0FBQSxJQUFBOzs7O0FBS0EsUUFBQSxDQUFBLFFBQUE7b0JBQ0EsRUFBQTtBQUFBLGtCQUFBLEVBQUEsUUFBQTtBQUFBLGtCQUFBOzs7O0FBR0EsT0FBQSxDQUFBLE1BQUE7b0JBQ0EsS0FBQTtBQUNBLGtCQUFBLEdBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUE7O0FBQ0Esa0JBQUEsTUFBQSxLQUFBLENBQUEsSUFBQTs7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