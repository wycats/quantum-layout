import { Environment } from "./env.js";
const CATEGORIES = [
    "state:pending",
    "state:active",
    "state:done",
    "state:error",
    "state:reload",
    "state:transition", 
];
const ENV = Environment.default("🧙").enable("*").icon("page", "📃").icon("state:pending", "⌛").icon("state:update", "👀").icon("state:active", "✅").icon("state:done", "🏁").icon("state:error", "⛔").icon("state:reload", "🔄").icon("state:transition", "⌛");
async function registerSW() {
    if ("serviceWorker" in navigator) {
        let sw = navigator.serviceWorker;
        try {
            let reg = await sw.register("/sw.js", {
                scope: "/"
            });
            ENV.trace("page", "registration", reg.scope);
            reg = await sw.ready;
            ENV.trace("page", "ready", reg.scope);
            if (sw.controller) {
                var url = sw.controller.scriptURL;
                // console.log('serviceWorker.controller', url);
                ENV.trace("state:active", {
                    controller: true,
                    url
                });
                return sw.controller;
            } else {
                ENV.trace("state:active", "reloading", {
                    controller: false
                });
                location.reload();
                // never resolve, waiting for reload to take effect
                return new Promise(()=>{
                });
            }
        } catch (e) {
            ENV.trace(true, "state:error", `SW Registration failed with ${e}`);
            return Promise.reject(e);
        }
    } else {
        return Promise.reject();
    }
}
function waitForController(sw) {
    if (sw.state === "activated" && navigator.serviceWorker.controller === null) {
        location.reload(); // this is really `=> never`
        return Promise.reject();
    } else {
        return sw;
    }
}
function wait(sw) {
    return new Promise((fulfill)=>{
        sw.addEventListener("statechange", (e)=>{
            if (sw.state === "activated") {
                ENV.trace("state:active", "state -> activated");
                fulfill(sw);
            } else {
                ENV.trace("state:transition", "state ->", sw.state);
            }
        });
    });
}
function navigate() {
    location.href = "/index.html";
}
export const SW = registerSW();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC1zcmMvYm9vdHN0cmFwL3JlZ2lzdGVyLXN3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudmlyb25tZW50IH0gZnJvbSBcIi4vZW52LmpzXCI7XG5cbmNvbnN0IENBVEVHT1JJRVMgPSBbXG4gIFwic3RhdGU6cGVuZGluZ1wiLFxuICBcInN0YXRlOmFjdGl2ZVwiLFxuICBcInN0YXRlOmRvbmVcIixcbiAgXCJzdGF0ZTplcnJvclwiLFxuICBcInN0YXRlOnJlbG9hZFwiLFxuICBcInN0YXRlOnRyYW5zaXRpb25cIixcbl07XG50eXBlIENhdGVnb3J5ID0gdHlwZW9mIENBVEVHT1JJRVNbbnVtYmVyXTtcblxuY29uc3QgRU5WID0gRW52aXJvbm1lbnQuZGVmYXVsdDxDYXRlZ29yeT4oXCLwn6eZXCIpXG4gIC5lbmFibGUoXCIqXCIpXG4gIC5pY29uKFwicGFnZVwiLCBcIvCfk4NcIilcbiAgLmljb24oXCJzdGF0ZTpwZW5kaW5nXCIsIFwi4oybXCIpXG4gIC5pY29uKFwic3RhdGU6dXBkYXRlXCIsIFwi8J-RgFwiKVxuICAuaWNvbihcInN0YXRlOmFjdGl2ZVwiLCBcIuKchVwiKVxuICAuaWNvbihcInN0YXRlOmRvbmVcIiwgXCLwn4-BXCIpXG4gIC5pY29uKFwic3RhdGU6ZXJyb3JcIiwgXCLim5RcIilcbiAgLmljb24oXCJzdGF0ZTpyZWxvYWRcIiwgXCLwn5SEXCIpXG4gIC5pY29uKFwic3RhdGU6dHJhbnNpdGlvblwiLCBcIuKMm1wiKTtcblxuYXN5bmMgZnVuY3Rpb24gcmVnaXN0ZXJTVygpOiBQcm9taXNlPFNlcnZpY2VXb3JrZXI-IHtcbiAgaWYgKFwic2VydmljZVdvcmtlclwiIGluIG5hdmlnYXRvcikge1xuICAgIGxldCBzdyA9IG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyO1xuXG4gICAgdHJ5IHtcbiAgICAgIGxldCByZWcgPSBhd2FpdCBzdy5yZWdpc3RlcihcIi9zdy5qc1wiLCB7XG4gICAgICAgIHNjb3BlOiBcIi9cIixcbiAgICAgIH0pO1xuXG4gICAgICBFTlYudHJhY2UoXCJwYWdlXCIsIFwicmVnaXN0cmF0aW9uXCIsIHJlZy5zY29wZSk7XG5cbiAgICAgIHJlZyA9IGF3YWl0IHN3LnJlYWR5O1xuXG4gICAgICBFTlYudHJhY2UoXCJwYWdlXCIsIFwicmVhZHlcIiwgcmVnLnNjb3BlKTtcblxuICAgICAgaWYgKHN3LmNvbnRyb2xsZXIpIHtcbiAgICAgICAgdmFyIHVybCA9IHN3LmNvbnRyb2xsZXIuc2NyaXB0VVJMO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnc2VydmljZVdvcmtlci5jb250cm9sbGVyJywgdXJsKTtcbiAgICAgICAgRU5WLnRyYWNlKFwic3RhdGU6YWN0aXZlXCIsIHsgY29udHJvbGxlcjogdHJ1ZSwgdXJsIH0pO1xuICAgICAgICByZXR1cm4gc3cuY29udHJvbGxlcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIEVOVi50cmFjZShcInN0YXRlOmFjdGl2ZVwiLCBcInJlbG9hZGluZ1wiLCB7IGNvbnRyb2xsZXI6IGZhbHNlIH0pO1xuICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcblxuICAgICAgICAvLyBuZXZlciByZXNvbHZlLCB3YWl0aW5nIGZvciByZWxvYWQgdG8gdGFrZSBlZmZlY3RcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0-IHt9KTtcbiAgICAgICAgLy8gRU5WLnRyYWNlKFwic3RhdGU6YWN0aXZlXCIsIFwiYXdhaXRpbmcgY29udHJvbGxlclwiKTtcblxuICAgICAgICAvLyByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKGZ1bGZpbGwpID0-IHtcbiAgICAgICAgLy8gICBzdy5hZGRFdmVudExpc3RlbmVyKFwiY29udHJvbGxlcmNoYW5nZVwiLCAoZSkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IGNvbnRyb2xsZXIgPSBlLnRhcmdldCBhcyBTZXJ2aWNlV29ya2VyO1xuICAgICAgICAvLyAgICAgRU5WLnRyYWNlKFxuICAgICAgICAvLyAgICAgICBcInN0YXRlOnRyYW5zaXRpb25cIixcbiAgICAgICAgLy8gICAgICAgXCJjb250cm9sbGVyY2hhbmdlXCIsXG4gICAgICAgIC8vICAgICAgIGNvbnRyb2xsZXIuc2NyaXB0VVJMXG4gICAgICAgIC8vICAgICApO1xuICAgICAgICAvLyAgICAgZnVsZmlsbChjb250cm9sbGVyKTtcbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgRU5WLnRyYWNlKHRydWUsIFwic3RhdGU6ZXJyb3JcIiwgYFNXIFJlZ2lzdHJhdGlvbiBmYWlsZWQgd2l0aCAke2V9YCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7XG4gICAgfVxuXG4gICAgLy8gaWYgKHJlZy53YWl0aW5nKSB7XG4gICAgLy8gICBFTlYudHJhY2UodHJ1ZSwgXCJzdGF0ZTpwZW5kaW5nXCIsIFwid2FpdGluZ1wiLCB7IHdhaXRpbmc6IHJlZy53YWl0aW5nIH0pO1xuXG4gICAgLy8gICBhd2FpdCB3YWl0KHJlZy53YWl0aW5nKTtcbiAgICAvLyB9XG5cbiAgICAvLyBpZiAocmVnLmluc3RhbGxpbmcpIHtcbiAgICAvLyAgIEVOVi50cmFjZSh0cnVlLCBcInN0YXRlOnBlbmRpbmdcIiwgXCJpbnN0YWxsaW5nXCIsIHtcbiAgICAvLyAgICAgaW5zdGFsbGluZzogcmVnLmluc3RhbGxpbmcsXG4gICAgLy8gICB9KTtcblxuICAgIC8vICAgYXdhaXQgd2FpdChyZWcuaW5zdGFsbGluZyk7XG4gICAgLy8gfVxuXG4gICAgLy8gaWYgKHJlZy5hY3RpdmUpIHtcbiAgICAvLyAgIGxldCBhY3RpdmVJc0NvbnRyb2xsZXIgPVxuICAgIC8vICAgICByZWcuYWN0aXZlID09PSBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5jb250cm9sbGVyO1xuXG4gICAgLy8gICBFTlYudHJhY2UodHJ1ZSwgXCJzdGF0ZTphY3RpdmVcIiwgYGFjdGl2ZWAsIHtcbiAgICAvLyAgICAgYWN0aXZlOiByZWcuYWN0aXZlLFxuICAgIC8vICAgICBjb250cm9sbGVyOiBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5jb250cm9sbGVyLFxuICAgIC8vICAgICBpc0NvbnRyb2xsZXI6IGFjdGl2ZUlzQ29udHJvbGxlcixcbiAgICAvLyAgIH0pO1xuXG4gICAgLy8gICBFTlYudHJhY2UodHJ1ZSwgXCJzdGF0ZTpmaW5pc2hlZFwiLCBcInNlcnZpY2Ugd29ya2VyIGZpbmlzaGVkIHJlc29sdmluZ1wiKTtcbiAgICAvLyAgIHJldHVybiB3YWl0Rm9yQ29udHJvbGxlcihyZWcuYWN0aXZlKTtcbiAgICAvLyB9IGVsc2Uge1xuICAgIC8vICAgdGhyb3cgbmV3IEVycm9yKFxuICAgIC8vICAgICBgdGhlcmUgaXMgdW5leHBlY3RlZGx5IG5vIGFjdGl2ZSBTVywgZXZlbiB0aG91Z2ggaW5zdGFsbGF0aW9uIGhhcyBmaW5pc2hlZGBcbiAgICAvLyAgICk7XG4gICAgLy8gfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHdhaXRGb3JDb250cm9sbGVyKHN3OiBTZXJ2aWNlV29ya2VyKSB7XG4gIGlmIChzdy5zdGF0ZSA9PT0gXCJhY3RpdmF0ZWRcIiAmJiBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5jb250cm9sbGVyID09PSBudWxsKSB7XG4gICAgbG9jYXRpb24ucmVsb2FkKCk7IC8vIHRoaXMgaXMgcmVhbGx5IGA9PiBuZXZlcmBcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3c7XG4gIH1cbn1cblxuZnVuY3Rpb24gd2FpdChzdzogU2VydmljZVdvcmtlcik6IFByb21pc2U8U2VydmljZVdvcmtlcj4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKGZ1bGZpbGwpID0-IHtcbiAgICBzdy5hZGRFdmVudExpc3RlbmVyKFwic3RhdGVjaGFuZ2VcIiwgKGUpID0-IHtcbiAgICAgIGlmIChzdy5zdGF0ZSA9PT0gXCJhY3RpdmF0ZWRcIikge1xuICAgICAgICBFTlYudHJhY2UoXCJzdGF0ZTphY3RpdmVcIiwgXCJzdGF0ZSAtPiBhY3RpdmF0ZWRcIik7XG5cbiAgICAgICAgZnVsZmlsbChzdyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBFTlYudHJhY2UoXCJzdGF0ZTp0cmFuc2l0aW9uXCIsIFwic3RhdGUgLT5cIiwgc3cuc3RhdGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gbmF2aWdhdGUoKSB7XG4gIGxvY2F0aW9uLmhyZWYgPSBcIi9pbmRleC5odG1sXCI7XG59XG5cbmV4cG9ydCBjb25zdCBTVyA9IHJlZ2lzdGVyU1coKTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiU0FBQSxXQUFBLFNBQUEsUUFBQTtNQUVBLFVBQUE7S0FDQSxhQUFBO0tBQ0EsWUFBQTtLQUNBLFVBQUE7S0FDQSxXQUFBO0tBQ0EsWUFBQTtLQUNBLGdCQUFBOztNQUlBLEdBQUEsR0FBQSxXQUFBLENBQUEsT0FBQSxFQUFBLElBQUcsR0FDQSxNQUFILEVBQUEsQ0FBQSxHQUNBLElBQUEsRUFBQSxJQUFBLElBQUEsSUFBRyxHQUNBLElBQUgsRUFBQSxhQUFBLElBQUEsR0FBRSxHQUNBLElBQUYsRUFBQSxZQUFBLElBQUEsSUFBRyxHQUNBLElBQUgsRUFBQSxZQUFBLElBQUEsR0FBRSxHQUNBLElBQUYsRUFBQSxVQUFBLElBQUEsSUFBRyxHQUNBLElBQUgsRUFBQSxXQUFBLElBQUEsR0FBRSxHQUNBLElBQUYsRUFBQSxZQUFBLElBQUEsSUFBRyxHQUNBLElBQUgsRUFBQSxnQkFBQSxJQUFBLEdBQUU7ZUFFRixVQUFBO1NBQ0EsYUFBQSxLQUFBLFNBQUE7WUFDQSxFQUFBLEdBQUEsU0FBQSxDQUFBLGFBQUE7O2dCQUdBLEdBQUEsU0FBQSxFQUFBLENBQUEsUUFBQSxFQUFBLE1BQUE7QUFDQSxxQkFBQSxHQUFBLENBQUE7O0FBR0EsZUFBQSxDQUFBLEtBQUEsRUFBQSxJQUFBLElBQUEsWUFBQSxHQUFBLEdBQUEsQ0FBQSxLQUFBO0FBRUEsZUFBQSxTQUFBLEVBQUEsQ0FBQSxLQUFBO0FBRUEsZUFBQSxDQUFBLEtBQUEsRUFBQSxJQUFBLElBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxLQUFBO2dCQUVBLEVBQUEsQ0FBQSxVQUFBO29CQUNBLEdBQUEsR0FBQSxFQUFBLENBQUEsVUFBQSxDQUFBLFNBQUE7QUFDQSxrQkFBQSw4Q0FBQTtBQUNBLG1CQUFBLENBQUEsS0FBQSxFQUFBLFlBQUE7QUFBQSw4QkFBQSxFQUFBLElBQUE7QUFBQSx1QkFBQTs7dUJBQ0EsRUFBQSxDQUFBLFVBQUE7O0FBRUEsbUJBQUEsQ0FBQSxLQUFBLEVBQUEsWUFBQSxJQUFBLFNBQUE7QUFBQSw4QkFBQSxFQUFBLEtBQUE7O0FBQ0Esd0JBQUEsQ0FBQSxNQUFBO0FBRUEsa0JBQUEsaURBQUE7MkJBQ0EsT0FBQTs7O2lCQWVBLENBQUE7QUFDQSxlQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsR0FBQSxXQUFBLElBQUEsNEJBQUEsRUFBQSxDQUFBO21CQUNBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTs7O2VBbUNBLE9BQUEsQ0FBQSxNQUFBOzs7U0FJQSxpQkFBQSxDQUFBLEVBQUE7UUFDQSxFQUFBLENBQUEsS0FBQSxNQUFBLFNBQUEsS0FBQSxTQUFBLENBQUEsYUFBQSxDQUFBLFVBQUEsS0FBQSxJQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBLDBCQUFBO2VBQ0EsT0FBQSxDQUFBLE1BQUE7O2VBRUEsRUFBQTs7O1NBSUEsSUFBQSxDQUFBLEVBQUE7ZUFDQSxPQUFBLEVBQUEsT0FBQTtBQUNBLFVBQUEsQ0FBQSxnQkFBQSxFQUFBLFdBQUEsSUFBQSxDQUFBO2dCQUNBLEVBQUEsQ0FBQSxLQUFBLE1BQUEsU0FBQTtBQUNBLG1CQUFBLENBQUEsS0FBQSxFQUFBLFlBQUEsSUFBQSxrQkFBQTtBQUVBLHVCQUFBLENBQUEsRUFBQTs7QUFFQSxtQkFBQSxDQUFBLEtBQUEsRUFBQSxnQkFBQSxJQUFBLFFBQUEsR0FBQSxFQUFBLENBQUEsS0FBQTs7Ozs7U0FNQSxRQUFBO0FBQ0EsWUFBQSxDQUFBLElBQUEsSUFBQSxXQUFBOzthQUdBLEVBQUEsR0FBQSxVQUFBIn0=