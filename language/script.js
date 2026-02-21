// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
      .then(reg => console.log("ServiceWorker registered:", reg.scope))
      .catch(err => console.log("ServiceWorker registration failed:", err));
  });
}
