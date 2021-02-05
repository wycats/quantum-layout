if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./public/bootstrap/sw.js", { scope: "/public/" })
    .then((reg) => {
      // registration worked
      console.log("Registration succeeded. Scope is " + reg.scope);
    })
    .catch((error) => {
      // registration failed
      console.log("Registration failed with " + error);
    });
}

export {};
