if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./public/bootstrap/sw.js", {
        scope: "/public/"
    }).then((reg)=>{
        // registration worked
        console.log("Registration succeeded. Scope is " + reg.scope);
    }).catch((error)=>{
        // registration failed
        console.log("Registration failed with " + error);
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC9yZWdpc3Rlci1zdy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpZiAoXCJzZXJ2aWNlV29ya2VyXCIgaW4gbmF2aWdhdG9yKSB7XG4gIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyXG4gICAgLnJlZ2lzdGVyKFwiLi9wdWJsaWMvYm9vdHN0cmFwL3N3LmpzXCIsIHsgc2NvcGU6IFwiL3B1YmxpYy9cIiB9KVxuICAgIC50aGVuKChyZWcpID0-IHtcbiAgICAgIC8vIHJlZ2lzdHJhdGlvbiB3b3JrZWRcbiAgICAgIGNvbnNvbGUubG9nKFwiUmVnaXN0cmF0aW9uIHN1Y2NlZWRlZC4gU2NvcGUgaXMgXCIgKyByZWcuc2NvcGUpO1xuICAgIH0pXG4gICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgLy8gcmVnaXN0cmF0aW9uIGZhaWxlZFxuICAgICAgY29uc29sZS5sb2coXCJSZWdpc3RyYXRpb24gZmFpbGVkIHdpdGggXCIgKyBlcnJvcik7XG4gICAgfSk7XG59XG5cbmV4cG9ydCB7fTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiS0FBQSxhQUFBLEtBQUEsU0FBQTtBQUNBLGFBQUEsQ0FBQSxhQUFBLENBQ0EsUUFBQSxFQUFBLHdCQUFBO0FBQUEsYUFBQSxHQUFBLFFBQUE7T0FDQSxJQUFBLEVBQUEsR0FBQTtBQUNBLFVBQUEsb0JBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxFQUFBLGlDQUFBLElBQUEsR0FBQSxDQUFBLEtBQUE7T0FFQSxLQUFBLEVBQUEsS0FBQTtBQUNBLFVBQUEsb0JBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxFQUFBLHlCQUFBLElBQUEsS0FBQSJ9