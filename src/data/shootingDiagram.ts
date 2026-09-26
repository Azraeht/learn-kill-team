/**
 * Content for the shooting-resolution diagram (écran "Diagramme de tir").
 *
 * Every node is built strictly from facts already verified elsewhere in the app:
 * the "Séquence de Tir" (seq-004, src/data/sequences/core-rules.json), the tir/
 * couvert/cible-eligible questions in src/data/questions/core-rules.json
 * (core-025 to core-036), and the weapon-rule glossary entries in
 * src/data/glossary/core-rules.json (gl-006 to gl-026). The one exception is the
 * "Masqué" branch, sourced from the draft glossary entry gl-027 — it is marked
 * `draft: true` here too so the UI can badge it exactly like everywhere else.
 *
 * Split into five phases rather than one fully-inlined tree: several branches
 * converge onto the same next step (e.g. both a visible non-Dissimulation
 * target and a visible-but-uncovered Dissimulation target become "cible
 * éligible"), and inlining the rest of the flow again at every convergence
 * blows the tree up combinatorially. A `link` leaf instead points at the next
 * phase by id, and the screen renders each phase once.
 */

export type FlowNode =
  | {
      kind: "decision";
      question: string;
      note?: string;
      weaponRules?: string[];
      oui: FlowNode;
      non: FlowNode;
    }
  | {
      kind: "step";
      text: string;
      weaponRules?: string[];
      draft?: boolean;
      next: FlowNode;
    }
  | {
      kind: "outcome";
      text: string;
      tone: "stop" | "go";
      draft?: boolean;
    }
  | {
      kind: "link";
      phaseId: string;
      label: string;
    };

export interface DiagramPhase {
  id: string;
  title: string;
  root: FlowNode;
}

