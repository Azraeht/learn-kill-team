// Parsing and French descriptions of Kill Team (3rd edition) weapon rules.
// Rule strings in the data files use the official English wording, e.g.
// "Piercing 1", "Lethal 5+", "Heavy (Dash only)", "Torrent 1\"", "1\" Devastating 2".

export interface ParsedRule {
  /** Original string from the data file. */
  raw: string;
  /** Normalised key, e.g. "piercing-crits". */
  key: string;
  /** Numeric parameter (x), if any. */
  x?: number;
  /** Leading distance for rules such as 1" Devastating 2. */
  distance?: number;
  /** Text in parentheses, e.g. "Dash only". */
  note?: string;
}

export interface RuleInfo {
  fr: string;
  en: string;
  /** Short French effect text. */
  describe: (rule: ParsedRule) => string;
}

const fmtX = (rule: ParsedRule, suffix = ""): string => (rule.x === undefined ? "" : ` ${rule.x}${suffix}`);

export const WEAPON_RULES: Record<string, RuleInfo> = {
  accurate: {
    fr: "Précision",
    en: "Accurate",
    describe: (r) => `Vous pouvez conserver jusqu'à ${r.x ?? "x"} dé(s) d'attaque comme succès normaux sans les lancer.`,
  },
  balanced: {
    fr: "Équilibrée",
    en: "Balanced",
    describe: () => "Vous pouvez relancer un de vos dés d'attaque.",
  },
  blast: {
    fr: "Explosion",
    en: "Blast",
    describe: (r) =>
      `Après la cible principale, tirez aussi sur chaque autre agent (ami compris) visible et à ${r.x ?? "x"}" ou moins d'elle. Jets séparés. Les cibles secondaires sont à couvert / masquées si la cible principale l'était.`,
  },
  ceaseless: {
    fr: "Incessante",
    en: "Ceaseless",
    describe: () => "Vous pouvez relancer tous vos dés d'attaque ayant obtenu un même résultat (ex. tous les 2).",
  },
  devastating: {
    fr: "Dévastatrice",
    en: "Devastating",
    describe: (r) =>
      r.distance !== undefined
        ? `Chaque critique conservé inflige immédiatement ${r.x ?? "x"} dégâts à la cible et à chaque autre agent visible à ${r.distance}" ou moins d'elle. Le succès reste ensuite à résoudre.`
        : `Chaque critique conservé inflige immédiatement ${r.x ?? "x"} dégâts à la cible. Le succès reste ensuite à résoudre.`,
  },
  heavy: {
    fr: "Lourde",
    en: "Heavy",
    describe: (r) =>
      r.note
        ? `Pas de tir si l'agent s'est déplacé pendant cette activation, et pas de déplacement après le tir, sauf : ${translateHeavyNote(r.note)}.`
        : "Pas de tir si l'agent s'est déplacé pendant cette activation, et pas de déplacement après le tir.",
  },
  hot: {
    fr: "Surchauffe",
    en: "Hot",
    describe: () =>
      "Après le tir, lancez 1D6 : si le résultat est inférieur à la caractéristique Touche de l'arme, le tireur subit ce résultat × 2 dégâts.",
  },
  lethal: {
    fr: "Létale",
    en: "Lethal",
    describe: (r) => `Vos succès de ${r.x ?? "x"}+ sont des succès critiques.`,
  },
  limited: {
    fr: "Limitée",
    en: "Limited",
    describe: (r) => `Utilisable ${r.x ?? "x"} fois par bataille.`,
  },
  piercing: {
    fr: "Perforante",
    en: "Piercing",
    describe: (r) => `Le défenseur lance ${r.x ?? "x"} dé(s) de défense en moins.`,
  },
  "piercing-crits": {
    fr: "Perforante Crit.",
    en: "Piercing Crits",
    describe: (r) => `Si vous conservez au moins un critique, le défenseur lance ${r.x ?? "x"} dé(s) de défense en moins.`,
  },
  punishing: {
    fr: "Punitive",
    en: "Punishing",
    describe: () => "Si vous conservez au moins un critique, vous pouvez conserver un de vos échecs comme succès normal.",
  },
  psychic: {
    fr: "Psychique",
    en: "Psychic",
    describe: () => "Arme psychique. Certaines règles d'équipe ou de mission s'appliquent aux armes psychiques.",
  },
  brutal: {
    fr: "Brutale",
    en: "Brutal",
    describe: () => "Votre adversaire ne peut parer qu'avec des succès critiques.",
  },
  shock: {
    fr: "Choc",
    en: "Shock",
    describe: () =>
      "La première fois que vous frappez avec un critique pendant la séquence, défaussez aussi un des succès normaux non résolus de l'adversaire (ou un critique s'il n'en a pas).",
  },
  range: {
    fr: "Portée",
    en: "Range",
    describe: (r) => `La cible doit être à ${r.x ?? "x"}" ou moins.`,
  },
  relentless: {
    fr: "Implacable",
    en: "Relentless",
    describe: () => "Vous pouvez relancer autant de dés d'attaque que vous le souhaitez.",
  },
  rending: {
    fr: "Déchirante",
    en: "Rending",
    describe: () => "Si vous conservez au moins un critique, vous pouvez transformer un de vos succès normaux en critique.",
  },
  saturate: {
    fr: "Saturation",
    en: "Saturate",
    describe: () => "Le défenseur ne peut pas conserver de sauvegarde de couvert.",
  },
  seek: {
    fr: "Traque",
    en: "Seek",
    describe: () => "Pour choisir une cible valide, les agents ne peuvent pas utiliser le décor comme couvert.",
  },
  "seek-light": {
    fr: "Traque Légère",
    en: "Seek Light",
    describe: () => "Pour choisir une cible valide, les agents ne peuvent pas utiliser le décor léger comme couvert.",
  },
  severe: {
    fr: "Sévère",
    en: "Severe",
    describe: () =>
      "Si vous ne conservez aucun critique, vous pouvez transformer un succès normal en critique (Dévastatrice et Perforante Crit. s'appliquent, pas Punitive ni Déchirante).",
  },
  silent: {
    fr: "Silencieuse",
    en: "Silent",
    describe: () => "L'agent peut tirer avec cette arme même avec un ordre de Dissimulation.",
  },
  stun: {
    fr: "Étourdissante",
    en: "Stun",
    describe: () => "Si vous conservez au moins un critique, la cible perd 1 LPA jusqu'à la fin de sa prochaine activation.",
  },
  torrent: {
    fr: "Torrent",
    en: "Torrent",
    describe: (r) =>
      `Après la cible principale, vous pouvez tirer sur n'importe quel nombre d'autres cibles valides à ${r.x ?? "x"}" ou moins d'elle. Jets séparés.`,
  },
};

