import { BATCH_SIZE_OPTIONS, store } from "../core/store.ts";
import { activityTotals } from "../core/activity.ts";
import { navigate } from "../router.ts";
import { escapeHtml } from "../ui/html.ts";

/** Transient message shown under the export/import controls after an action. */
let notice: { text: string; ok: boolean } | null = null;

function exportFileName(): string {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  return `kill-team-trainer-progression-${stamp}.json`;
}

function downloadExport(): void {
  const blob = new Blob([store.exportState()], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = exportFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoked on the next tick so the click has already started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function renderSettings(root: HTMLElement): void {
  const { settings } = store.getState();
  const totals = activityTotals(store.getState().dailyActivity);

  const sizeButtons = BATCH_SIZE_OPTIONS.map(
    (size) => `
      <button
        class="filter-chip${size === settings.batchSize ? " filter-chip--active" : ""}"
        data-batch="${size}"
      >${size}</button>
    `,
  ).join("");

  const noticeHtml = notice
    ? `<p class="settings-notice${notice.ok ? "" : " settings-notice--error"}">${escapeHtml(notice.text)}</p>`
    : "";

  root.innerHTML = `
    <h2 class="screen-title">Réglages</h2>

    <section class="settings-section">
      <h3 class="settings-section__title">Longueur d'une session</h3>
      <p class="text-muted">Nombre de questions par session de révision.</p>
      <div class="filter-chips">${sizeButtons}</div>
    </section>

    <section class="settings-section">
      <h3 class="settings-section__title">Sauvegarde de la progression</h3>
      <p class="text-muted">
        Votre progression est stockée uniquement dans ce navigateur. Effacer les données du site
        ou changer d'appareil la perdrait — exportez-la pour la conserver.
      </p>
      <div class="action-row">
        <button class="btn btn--block" data-export>Exporter</button>
        <button class="btn btn--block" data-import>Importer</button>
      </div>
      <input type="file" accept="application/json,.json" hidden data-import-input />
      ${noticeHtml}
      <p class="text-muted">${totals.answered} réponse(s) enregistrée(s) sur ${totals.activeDays} jour(s) d'activité.</p>
    </section>

    <section class="settings-section">
      <h3 class="settings-section__title">Réinitialiser</h3>
      <p class="text-muted">Efface définitivement toute la progression : révisions, séquences et cas pratiques.</p>
      <button class="btn btn--danger btn--block" data-reset>Tout réinitialiser</button>
    </section>

    <button class="btn btn--block" data-home>Retour à l'accueil</button>
  `;

  root.querySelectorAll<HTMLButtonElement>("[data-batch]").forEach((btn) => {
    btn.addEventListener("click", () => {
      store.setBatchSize(Number(btn.dataset.batch));
      notice = null;
      renderSettings(root);
    });
  });

  root.querySelector("[data-export]")?.addEventListener("click", () => {
    downloadExport();
    notice = { text: "Progression exportée.", ok: true };
    renderSettings(root);
  });

  const fileInput = root.querySelector<HTMLInputElement>("[data-import-input]");

  root.querySelector("[data-import]")?.addEventListener("click", () => fileInput?.click());

  fileInput?.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    try {
      const imported = store.importState(await file.text());
      notice = imported
        ? { text: "Progression importée.", ok: true }
        : { text: "Fichier illisible : ce n'est pas un export de progression.", ok: false };
    } catch {
      notice = { text: "Impossible de lire ce fichier.", ok: false };
    }

    renderSettings(root);
  });

  root.querySelector("[data-reset]")?.addEventListener("click", () => {
    const confirmed = window.confirm(
      "Effacer toute votre progression ? Cette action est irréversible.",
    );
    if (!confirmed) return;

    store.resetProgress();
    notice = { text: "Progression réinitialisée.", ok: true };
    renderSettings(root);
  });

  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
}
