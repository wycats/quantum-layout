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

