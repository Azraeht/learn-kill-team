# Chapitre 7 : Objectifs et marqueurs

## 7.1 Marqueurs

- Un marqueur est posé à un endroit précis, qui doit être un emplacement où il peut être posé.
- On peut le poser sous un agent, en retirant l'agent temporairement, et un agent peut se tenir dessus.
- **Diamètre** : 40 mm pour un **marqueur d'objectif**, 20 mm pour tous les autres.
- **Marqueur de mission** (*mission marker*) : ce terme n'a pas d'effet par lui-même, mais d'autres règles s'y réfèrent.
- Un élément posé sur un marqueur qui se trouve au sol est lui aussi considéré comme au sol.

## 7.2 Disputer et contrôler

- Un agent **dispute** (*contests*) tous les marqueurs qui se trouvent dans sa zone de contrôle.
- Un camp **contrôle** (*controls*) un marqueur si la **somme des LPA** de ses agents qui le disputent est **supérieure** à celle des agents ennemis qui le disputent.
- Le contrôle ne peut pas changer pendant une action.

> [!NOTE]
> **Exemple**
>
> Deux agents blancs (LPA 2 chacun, soit 4 au total) et un agent orange (LPA 2) disputent un objectif. Un second agent orange est à 1" de l'objectif, mais un mur le lui cache : il n'est pas dans sa zone de contrôle et ne compte pas. Le score est de 4 contre 2 : les blancs contrôlent l'objectif.

## 7.3 Porter un marqueur

Un agent qui **porte** un marqueur est le seul à le disputer et à le contrôler. Le marqueur se déplace avec lui et se trouve à la même distance que lui pour toutes les règles.

### Ramasser un marqueur (*Pick Up Marker*), 1 PA

- Retirez un marqueur que l'agent contrôle et qui peut être ramassé : l'agent le porte désormais.
- Interdit si l'agent est dans la zone de contrôle d'un ennemi, ou s'il porte déjà un marqueur.

La mission ou les règles d'équipe indiquent quels marqueurs peuvent être ramassés.

### Poser un marqueur (*Place Marker*), 1 PA

- Posez le marqueur porté dans la zone de contrôle de l'agent.
- Interdit si l'agent a ramassé ce marqueur pendant la même activation.
- Si l'agent est mis hors de combat, il **doit** poser le marqueur avant d'être retiré, pour 0 PA. Cette règle prime sur toute interdiction.

> [!TIP]
> **Astuce**
>
> Un agent en Dissimulation peut ramasser, poser et contrôler des objectifs. Les actions de mission se font souvent avec des agents dissimulés.