function translateHeavyNote(note: string): string {
  const n = note.trim().toLowerCase();
  if (n === "dash only") return "Course uniquement";
  if (n === "reposition only") return "Repositionnement uniquement";
  return note;
}

const RULE_PATTERN = /^(?:(\d+(?:\.\d+)?)"\s+)?([A-Za-z][A-Za-z ]*?)\s*(?:(\d+)\s*(?:\+|")?)?\s*(?:\(([^)]*)\))?$/;

export function parseRule(raw: string): ParsedRule {
  const match = raw.trim().match(RULE_PATTERN);
  if (!match) return { raw, key: raw.trim().toLowerCase() };
  const [, distance, name, x, note] = match;
  return {
    raw,
    key: name.trim().toLowerCase().replace(/\s+/g, "-"),
    x: x === undefined ? undefined : Number(x),
    distance: distance === undefined ? undefined : Number(distance),
    note: note?.trim() || undefined,
  };
}

export function isKnownRule(rule: ParsedRule): boolean {
  return rule.key in WEAPON_RULES;
}

/** Short French label for a rule, e.g. "Perforante 1", "Létale 5+", "Torrent 1"". */
export function ruleLabel(rule: ParsedRule): string {
  const info = WEAPON_RULES[rule.key];
  if (!info) return rule.raw;
  const prefix = rule.distance !== undefined ? `${rule.distance}" ` : "";
  const suffix = rule.key === "lethal" ? "+" : rule.key === "range" || rule.key === "blast" || rule.key === "torrent" ? '"' : "";
  return `${prefix}${info.fr}${fmtX(rule, suffix)}`;
}