export const shootingDiagramPhases: DiagramPhase[] = [
  {
    id: "eligibilite",
    title: "Phase 1 — Éligibilité pour agir",
    root: {
      kind: "decision",
      question: "L'agent actif a-t-il un ordre de Dissimulation ?",
      non: {
        kind: "decision",
        question: "L'agent est-il à portée de contrôle d'un agent ennemi ?",
        oui: {
          kind: "outcome",
          text: "Action Tirer impossible, quelle que soit l'arme.",
          tone: "stop",
        },
        non: {
          kind: "step",
          text: "L'attaquant choisit une de ses armes de tir.",
          next: { kind: "link", phaseId: "cible", label: "Choisir une cible éligible" },
        },
      },
      oui: {
        kind: "decision",
        question: "L'arme choisie a-t-elle la règle Silencieuse ?",
        weaponRules: ["Silencieuse"],
        oui: {
          kind: "decision",
          question: "L'agent est-il à portée de contrôle d'un agent ennemi ?",
          oui: {
            kind: "outcome",
            text: "Action Tirer impossible, quelle que soit l'arme.",
            tone: "stop",
          },
          non: {
            kind: "step",
            text: "Silencieuse autorise le Tir malgré la Dissimulation.",
            next: { kind: "link", phaseId: "cible", label: "Choisir une cible éligible" },
          },
        },
        non: {
          kind: "outcome",
          text: "Action Tirer impossible (ordre de Dissimulation, aucune arme Silencieuse).",
          tone: "stop",
        },
      },
    },
  },
  {
    id: "cible",
    title: "Phase 2 — Choisir une cible éligible",
    root: {
      kind: "decision",
      question: "La cible potentielle est-elle visible pour l'agent actif ?",
      non: {
        kind: "outcome",
        text: "Pas une cible éligible.",
        tone: "stop",
      },
      oui: {
        kind: "decision",
        question: "La cible a-t-elle un ordre de Dissimulation ?",
        non: {
          kind: "link",
          phaseId: "attaque",
          label: "Cible éligible → Jet d'attaque",
        },
        oui: {
          kind: "decision",
          question: 'La cible est-elle à couvert (à 2" ou plus de l\'agent actif, avec du terrain interposé) ?',
          note: "Traqueuse : quand vous choisissez une cible éligible, les agents ne peuvent pas utiliser le terrain comme couvert — cette branche « Oui » ne se présente donc jamais avec une telle arme.",
          weaponRules: ["Traqueuse"],
          oui: {
            kind: "outcome",
            text: "Pas une cible éligible (Dissimulation + couvert).",
            tone: "stop",
          },
          non: {
            kind: "link",
            phaseId: "attaque",
            label: "Cible éligible → Jet d'attaque",
          },
        },
      },
    },
  },
  {
    id: "attaque",
    title: "Phase 3 — Jet d'attaque",
    root: {
      kind: "step",
      text: "L'attaquant jette ses dés d'attaque : autant de D6 que la caractéristique d'Attaques de l'arme utilisée.",
      weaponRules: [
        "Équilibrée",
        "Implacable",
        "Inexorable",
        "Précision x",
        "Portée x",
        "Lourde",
        "Limitée x",
        "Torrent x",
        "Surchauffe",
      ],
      next: {
        kind: "decision",
        question: 'La cible est-elle masquée (à plus de 2" derrière un élément de décor masquant, du point de vue de l\'attaquant) ?',
        note: "Branche Brouillon — reconstruite à partir de règles déjà présentes dans l'app (voir glossaire « Masqué »), à confirmer contre le libellé exact du livre de règles de base.",
        oui: {
          kind: "step",
          text: "L'attaquant défausse une de ses réussites d'attaque, sauf si un effet de faction supprime spécifiquement cette contrainte.",
          draft: true,
          next: { kind: "link", phaseId: "defense", label: "Jet de défense" },
        },
        non: { kind: "link", phaseId: "defense", label: "Jet de défense" },
      },
    },
  },
  {
    id: "defense",
    title: "Phase 4 — Jet de défense et couvert",
    root: {
      kind: "step",
      text: "Le défenseur jette toujours trois D6 pour sa défense, quelle que soit l'arme de l'attaquant.",
      next: {
        kind: "decision",
        question: "La cible est-elle à couvert ?",
        note: "Traqueuse empêche déjà d'utiliser le terrain comme couvert dès le choix de la cible (Phase 2) — cette branche ne se présente donc pas avec une telle arme.",
        non: {
          kind: "step",
          text: "Pas de bonus de couvert sur le jet de défense.",
          next: { kind: "link", phaseId: "resolution", label: "Allocation et résolution" },
        },
        oui: {
          kind: "decision",
          question: "L'arme de l'attaquant a-t-elle la règle Saturation ?",
          weaponRules: ["Saturation"],
          oui: {
            kind: "step",
            text: "Saturation : le défenseur ne peut conserver aucune sauvegarde de couvert.",
            next: { kind: "link", phaseId: "resolution", label: "Allocation et résolution" },
          },
          non: {
            kind: "step",
            text: "Le défenseur peut conserver un dé de défense comme une réussite normale sans le jeter.",
            next: { kind: "link", phaseId: "resolution", label: "Allocation et résolution" },
          },
        },
      },
    },
  },
  {
    id: "resolution",
    title: "Phase 5 — Allocation et résolution des dégâts",
    root: {
      kind: "step",
      text: "Le défenseur alloue ses réussites de défense pour bloquer les réussites d'attaque non modifiées : deux réussites normales (ou une critique) bloquent une critique ; une réussite normale en bloque une autre.",
      weaponRules: ["Brutale", "Perforante x", "Choc"],
      next: {
        kind: "step",
        text: "L'attaquant résout chaque dé d'attaque non bloqué pour infliger des dégâts, selon le profil de l'arme et ses règles.",
        weaponRules: [
          "Dévastatrice x",
          "Létal x+",
          "Fatale",
          "Fracassante",
          "Vengeresse",
          "Étourdissant",
          "Torrent x",
          "Surchauffe",
        ],
        next: {
          kind: "outcome",
          text: "Dégâts infligés. Un agent qui passe sous la moitié de ses PV de départ devient Estropié ; un agent à 0 PV ou moins est neutralisé et retiré du jeu.",
          tone: "go",
        },
      },
    },
  },
];
