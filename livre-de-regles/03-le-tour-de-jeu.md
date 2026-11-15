# Chapitre 3 : Le Tour de Jeu

Les joueurs activent leurs agents à tour de rôle, un agent à la fois. Ce chapitre décrit le déroulement d'un tour, puis le déplacement. Le tir et le corps à corps font l'objet des chapitres 4 et 5.

## 3.1 La bataille

Une bataille se joue en plusieurs **tours** (*turning points*). La mission fixe leur nombre (4 en *Preliminary Ops*). Chaque tour comprend, dans l'ordre :

1. la **phase de Stratégie** (*Strategy phase*) ;
2. la **phase d'Affrontement** (*Firefight phase*).

Chaque phase est jouée en entier avant de passer à la suivante.

> [!IMPORTANT]
> **Le tour en bref**
>
> **Phase de Stratégie**
> 1. Initiative
> 2. Préparation : gain de PC, tous les agents redeviennent prêts
> 3. Subterfuges : chaque joueur joue un subterfuge stratégique ou passe, à tour de rôle
>
> **Phase d'Affrontement**
> - Activations alternées, en commençant par le joueur qui a l'initiative.
> - Chaque activation se déroule ainsi : choisir l'ordre, effectuer des actions, l'agent est épuisé.
> - Quand un joueur n'a plus d'agent prêt, il peut faire des contre-actions.
> - Le tour se termine quand tous les agents sont épuisés.

## 3.2 Phase de Stratégie

### Étape 1 : Initiative

Le joueur qui a l'**initiative** active le premier agent. Si plusieurs règles s'appliquent en même temps, c'est lui qui décide de leur ordre de résolution.

Pour la déterminer, les joueurs font un **jet en opposition** (*roll-off*) : chacun lance 1D6, le plus haut résultat gagne. Le gagnant choisit quel joueur a l'initiative. En cas d'égalité :
- **au tour 1**, le joueur qui n'avait pas l'initiative pendant la mise en place décide ;
- **aux tours suivants**, le joueur qui n'avait pas l'initiative au tour précédent décide.

### Étape 2 : Préparation (*Ready*)

1. Chaque joueur gagne **1 point de commandement** (PC, *Command point*). À partir du tour 2, le joueur sans initiative en gagne **2**. Les PC non dépensés sont conservés.
2. Chaque joueur rend **prêts** (*ready*) tous ses agents : leur jeton d'ordre est retourné face claire.

**Subterfuges** (*ploys*). Les PC permettent de jouer des subterfuges. Un subterfuge coûte 1 PC, sauf indication contraire. Il en existe deux types :
- **Subterfuge stratégique** (*strategy ploy*) : il se joue à l'étape 3. Son effet dure jusqu'à la fin du tour, sauf s'il est dit « immédiat ».
- **Subterfuge d'affrontement** (*firefight ploy*) : il se joue pendant la phase d'Affrontement, au moment qu'il indique.

Un même subterfuge ne peut être joué qu'une fois par tour. Seule exception : la Relance de commandement, que tous les joueurs possèdent.

> **RELANCE DE COMMANDEMENT** (*Command Re-roll*), 1 PC, subterfuge d'affrontement
> Après avoir lancé vos dés d'attaque ou de défense, relancez-en un.

### Étape 3 : Subterfuges (*Gambit*)

Le joueur qui a l'initiative commence. Chacun à son tour, chaque joueur joue un subterfuge stratégique ou passe. L'étape se termine quand les deux joueurs passent consécutivement.

Toute règle portant le mot-clé *STRATEGIC GAMBIT* se joue elle aussi à cette étape, au même titre qu'un subterfuge stratégique.

> [!NOTE]
> **Exemple**
>
> Alice joue un subterfuge, Bruno en joue un, puis Alice passe. Bruno en joue un second. Alice passe, puis Bruno passe : les deux joueurs ont passé consécutivement, l'étape est terminée.

## 3.3 Phase d'Affrontement

Le joueur qui a l'initiative active un de ses agents prêts, puis son adversaire en active un, et ainsi de suite. La phase se termine quand tous les agents sont **épuisés** (*expended*).

**Jeton d'ordre.** Il indique l'ordre de l'agent (Engagement ou Dissimulation) et son état : face claire, l'agent est prêt ; face sombre, il est épuisé.

### Activation

**1. Choisir l'ordre.** L'agent conserve cet ordre jusqu'à sa prochaine activation.
- **Engagement** (*Engage*) : l'agent agit normalement et peut faire une contre-action.
- **Dissimulation** (*Conceal*) : l'agent ne peut ni tirer, ni charger, ni faire de contre-action. **Tant qu'il est à couvert, il ne peut pas être pris pour cible.**

Au début de la bataille, tous les agents sont en Dissimulation.

