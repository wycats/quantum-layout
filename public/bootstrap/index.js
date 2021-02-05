import { Result } from "./result.js";
import { boot as bootWASM } from "./wasm.js";
export async function boot() {
    let wasm = await bootWASM();
    return {
        transform: transform(wasm)
    };
}
/** The defaults correspond to Stage 3 */ const DEFAULT_OPTIONS = {
    isModule: true
};
const DEFAULT_PARSER_OPTIONS = {
    typescript: {
        syntax: "typescript",
        tsx: false,
        decorators: false,
        dynamicImport: true
    },
    ecmascript: {
        syntax: "ecmascript",
        jsx: false,
        numericSeparator: true,
        classPrivateProperty: true,
        privateMethod: true,
        classProperty: true,
        functionBind: false,
        decorators: false,
        decoratorsBeforeExport: false,
        dynamicImport: true,
        nullishCoalescing: true,
        exportDefaultFrom: true,
        exportNamespaceFrom: true,
        importMeta: true
    }
};
const DEFAULT_JSC_OPTIONS = {
    target: "es2020"
};
// TODO: this is necessary because transformSync otherwise crashes the browser (O_O). Get that
// fixed.
function smokeParse(imports, source) {
    try {
        imports.parse(source, {
            syntax: "typescript",
            tsx: true,
            decorators: true,
            dynamicImport: true
        });
        return Result.ok({
        });
    } catch (e) {
        return Result.err(e);
    }
}
const transform = (imports)=>(source, options)=>{
        return smokeParse(imports, source).map(()=>{
            let builtParserOptions;
            let passedParserOptions = options?.jsc?.parser;
            if (passedParserOptions) {
                builtParserOptions = {
                    ...DEFAULT_PARSER_OPTIONS[passedParserOptions.syntax],
                    ...passedParserOptions
                };
            } else {
                builtParserOptions = DEFAULT_PARSER_OPTIONS.typescript;
            }
            let builtJscOptions = {
                ...DEFAULT_JSC_OPTIONS,
                ...options?.jsc,
                parser: builtParserOptions
            };
            let builtOptions = {
                ...DEFAULT_OPTIONS,
                ...options,
                jsc: builtJscOptions
            };
            return imports.transform(source, builtOptions);
        });
    }
