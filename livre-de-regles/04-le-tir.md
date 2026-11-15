# Chapitre 4 : Le Tir

## 4.1 Action Tir (*Shoot*), 1 PA

L'agent actif tire en suivant la séquence ci-dessous. Son joueur est l'**attaquant** (*attacker*), le joueur qui contrôle la cible est le **défenseur** (*defender*).

**Interdit** en Dissimulation, et si l'agent est dans la zone de contrôle d'un ennemi.

> [!IMPORTANT]
> **Séquence de tir**
>
> 1. Choisir une arme de tir.
> 2. Choisir une cible valide.
> 3. Lancer les dés d'attaque.
> 4. Lancer les dés de défense.
> 5. Résoudre les dés de défense (blocages).
> 6. Résoudre les dés d'attaque (dégâts).

Avant d'entrer dans la séquence, il faut connaître quatre notions : **visible**, **en interposition**, **à couvert** et **gêné**.

## 4.2 Visible (*visible*)

Placez-vous derrière l'agent. La cible est visible si l'on peut tracer une ligne droite dégagée de 1 mm d'épaisseur entre la **tête** de l'agent et **n'importe quelle partie** de la cible. On ignore les socles pour cette vérification. Un agent est toujours visible pour lui-même.

## 4.3 En interposition (*intervening*)

Un élément est en interposition s'il se trouve entre l'agent et sa cible. En cas de doute, on trace des **lignes de visée** (*targeting lines*) : ce sont des lignes droites de 1 mm, tracées depuis **un point quelconque** du socle de l'agent, au choix de son joueur, vers **toutes les parties en vis-à-vis** du socle de la cible.
- Un élément traversé par au moins une ligne est **en interposition**.
- Un élément traversé par toutes les lignes est **entièrement en interposition** (*wholly intervening*).

En général, on trace les lignes vues du dessus. Si les agents sont à des hauteurs différentes (agent sur une partie Surélevée, par exemple), on les trace en trois dimensions.

> [!TIP]
> **Astuce**
>
> L'attaquant choisit le point de départ des lignes. Le choisir sur le bord de son socle permet souvent d'éviter qu'un décor soit en interposition.

## 4.4 À couvert (*in cover*)

Une cible est à couvert si un **élément de décor en interposition** se trouve **dans sa zone de contrôle**, c'est-à-dire visible et à 1" ou moins d'elle.

Elle **n'est jamais à couvert** si l'agent qui la vise est à 2" ou moins d'elle.

Effets :
- Une cible **en Dissimulation** et à couvert **n'est pas une cible valide**.
- Une cible **en Engagement** et à couvert reste une cible valide, mais elle bénéficie d'une **sauvegarde de couvert** (étape 4).

> [!NOTE]
> **Exemples**
>
> - Un muret en interposition est à 1" de la cible : elle est à couvert.
> - Un muret en interposition est à 3" de la cible : elle n'est pas à couvert.
> - Un muret est collé à la cible, mais il n'est pas entre elle et le tireur : elle n'est pas à couvert.
> - Un muret en interposition est collé à la cible, mais le tireur est à 2" ou moins d'elle : elle n'est pas à couvert.

## 4.5 Gêné (*obscured*)

Une cible est gênée si un élément de décor **Lourd** (*Heavy*, chapitre 9) est en interposition. Les parties de ce décor situées à 1" ou moins de l'un des deux agents ne comptent pas.

Une même pièce de décor ne peut pas rendre la cible à la fois à couvert et gênée. Si c'est le cas, le défenseur choisit l'un des deux effets pour cette séquence de tir.

> [!NOTE]
> **Exemples**
>
> - La cible est visible à travers la fenêtre d'une ruine Lourde, à plus de 1" des deux agents : elle est gênée.
> - Le tireur est collé au mur Lourd : la partie du mur à 1" ou moins de lui ne compte pas, donc la cible n'est pas gênée.
> - Seule une partie d'un grand mur Lourd est à 1" ou moins des agents. Le reste du mur est toujours en interposition : la cible est gênée.