**2. Effectuer des actions.** L'agent en train d'agir est l'**agent actif** (*active operative*). Chaque action coûte des **points d'action** (PA, *Action points*). Le total dépensé ne peut pas dépasser la **limite de PA** (LPA, *APL*) indiquée sur la fiche de l'agent.
- Une même action ne peut pas être effectuée deux fois dans la même activation.
- Les actions s'annoncent une par une, pas à l'avance.
- Une action qui ne peut pas être menée à terme est annulée : le jeu revient à l'état d'avant et les PA ne sont pas dépensés.
- Une action coûte au minimum 0 PA.

**3. Épuisé.** Le jeton passe face sombre et la main passe à l'adversaire.

> [!NOTE]
> **Exemple**
>
> Avec une LPA de 2, un agent peut faire Repositionnement (1 PA) + Tir (1 PA). Il ne peut pas faire Repli (2 PA) + Tir (1 PA), car cela fait 3 PA.

> [!TIP]
> **Astuce**
>
> Un agent en Dissimulation à couvert est quasi intouchable, mais il ne menace rien. Un agent en Engagement reste exposé jusqu'à sa prochaine activation.

### Contre-action (*counteract*)

Si tous vos agents sont épuisés alors que l'adversaire a encore des agents prêts, vous pouvez faire une contre-action à chaque fois que vous auriez dû activer un agent :
- choisissez un agent épuisé en **Engagement** ;
- il effectue gratuitement **une action à 1 PA**, sauf Garde (chapitre 10) ;
- il ne peut pas se déplacer de plus de **2"**, surcoûts de terrain compris ;
- chaque agent ne peut faire qu'**une contre-action par tour**.

C'est facultatif. Dans tous les cas, la main repasse ensuite à l'adversaire. Une contre-action n'est pas une activation : la règle « une même action une seule fois » ne s'applique donc pas.

> [!NOTE]
> **Exemple**
>
> Alice a 6 agents et Bruno 8. Les 6 agents d'Alice sont épuisés. Bruno active son 7e agent. Alice fait tirer gratuitement son sniper épuisé, qui est en Engagement. Bruno active son 8e agent. Alice fait une contre-action avec un autre agent, car son sniper a déjà fait la sienne.

## 3.4 Types d'actions

- **Universelles** : tous les agents peuvent les effectuer (déplacement, tir, combat, marqueurs).
- **Uniques** : propres à certains agents, décrites dans les règles d'équipe.
- **De mission** : fournies par la mission ou la killzone.
- **Gratuites** : elles ne s'effectuent que si une règle le permet. Leurs conditions s'appliquent et elles ne coûtent pas de PA. Elles comptent comme effectuées : une action gratuite faite pendant l'activation empêche de refaire cette action dans la même activation. Faite en dehors de l'activation, elle n'empêche rien.

Ce chapitre traite des déplacements. Pour le Tir et le Combat, voir les chapitres 4 et 5. Pour les marqueurs, voir le chapitre 7.

## 3.5 Déplacement

### Notions de base

- **Distances** : elles se mesurent en pouces ("), depuis le point le plus proche, et toujours depuis le **socle** de l'agent.
- **Socles** : ils peuvent se toucher, mais jamais se chevaucher. Un agent peut traverser ses agents amis, mais **jamais un ennemi**. Il ne traverse pas non plus le décor et ne sort pas de la killzone.
- **Visible** : une ligne droite dégagée existe depuis la tête de l'agent jusqu'à une partie quelconque de la cible. On ignore les socles.
- **Zone de contrôle** (*control range*) : un élément est dans la zone de contrôle d'un agent s'il est **visible et à 1" ou moins** de lui. Cette relation est réciproque.

> [!TIP]
> **Astuce**
>
> Deux agents collés de part et d'autre d'un mur ne se voient pas : ils ne sont donc pas dans la zone de contrôle l'un de l'autre.

### Repositionnement (*Reposition*), 1 PA

- L'agent se déplace d'au plus sa caractéristique de **Mouvement**, en un ou plusieurs segments droits. **Chaque segment est arrondi au pouce supérieur.**
- Il ne peut pas entrer dans la zone de contrôle d'un ennemi. Exception : si un agent ami s'y trouve déjà, il peut la traverser, mais pas s'y arrêter.
- Interdit si l'agent est dans la zone de contrôle d'un ennemi, ou s'il a déjà fait un Repli ou une Charge pendant cette activation.

> [!NOTE]
> **Exemple**
>
> Mouvement 6" : 2" pour passer l'angle d'un mur, puis 4" (total 6"). Autre cas : des segments de 0,5" et 2,75" comptent pour 1" + 3" = 4".

### Course (*Dash*), 1 PA

- Comme un Repositionnement, mais sur **3"** maximum, quel que soit le Mouvement.
- Pas d'escalade. Descendre et sauter restent possibles.
- Interdit si l'agent est dans la zone de contrôle d'un ennemi ou s'il a chargé pendant cette activation.

### Repli (*Fall Back*), 2 PA

- Comme un Repositionnement, mais l'agent peut **traverser** la zone de contrôle d'ennemis. Il ne peut pas y terminer son déplacement.
- Uniquement si un ennemi est dans la zone de contrôle de l'agent.
- Interdit si l'agent a déjà fait un Repositionnement ou une Charge pendant cette activation.

