# Chapitre 10 : Règles avancées

## 10.1 Garde (*Guard*), 1 PA

Cette action n'existe que dans les killzones en espace confiné : Gallowdark et Tomb World.

- L'agent se met **en garde** (*on guard*). La Garde compte comme une action de Tir.
- Interdit en Dissimulation, et si l'agent est dans la zone de contrôle d'un ennemi.
- Interdit en contre-action.

**L'agent reste en garde jusqu'à ce que :**
- il effectue une action, se déplace ou soit redéployé ;
- un ennemi termine une action dans sa zone de contrôle sans que vous interrompiez l'activation ;
- son ordre change ;
- le tour suivant commence.

**Interrompre** (*On Guard*). Une fois par activation ennemie, juste après une action de l'agent ennemi, vous pouvez interrompre l'activation. Un de vos agents en garde effectue alors gratuitement un **Tir** ou un **Combat**, ou une action qui compte comme telle.
- Vous choisissez la cible normalement : ce n'est pas forcément l'agent interrompu.
- L'agent qui a interrompu ne peut plus faire de contre-action ce tour-ci.

**Tir à bout portant** : pendant cette interruption, l'agent en garde peut tirer même s'il est dans la zone de contrôle d'un ennemi. Dans ce cas :
- il doit viser cet ennemi, même si ce n'est normalement pas une cible valide ;
- la CT de ses armes est dégradée de 1 ;
- jusqu'à la fin de l'activation interrompue, il ne peut pas riposter.

> [!TIP]
> **Astuce**
>
> La Garde permet de tenir un couloir : l'ennemi qui y entre se fait tirer dessus au moment que vous choisissez. Évitez la ligne de vue des agents ennemis en garde.

## 10.2 Ordre de résolution et priorité (*precedence*)

Quand deux règles se contredisent, celle qui l'emporte est déterminée dans l'ordre suivant :

1. la règle qui précise qu'elle prime ;
2. la règle tranchée par le commentaire des concepteurs (*designer's commentary*), publié en ligne ;
3. la règle qui ne figure pas dans le livre de base (règles d'équipe, de mission…) ;
4. la règle qui dit « ne peut pas » ;
5. le choix du joueur qui contrôle l'agent actif ;
6. le choix du joueur qui a l'initiative.

> [!NOTE]
> **Exemple**
>
> La fiche d'un agent dit « peut effectuer deux actions de Tir pendant son activation ». Elle l'emporte sur la règle « une même action une seule fois par activation », en vertu du point 3.

**Moment d'activation** : on résout d'abord les règles qui se déclenchent quand un agent « serait » activé, puis celles qui se déclenchent quand il « est » activé, en commençant par celles qui infligent des dégâts.

## 10.3 Règles d'armes

- Une arme ne cumule pas plusieurs fois la même règle. Exception : pour une règle avec une valeur x, on choisit la valeur à utiliser.
- Si plusieurs règles d'une arme s'appliquent en même temps, c'est vous qui choisissez leur ordre.

| Règle | Effet |
|---|---|
| **Précis x** (*Accurate x*) | Conservez jusqu'à x dés d'attaque comme réussites normales, sans les lancer. Deux instances de Précis peuvent être traitées comme Précis 2. |
| **Équilibré** (*Balanced*) | Relancez un de vos dés d'attaque. |
| **Explosion x** (*Blast x*) | Après avoir tiré sur la cible principale, tirez sur chaque cible secondaire, dans l'ordre de votre choix, avec un jet séparé pour chacune. Les cibles secondaires sont les autres agents visibles et à x" ou moins de la cible principale, amis compris. Elles sont valides même en Dissimulation, et à couvert ou masquées si la cible principale l'était. |
| **Brutal** | L'adversaire ne peut parer qu'avec des réussites critiques. |
| **Incessant** (*Ceaseless*) | Relancez tous vos dés d'attaque qui affichent un même résultat de votre choix, par exemple tous les 2. |
| **Dévastateur x** (*Devastating x*) | Chaque réussite critique conservée inflige immédiatement x dégâts. La réussite reste résolue normalement ensuite. Sous la forme **y" Dévastateur x**, les x dégâts touchent aussi chaque autre agent visible et à y" ou moins de la cible. |
| **Lourde** (*Heavy*) | L'agent ne peut pas utiliser l'arme pendant une activation ou une contre-action où il s'est déplacé, ni se déplacer après l'avoir utilisée. **Lourde (x uniquement)** autorise seulement le déplacement x, par exemple Lourde (Course uniquement). N'empêche pas la Garde. |
| **Surchauffe** (*Hot*) | Après utilisation, lancez 1D6. Si le résultat est inférieur à la CT de l'arme, l'agent subit des dégâts égaux au double du résultat. On ne lance qu'un dé par action. |
| **Létal x+** (*Lethal x+*) | Vos réussites de x ou plus sont critiques. |
| **Limitée x** (*Limited x*) | L'arme est perdue après x utilisations dans la bataille. Une action compte pour une utilisation, même avec Explosion. |
| **Perforant x** (*Piercing x*) | Le défenseur prend x dés de défense en moins. **Perforant Critique x** (*Piercing Crits x*) ne s'applique que si vous conservez au moins une réussite critique. |
| **Punitif** (*Punishing*) | Si vous conservez au moins une réussite critique, vous pouvez conserver un échec comme réussite normale. |
| **Portée x** (*Range x*) | Seuls les agents à x" ou moins peuvent être des cibles valides. |
| **Implacable** (*Relentless*) | Relancez autant de dés d'attaque que vous voulez. |
| **Perce-armure** (*Rending*) | Si vous conservez au moins une réussite critique, une de vos réussites normales devient critique. |
| **Saturation** (*Saturate*) | Le défenseur ne peut pas utiliser de sauvegarde de couvert. |
| **Traque** (*Seek*) | Pour le choix de la cible, le décor ne donne pas de couvert. **Traque légère** (*Seek Light*) : seul le décor Léger ne donne pas de couvert. La sauvegarde de couvert reste due. |
| **Sévère** (*Severe*) | Si vous ne conservez aucune réussite critique, une réussite normale devient critique. Dévastateur et Perforant Critique s'appliquent, mais pas Punitif ni Perce-armure. |
| **Choc** (*Shock*) | La première fois que vous frappez avec une réussite critique pendant une séquence, écartez aussi une réussite normale adverse non résolue, ou une critique s'il n'y en a pas. |
| **Silencieux** (*Silent*) | L'agent peut tirer avec cette arme même en Dissimulation. |
| **Étourdissant** (*Stun*) | Si vous conservez au moins une réussite critique, la cible perd 1 LPA jusqu'à la fin de sa prochaine activation. |
| **Torrent x** | Choisissez une cible valide, puis autant d'autres cibles valides que vous voulez, à x" ou moins d'elle et hors de la zone de contrôle de vos agents. Tirez sur toutes, dans l'ordre de votre choix, avec un jet séparé pour chacune. |

> [!TIP]
> **Astuce**
>
> Un dé ne peut être conservé qu'une fois. Un dé conservé grâce à Précis ne peut donc pas devenir critique avec Perce-armure. Sévère fait exception, car cette règle modifie un dé déjà conservé.
