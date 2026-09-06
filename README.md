# Kill Team Trainer

Une app d'entraînement aux règles de Warhammer 40,000 : Kill Team, en
français, pensée pour le téléphone et utilisable hors ligne. Révision par
cartes avec score et séries, répétition espacée pour que les règles ratées
reviennent plus vite, cas pratiques, séquences de jeu et antisèche
consultable — le tout en site statique, sans backend, installable en PWA.

Le contenu compte **347 questions** réparties en 9 catégories (dont 342
vérifiées sur les règles officielles avec référence de source), **7 cas
pratiques** et **5 séquences de jeu**. Ce qui reste à vérifier porte un badge
`Brouillon — non vérifié` dans l'app. Voir [CONTENT.md](./CONTENT.md) pour
ajouter ou corriger du contenu.

## Les modes

- **Réviser** — le QCM classique, piloté par la répétition espacée. Chaque
  question a une « boîte » Leitner (0–5) et un facteur de facilité : une bonne
  réponse l'éloigne, une mauvaise la ramène. Voir `src/core/srs.ts`.
- **Points faibles** — une session qui ne cible que les questions déjà ratées
  au moins une fois, toutes catégories confondues, triées par taux de
  réussite croissant. Voir `src/core/weakPoints.ts`.
- **Cas pratiques** — une situation de table, puis une chaîne de décisions à
  prendre, avec l'explication de la règle entre chaque. C'est le mode qui
  travaille la combinaison des règles (ordres, portée de contrôle, couvert,
  coûts en PA) plutôt que les faits isolés.
- **Séquences de jeu** — remettre dans l'ordre les étapes d'une phase ou
  d'une action, pour apprendre le déroulement plutôt que le détail.
- **Antisèche** — toutes les règles du jeu de questions, avec leur réponse et
  leur source, cherchables (la recherche ignore les accents) et filtrables
  par catégorie. Conçue pour être ouverte *pendant* une partie.
- **Progression** — maîtrise et réussite par catégorie, série de jours
  consécutifs et carte d'assiduité sur 12 semaines.
- **Réglages** — longueur des sessions, export/import de la progression,
  réinitialisation.

## Les catégories

Règles de Base, Terrain et Missions, puis une catégorie par kill team :
Aquilon du Tempestus, Frelons Vespides, Yaegirs Hernkogs, Exo-Armures XV26
Stealth, Cibleurs, Cercle Canoptek, Deathwatch. Voir
`src/data/categories.ts`.

## Vos données

Toute la progression est stockée dans le `localStorage` du navigateur —
rien n'est envoyé à un serveur. Effacer les données du site la remet à
zéro, d'où l'export JSON dans les Réglages pour la conserver ou la
transférer sur un autre appareil.

## Stack

Vite + TypeScript sans framework + CSS simple, `vite-plugin-pwa` pour le
service worker et le manifeste hors ligne, `ajv` pour valider le contenu,
`vitest` pour les tests unitaires. Aucun framework UI, aucun backend :
l'app est entièrement statique.

## Développement

```bash
npm install
npm run dev
```

Ouvrez l'URL affichée sur votre téléphone (même Wi-Fi) ou dans un
navigateur en taille mobile.

Autres scripts :

```bash
npm run validate-content   # valide questions, séquences et cas pratiques (aussi en CI)
npm test                   # tests unitaires (SRS, moteur de session, activité, recherche, validateur)
npm run build              # type-check + build de production dans dist/
npm run preview            # sert le build de production en local
```

## Déploiement

Chaque push sur `main` déclenche `.github/workflows/deploy.yml` : validation
du contenu, tests, build, puis déploiement de `dist/` sur GitHub Pages.

Réglage initial à faire une fois sur GitHub : **Settings → Pages → Source :
GitHub Actions**. Ensuite, chaque push sur `main` se déploie tout seul.

Le site est construit avec `base: '/learn-kill-team/'` dans `vite.config.ts`,
pour correspondre à l'URL du projet
(`https://<votre-utilisateur>.github.io/learn-kill-team/`). Si vous forkez
sous un autre nom de dépôt, ajustez `base` (ou la variable d'environnement
`BASE_URL`).

## Ajouter ou corriger du contenu

Voir [CONTENT.md](./CONTENT.md).