;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBpbXBvcnQgeyBwYXJzZVN5bmMsIHRyYW5zZm9ybVN5bmMsIHVud3JhcEVyciB9IGZyb20gXCIuL3dhc20uanNcIjtcblxuaW1wb3J0IHR5cGUgKiBhcyBzd2MgZnJvbSBcIkBzd2MvY29yZVwiO1xuaW1wb3J0IHsgUmVzdWx0IH0gZnJvbSBcIi4vcmVzdWx0LmpzXCI7XG5pbXBvcnQgeyBib290IGFzIGJvb3RXQVNNLCBQdWJsaWNFeHBvcnRzIH0gZnJvbSBcIi4vd2FzbS5qc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN1Z2FyeUV4cG9ydHMge1xuICB0cmFuc2Zvcm06IChzb3VyY2U6IHN0cmluZywgb3B0cz86IHN3Yy5PcHRpb25zKSA9PiBSZXN1bHQ8c3djLk91dHB1dD47XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBib290KCk6IFByb21pc2U8U3VnYXJ5RXhwb3J0cz4ge1xuICBsZXQgd2FzbSA9IGF3YWl0IGJvb3RXQVNNKCk7XG4gIHJldHVybiB7IHRyYW5zZm9ybTogdHJhbnNmb3JtKHdhc20pIH07XG59XG5cbi8qKiBUaGUgZGVmYXVsdHMgY29ycmVzcG9uZCB0byBTdGFnZSAzICovXG5cbmNvbnN0IERFRkFVTFRfT1BUSU9OUzogc3djLk9wdGlvbnMgPSB7XG4gIGlzTW9kdWxlOiB0cnVlLFxufTtcblxuY29uc3QgREVGQVVMVF9QQVJTRVJfT1BUSU9OUyA9IHtcbiAgdHlwZXNjcmlwdDoge1xuICAgIHN5bnRheDogXCJ0eXBlc2NyaXB0XCIsXG4gICAgdHN4OiBmYWxzZSxcbiAgICBkZWNvcmF0b3JzOiBmYWxzZSxcbiAgICBkeW5hbWljSW1wb3J0OiB0cnVlLFxuICB9LFxuICBlY21hc2NyaXB0OiB7XG4gICAgc3ludGF4OiBcImVjbWFzY3JpcHRcIixcbiAgICBqc3g6IGZhbHNlLFxuICAgIG51bWVyaWNTZXBhcmF0b3I6IHRydWUsXG4gICAgY2xhc3NQcml2YXRlUHJvcGVydHk6IHRydWUsXG4gICAgcHJpdmF0ZU1ldGhvZDogdHJ1ZSxcbiAgICBjbGFzc1Byb3BlcnR5OiB0cnVlLFxuICAgIGZ1bmN0aW9uQmluZDogZmFsc2UsXG4gICAgZGVjb3JhdG9yczogZmFsc2UsXG4gICAgZGVjb3JhdG9yc0JlZm9yZUV4cG9ydDogZmFsc2UsXG4gICAgZHluYW1pY0ltcG9ydDogdHJ1ZSxcbiAgICBudWxsaXNoQ29hbGVzY2luZzogdHJ1ZSxcbiAgICBleHBvcnREZWZhdWx0RnJvbTogdHJ1ZSxcbiAgICBleHBvcnROYW1lc3BhY2VGcm9tOiB0cnVlLFxuICAgIGltcG9ydE1ldGE6IHRydWUsXG4gIH0sXG59IGFzIGNvbnN0O1xuXG5jb25zdCBERUZBVUxUX0pTQ19PUFRJT05TOiBzd2MuSnNjQ29uZmlnID0ge1xuICB0YXJnZXQ6IFwiZXMyMDIwXCIgYXMgc3djLkpzY1RhcmdldCxcbn0gYXMgY29uc3Q7XG5cbi8vIFRPRE86IHRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdHJhbnNmb3JtU3luYyBvdGhlcndpc2UgY3Jhc2hlcyB0aGUgYnJvd3NlciAoT19PKS4gR2V0IHRoYXRcbi8vIGZpeGVkLlxuZnVuY3Rpb24gc21va2VQYXJzZShpbXBvcnRzOiBQdWJsaWNFeHBvcnRzLCBzb3VyY2U6IHN0cmluZyk6IFJlc3VsdDx7fT4ge1xuICB0cnkge1xuICAgIGltcG9ydHMucGFyc2Uoc291cmNlLCB7XG4gICAgICBzeW50YXg6IFwidHlwZXNjcmlwdFwiLFxuICAgICAgdHN4OiB0cnVlLFxuICAgICAgZGVjb3JhdG9yczogdHJ1ZSxcbiAgICAgIGR5bmFtaWNJbXBvcnQ6IHRydWUsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gUmVzdWx0Lm9rKHt9KTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIHJldHVybiBSZXN1bHQuZXJyKGUpO1xuICB9XG59XG5cbmNvbnN0IHRyYW5zZm9ybSA9IChpbXBvcnRzOiBQdWJsaWNFeHBvcnRzKSA9PiAoXG4gIHNvdXJjZTogc3RyaW5nLFxuICBvcHRpb25zPzogc3djLk9wdGlvbnNcbik6IFJlc3VsdDxzd2MuT3V0cHV0PiA9PiB7XG4gIHJldHVybiBzbW9rZVBhcnNlKGltcG9ydHMsIHNvdXJjZSkubWFwKCgpID0-IHtcbiAgICBsZXQgYnVpbHRQYXJzZXJPcHRpb25zOiBzd2MuVHNQYXJzZXJDb25maWcgfCBzd2MuRXNQYXJzZXJDb25maWc7XG5cbiAgICBsZXQgcGFzc2VkUGFyc2VyT3B0aW9ucyA9IG9wdGlvbnM_LmpzYz8ucGFyc2VyO1xuICAgIGlmIChwYXNzZWRQYXJzZXJPcHRpb25zKSB7XG4gICAgICBidWlsdFBhcnNlck9wdGlvbnMgPSB7XG4gICAgICAgIC4uLkRFRkFVTFRfUEFSU0VSX09QVElPTlNbcGFzc2VkUGFyc2VyT3B0aW9ucy5zeW50YXhdLFxuICAgICAgICAuLi5wYXNzZWRQYXJzZXJPcHRpb25zLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVpbHRQYXJzZXJPcHRpb25zID0gREVGQVVMVF9QQVJTRVJfT1BUSU9OUy50eXBlc2NyaXB0O1xuICAgIH1cblxuICAgIGxldCBidWlsdEpzY09wdGlvbnM6IHN3Yy5Kc2NDb25maWcgPSB7XG4gICAgICAuLi5ERUZBVUxUX0pTQ19PUFRJT05TLFxuICAgICAgLi4ub3B0aW9ucz8uanNjLFxuICAgICAgcGFyc2VyOiBidWlsdFBhcnNlck9wdGlvbnMsXG4gICAgfTtcblxuICAgIGxldCBidWlsdE9wdGlvbnM6IHN3Yy5PcHRpb25zID0ge1xuICAgICAgLi4uREVGQVVMVF9PUFRJT05TLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIGpzYzogYnVpbHRKc2NPcHRpb25zLFxuICAgIH0gYXMgY29uc3Q7XG5cbiAgICByZXR1cm4gaW1wb3J0cy50cmFuc2Zvcm0oc291cmNlLCBidWlsdE9wdGlvbnMpO1xuICB9KTtcbn07XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IlNBR0EsTUFBQSxTQUFBLFdBQUE7U0FDQSxJQUFBLElBQUEsUUFBQSxTQUFBLFNBQUE7c0JBTUEsSUFBQTtRQUNBLElBQUEsU0FBQSxRQUFBOztBQUNBLGlCQUFBLEVBQUEsU0FBQSxDQUFBLElBQUE7OztBQUdBLEVBQUEscUNBQUEsRUFBQSxPQUVBLGVBQUE7QUFDQSxZQUFBLEVBQUEsSUFBQTs7TUFHQSxzQkFBQTtBQUNBLGNBQUE7QUFDQSxjQUFBLEdBQUEsVUFBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0FBQ0Esa0JBQUEsRUFBQSxLQUFBO0FBQ0EscUJBQUEsRUFBQSxJQUFBOztBQUVBLGNBQUE7QUFDQSxjQUFBLEdBQUEsVUFBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0FBQ0Esd0JBQUEsRUFBQSxJQUFBO0FBQ0EsNEJBQUEsRUFBQSxJQUFBO0FBQ0EscUJBQUEsRUFBQSxJQUFBO0FBQ0EscUJBQUEsRUFBQSxJQUFBO0FBQ0Esb0JBQUEsRUFBQSxLQUFBO0FBQ0Esa0JBQUEsRUFBQSxLQUFBO0FBQ0EsOEJBQUEsRUFBQSxLQUFBO0FBQ0EscUJBQUEsRUFBQSxJQUFBO0FBQ0EseUJBQUEsRUFBQSxJQUFBO0FBQ0EseUJBQUEsRUFBQSxJQUFBO0FBQ0EsMkJBQUEsRUFBQSxJQUFBO0FBQ0Esa0JBQUEsRUFBQSxJQUFBOzs7TUFJQSxtQkFBQTtBQUNBLFVBQUEsR0FBQSxNQUFBOztBQUdBLEVBQUEsNEZBQUE7QUFDQSxFQUFBLE9BQUE7U0FDQSxVQUFBLENBQUEsT0FBQSxFQUFBLE1BQUE7O0FBRUEsZUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBO0FBQ0Esa0JBQUEsR0FBQSxVQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7QUFDQSxzQkFBQSxFQUFBLElBQUE7QUFDQSx5QkFBQSxFQUFBLElBQUE7O2VBR0EsTUFBQSxDQUFBLEVBQUE7O2FBQ0EsQ0FBQTtlQUNBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTs7O01BSUEsU0FBQSxJQUFBLE9BQUEsSUFDQSxNQUFBLEVBQ0EsT0FBQTtlQUVBLFVBQUEsQ0FBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUE7Z0JBQ0Esa0JBQUE7Z0JBRUEsbUJBQUEsR0FBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUE7Z0JBQ0EsbUJBQUE7QUFDQSxrQ0FBQTt1QkFDQSxzQkFBQSxDQUFBLG1CQUFBLENBQUEsTUFBQTt1QkFDQSxtQkFBQTs7O0FBR0Esa0NBQUEsR0FBQSxzQkFBQSxDQUFBLFVBQUE7O2dCQUdBLGVBQUE7bUJBQ0EsbUJBQUE7bUJBQ0EsT0FBQSxFQUFBLEdBQUE7QUFDQSxzQkFBQSxFQUFBLGtCQUFBOztnQkFHQSxZQUFBO21CQUNBLGVBQUE7bUJBQ0EsT0FBQTtBQUNBLG1CQUFBLEVBQUEsZUFBQTs7bUJBR0EsT0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsWUFBQSJ9