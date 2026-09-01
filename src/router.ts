export type Route =
  | { name: "home" }
  | { name: "quiz"; categoryId: string }
  | { name: "results" }
  | { name: "progress" };

function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, "");
  const [segment, param] = path.split("/");

  switch (segment) {
    case "quiz":
      return { name: "quiz", categoryId: param || "all" };
    case "results":
      return { name: "results" };
    case "progress":
      return { name: "progress" };
    case "home":
    case "":
    default:
      return { name: "home" };
  }
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export function getCurrentRoute(): Route {
  return parseHash(window.location.hash);
}

export function onRouteChange(handler: (route: Route) => void): void {
  const emit = () => handler(getCurrentRoute());
  window.addEventListener("hashchange", emit);
  emit();
}