### Charge, 1 PA

- Comme un Repositionnement, avec **2" de plus**.
- L'agent peut entrer dans la zone de contrôle d'un ennemi et **doit y terminer**.
- S'il entre dans la zone de contrôle d'un ennemi qu'aucun ami ne contrôle déjà, il ne peut plus en sortir pendant ce déplacement.
- Interdit en Dissimulation, si l'agent est déjà dans la zone de contrôle d'un ennemi, ou s'il a déjà fait un Repositionnement, une Course ou un Repli pendant cette activation.

> [!IMPORTANT]
> **Résumé des déplacements**
>
> | Action | PA | Distance | Interdit si… |
> |---|---|---|---|
> | Repositionnement | 1 | Mouvement | en zone ennemie ; Repli ou Charge déjà faits |
> | Course | 1 | 3", sans escalade | en zone ennemie ; Charge déjà faite |
> | Repli | 2 | Mouvement, traverse les zones ennemies | **pas** en zone ennemie ; Repositionnement ou Charge déjà faits |
> | Charge | 1 | Mouvement + 2", finit en zone ennemie | Dissimulation ; déjà en zone ennemie ; Repositionnement, Course ou Repli déjà faits |

> [!TIP]
> **Astuce**
>
> Pour aller loin, enchaînez Repositionnement et Course. Le Repli coûte 2 PA et prend donc souvent toute l'activation.

## 3.6 Déplacement dans le décor

On ne traverse pas le décor : on le contourne, on l'escalade, on en descend ou on saute. Un déplacement ne peut se terminer que sur le sol ou sur une partie **Surélevée** (*Vantage*). On ne peut pas s'arrêter au milieu d'une escalade, d'une descente ou d'un saut. Si aucun emplacement d'arrivée valide n'est possible, le déplacement ne peut pas commencer.

**Escalader** (*climb*). L'agent doit être à 1" ou moins horizontalement et à 3" ou moins verticalement d'un élément de décor qu'il voit. La hauteur escaladée est décomptée du mouvement, avec un **minimum de 2"** par escalade. Si l'agent escalade plusieurs fois dans une même action, les hauteurs sont additionnées avant l'arrondi.

**Descendre** (*drop*). Les **2 premiers pouces** de descente de chaque action sont ignorés. C'est 2" au total par action, pas 2" par descente.

**Sauter** (*jump*). Depuis une partie Surélevée à plus de 2" du sol, l'agent peut se déplacer d'au plus **4" à l'horizontale** en un seul segment droit, puis il descend ou escalade.
- S'il y a un parapet au bord de départ, l'agent doit d'abord l'escalader, puis sauter depuis son sommet.
- À l'arrivée, une différence de hauteur de 1" ou moins est ignorée.

**Types de décor qui modifient le déplacement** (détails au chapitre 9) :
- **Accessible** : on peut le traverser, mais cela coûte **+1"**. Seul le centre du socle doit passer.
- **Insignifiant** (*Insignificant*) : il est ignoré pour l'escalade et la descente.
- **Plafond** (*Ceiling*) : un agent sur socle rond de 50 mm ou moins, ou sur socle ovale de 60 × 35 mm, peut passer dessous.

> [!NOTE]
> **Exemples**
>
> - Depuis une passerelle à 4" du sol : 2" pour quitter le bord, puis 4" de descente dont 2" sont ignorés. Coût total : 4".
> - Franchir une caisse de 1" de haut : escalade 2" (minimum), 3" pour la traverser, descente de 1" ignorée. Coût total : 5".

> [!TIP]
> **Astuce**
>
> Un saut franchit un écart de 4" entre deux bâtiments. Un agent posté en hauteur se déplace souvent plus vite qu'il n'y paraît.

## 3.7 Exemple de tour complet

> [!NOTE]
> **Tour 2. Alice et Bruno ont 6 agents chacun.**
>
> **Stratégie**
> 1. Jet en opposition : Bruno fait 5, Alice fait 3. Bruno garde l'initiative.
> 2. Bruno gagne 1 PC, Alice 2 PC. Tous les agents redeviennent prêts.
> 3. Bruno joue un subterfuge stratégique (−1 PC). Alice passe, puis Bruno passe : l'étape est terminée.
>
> **Affrontement**
> - Bruno active son chef : Engagement, Repositionnement de 6", puis Tir. Il est épuisé.
> - Alice active un agent au contact d'un ennemi : Engagement, puis Combat, plutôt qu'un Repli à 2 PA.
> - Bruno active un éclaireur : Dissimulation, Repositionnement puis Course jusqu'à un couvert près d'un objectif.
> - Les activations alternent ainsi. Alice perd 2 agents dans le tour : quand ses agents sont tous épuisés, Bruno en a encore 2 prêts. Entre ces deux activations, Alice fait une contre-action (un Tir).
> - Tous les agents sont épuisés : le tour 3 commence.
