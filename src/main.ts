import "./style/base.css";
import "./style/layout.css";
import "./style/cards.css";
import { onRouteChange, navigate, type Route } from "./router.ts";
import { renderHome } from "./screens/home.ts";
import { renderQuizSession } from "./screens/quizSession.ts";
import { renderResults } from "./screens/results.ts";
import { renderProgress } from "./screens/progress.ts";

const app = document.getElementById("app");
if (!app) throw new Error("Missing #app root element");

app.innerHTML = `
  <header class="app-header">
    <h1 data-title-home style="cursor:pointer">Kill Team Trainer</h1>
  </header>
  <main class="app-main" id="main"></main>
`;

app.querySelector("[data-title-home]")?.addEventListener("click", () => navigate("home"));

const main = document.getElementById("main");
if (!main) throw new Error("Missing #main container");

function render(route: Route): void {
  switch (route.name) {
    case "quiz":
      renderQuizSession(main!, route.categoryId);
      break;
    case "results":
      renderResults(main!);
      break;
    case "progress":
      renderProgress(main!);
      break;
    case "home":
    default:
      renderHome(main!);
      break;
  }
}

onRouteChange(render);
