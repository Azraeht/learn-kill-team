import { store } from "../core/store.ts";
import type { MatchTrackerPlayer, MatchTrackerState } from "../core/types.ts";
import { navigate } from "../router.ts";
import { escapeHtml } from "../ui/html.ts";

function playerPanelHtml(
  player: MatchTrackerPlayer,
  index: 0 | 1,
  hasInitiative: boolean,
): string {
  return `
    <section class="settings-section match-player${hasInitiative ? " match-player--initiative" : ""}">
      <input
        class="match-player__name"
        type="text"
        maxlength="24"
        value="${escapeHtml(player.name)}"
        data-player-name="${index}"
        aria-label="Nom du joueur ${index + 1}"
      />
      <button class="btn${hasInitiative ? " btn--primary" : ""} btn--block" data-set-initiative="${index}">
        ${hasInitiative ? "A l'initiative" : "Donner l'initiative"}
      </button>
      <div class="counter-grid">
        <div class="counter">
          <span class="counter__label">PC — commandement</span>
          <div class="counter__row">
            <button class="counter__btn" data-cp="${index}" data-delta="-1" aria-label="Retirer 1 PC">−</button>
            <div class="counter__value">${player.cp}</div>
            <button class="counter__btn" data-cp="${index}" data-delta="1" aria-label="Ajouter 1 PC">+</button>
          </div>
        </div>
        <div class="counter">
          <span class="counter__label">VP — victoire</span>
          <div class="counter__row">
            <button class="counter__btn" data-vp="${index}" data-delta="-1" aria-label="Retirer 1 VP">−</button>
            <div class="counter__value">${player.vp}</div>
            <button class="counter__btn" data-vp="${index}" data-delta="1" aria-label="Ajouter 1 VP">+</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function render(root: HTMLElement, tracker: MatchTrackerState): void {
  const players = tracker.players
    .map((player, index) => playerPanelHtml(player, index as 0 | 1, tracker.initiativeHolder === index))
    .join("");

  root.innerHTML = `
    <h2 class="screen-title">Compteur de Partie</h2>
    <p class="text-muted">
      Points de commandement et de victoire pour une bataille en cours. Rien n'est envoyé
      nulle part — tout reste dans ce navigateur.
    </p>

    <section class="settings-section">
      <h3 class="settings-section__title">Tournant</h3>
      <div class="turn-row">
        <button class="counter__btn" data-turn-delta="-1" aria-label="Tournant précédent">−</button>
        <div class="turn-row__value">Tournant ${tracker.turningPoint}</div>
        <button class="counter__btn" data-turn-delta="1" aria-label="Tournant suivant">+</button>
      </div>
      <p class="text-muted">Une bataille compte 4 tournants, sauf mention contraire.</p>
      <button class="btn btn--primary btn--block" data-advance-turn>Tournant suivant →</button>
      <p class="text-muted">
        Applique automatiquement le gain de PC de la phase de Stratégie (1PC au joueur
        à l'initiative, 2PC à l'autre) — sélectionnez d'abord qui a l'initiative ci-dessous.
      </p>
    </section>

    ${players}

    <button class="btn btn--danger btn--block" data-reset-match>Nouvelle partie</button>
    <button class="btn btn--block" data-home>Retour à l'accueil</button>
  `;

  root.querySelectorAll<HTMLButtonElement>("[data-cp]").forEach((btn) => {
    btn.addEventListener("click", () => {
      store.adjustPlayerCp(Number(btn.dataset.cp) as 0 | 1, Number(btn.dataset.delta));
      render(root, store.getMatchTracker());
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-vp]").forEach((btn) => {
    btn.addEventListener("click", () => {
      store.adjustPlayerVp(Number(btn.dataset.vp) as 0 | 1, Number(btn.dataset.delta));
      render(root, store.getMatchTracker());
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-set-initiative]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.setInitiative) as 0 | 1;
      const current = store.getMatchTracker();
      store.setInitiativeHolder(current.initiativeHolder === index ? null : index);
      render(root, store.getMatchTracker());
    });
  });

  root.querySelectorAll<HTMLInputElement>("[data-player-name]").forEach((input) => {
    // No re-render here: the input already shows what was typed, and re-rendering
    // the whole screen on every keystroke would steal focus mid-edit.
    input.addEventListener("input", () => {
      store.setPlayerName(Number(input.dataset.playerName) as 0 | 1, input.value);
    });
  });

  root.querySelector("[data-advance-turn]")?.addEventListener("click", () => {
    store.advanceTurningPoint();
    render(root, store.getMatchTracker());
  });

  root.querySelectorAll<HTMLButtonElement>("[data-turn-delta]").forEach((btn) => {
    btn.addEventListener("click", () => {
      store.adjustTurningPoint(Number(btn.dataset.turnDelta));
      render(root, store.getMatchTracker());
    });
  });

  root.querySelector("[data-reset-match]")?.addEventListener("click", () => {
    const confirmed = window.confirm("Démarrer une nouvelle partie ? Le compteur actuel sera effacé.");
    if (!confirmed) return;

    store.resetMatchTracker();
    render(root, store.getMatchTracker());
  });

  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
}

export function renderMatchTracker(root: HTMLElement): void {
  render(root, store.getMatchTracker());
}
