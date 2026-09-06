import "./style/base.css";
import "./style/layout.css";
import "./style/cards.css";
import { onRouteChange, navigate, type Route } from "./router.ts";
import { renderHome } from "./screens/home.ts";
import { renderQuizSession } from "./screens/quizSession.ts";
import { renderResults } from "./screens/results.ts";
import { renderProgress } from "./screens/progress.ts";
import { renderSequences } from "./screens/sequences.ts";
import { renderSequenceGame } from "./screens/sequenceGame.ts";
import { AQUILA_SVG } from "./ui/icons.ts";

const app = document.getElementById("app");
if (!app) throw new Error("Missing #app root element");

app.innerHTML = `
  <header class="app-header" data-title-home style="cursor:pointer">
    <span class="app-header__aquila">${AQUILA_SVG}</span>
    <h1>Kill Team Trainer</h1>
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
    case "sequences":
      renderSequences(main!);
      break;
    case "sequence":
      renderSequenceGame(main!, route.sequenceId);
      break;
    case "home":
    default:
      renderHome(main!);
      break;
  }
}

onRouteChange(render);
