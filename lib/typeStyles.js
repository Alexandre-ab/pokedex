// Pour chaque type de Pokémon : le libellé en français et les classes
// Tailwind qui lisent la couleur depuis les variables de thème
// --type-{nom} / --type-{nom}-foreground (définies dans app/globals.css,
// avec leurs valeurs clair et sombre). Changer la couleur d'un type se fait
// donc à un seul endroit, dans globals.css.
export const TYPE_STYLES = {
  normal: { label: "Normal", classes: "bg-type-normal text-type-normal-foreground" },
  fire: { label: "Feu", classes: "bg-type-fire text-type-fire-foreground" },
  water: { label: "Eau", classes: "bg-type-water text-type-water-foreground" },
  electric: { label: "Électrik", classes: "bg-type-electric text-type-electric-foreground" },
  grass: { label: "Plante", classes: "bg-type-grass text-type-grass-foreground" },
  ice: { label: "Glace", classes: "bg-type-ice text-type-ice-foreground" },
  fighting: { label: "Combat", classes: "bg-type-fighting text-type-fighting-foreground" },
  poison: { label: "Poison", classes: "bg-type-poison text-type-poison-foreground" },
  ground: { label: "Sol", classes: "bg-type-ground text-type-ground-foreground" },
  flying: { label: "Vol", classes: "bg-type-flying text-type-flying-foreground" },
  psychic: { label: "Psy", classes: "bg-type-psychic text-type-psychic-foreground" },
  bug: { label: "Insecte", classes: "bg-type-bug text-type-bug-foreground" },
  rock: { label: "Roche", classes: "bg-type-rock text-type-rock-foreground" },
  ghost: { label: "Spectre", classes: "bg-type-ghost text-type-ghost-foreground" },
  dragon: { label: "Dragon", classes: "bg-type-dragon text-type-dragon-foreground" },
  dark: { label: "Ténèbres", classes: "bg-type-dark text-type-dark-foreground" },
  steel: { label: "Acier", classes: "bg-type-steel text-type-steel-foreground" },
  fairy: { label: "Fée", classes: "bg-type-fairy text-type-fairy-foreground" },
};
