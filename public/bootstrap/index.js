export async function boot() {
    let source = await fetch("/bootstrap/wasm.js");
    let body = await source.text();
    let bootWASM = new Function(`${body}\n\nreturn sugar`)();
    return bootWASM();
}