> [!TIP]
> **Astuce**
>
> Un agent posté contre un obstacle tire par-dessus ou autour, comme s'il se penchait à une fenêtre. C'est pourquoi le décor collé à l'un des agents ne gêne pas le tir.

## 4.6 La séquence de tir

### 1. Choisir une arme

L'attaquant choisit une arme de tir de l'agent actif. Il prend autant de D6 que la valeur d'Att de l'arme : ce sont ses **dés d'attaque**.

### 2. Choisir une cible valide (*valid target*)

La cible doit être un agent ennemi qui est une cible valide, et **aucun agent ami de l'attaquant** ne doit se trouver dans sa zone de contrôle.

| Ordre de la cible | Cible valide si… |
|---|---|
| Engagement | elle est visible |
| Dissimulation | elle est visible **et pas à couvert** |

### 3. Lancer les dés d'attaque

Chaque dé dont le résultat est **supérieur ou égal à la CT** est une **réussite**. On le conserve. Les autres dés sont des **échecs** et sont écartés.
- Un **6** est toujours une **réussite critique** (*critical success*).
- Les autres réussites sont des **réussites normales** (*normal successes*).
- Un **1** est toujours un échec.

**Si la cible est gênée :**
- l'attaquant doit écarter une réussite de son choix ;
- toutes ses réussites critiques deviennent des réussites normales et ne peuvent plus redevenir critiques. Cette règle prime sur toutes les autres.

### 4. Lancer les dés de défense

Le défenseur prend **3 dés de défense**.
- **Si la cible est à couvert**, il peut conserver une réussite normale sans la lancer : c'est la **sauvegarde de couvert** (*cover save*). Il lance les dés restants.
- Chaque dé dont le résultat est supérieur ou égal à la Sauvegarde de la cible est une réussite. Le 6 est une réussite critique et le 1 est toujours un échec.

### 5. Résoudre les dés de défense

Le défenseur répartit ses réussites pour **bloquer** les réussites d'attaque :
- 1 réussite normale bloque 1 réussite normale ;
- **2 réussites normales** bloquent 1 réussite critique ;
- 1 réussite critique bloque 1 réussite normale ou 1 réussite critique.

### 6. Résoudre les dés d'attaque

Chaque réussite d'attaque non bloquée inflige ses dégâts à la cible :
- une réussite normale inflige les dégâts normaux de l'arme ;
- une réussite critique inflige les dégâts critiques de l'arme.

Les agents mis hors de combat ne sont retirés qu'à la fin de l'action (chapitre 6).

> [!NOTE]
> **Exemple**
>
> L'arme a Att 4, CT 3+, Dég 3/4. Les dés d'attaque donnent 6, 4, 3, 1 : 1 réussite critique et 2 réussites normales. La cible, en Engagement et à couvert, a une Sauvegarde de 4+. Elle prend 1 sauvegarde de couvert et lance 2 dés : 5 et 2. Elle a donc 2 réussites normales, qui bloquent les 2 réussites normales de l'attaquant. La réussite critique passe : la cible subit 4 dégâts.

> [!NOTE]
> **Cas particulier**
>
> Si vous êtes à la fois attaquant et défenseur, par exemple quand une arme à Explosion touche un de vos agents, vous lancez les dés d'attaque et les dés de défense.

## 4.7 Récapitulatif

> [!IMPORTANT]
> **Couvert et gêne**
>
> | | Condition | Effet |
> |---|---|---|
> | **À couvert** | décor en interposition dans la zone de contrôle de la cible ; tireur à plus de 2" | Dissimulation : pas une cible valide. Engagement : 1 sauvegarde de couvert |
> | **Gêné** | décor Lourd en interposition, sans compter les parties à 1" ou moins de l'un des agents | l'attaquant écarte 1 réussite ; ses critiques deviennent normales |
