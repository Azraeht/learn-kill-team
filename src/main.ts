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
import { renderScenarios } from "./screens/scenarios.ts";
import { renderScenarioPlay } from "./screens/scenarioPlay.ts";
import { renderReference } from "./screens/reference.ts";
import { renderSettings } from "./screens/settings.ts";
import { renderMatchTracker } from "./screens/matchTracker.ts";
import { registerServiceWorker } from "./registerServiceWorker.ts";

registerServiceWorker();

const app = document.getElementById("app");
if (!app) throw new Error("Missing #app root element");

app.innerHTML = `
  <header class="app-header" data-title-home style="cursor:pointer">
    <span class="app-header__prompt" aria-hidden="true">&gt;</span>
    <h1>KILL TEAM TRAINER<span class="app-header__cursor" aria-hidden="true"></span></h1>
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
    case "scenarios":
      renderScenarios(main!);
      break;
    case "scenario":
      renderScenarioPlay(main!, route.scenarioId);
      break;
    case "reference":
      renderReference(main!);
      break;
    case "settings":
      renderSettings(main!);
      break;
    case "tracker":
      renderMatchTracker(main!);
      break;
    case "home":
    default:
      renderHome(main!);
      break;
  }

  // Screens replace the whole view, so send focus back to the top for screen
  // readers and reset the scroll position the way a page navigation would.
  main!.scrollTo?.(0, 0);
  window.scrollTo(0, 0);
}

onRouteChange(render);
