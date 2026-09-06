/**
 * Registers the PWA service worker and reloads the page once a new version
 * takes control.
 *
 * The generated service worker calls skipWaiting()+clientsClaim() (via
 * `registerType: "autoUpdate"` in vite.config.ts), so after a deploy it
 * activates and starts serving new assets in the background almost
 * immediately — but a tab left open keeps running the *old* JS already in
 * memory until something reloads it. `controllerchange` fires exactly when
 * that handover happens, so that's our cue.
 *
 * We also poll for updates whenever the tab regains focus: browsers only
 * check for a new service worker on navigation (and throttle it to roughly
 * once every 24h otherwise), which is too slow for a tab someone left open
 * across a deploy.
 */
export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;

    navigator.serviceWorker.register(swUrl, { scope: import.meta.env.BASE_URL }).then((registration) => {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") registration.update();
      });
    });

    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
  });
}
