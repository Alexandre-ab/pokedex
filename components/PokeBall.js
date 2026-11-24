// Poké Ball en SVG maison (pas l'image officielle), version douce et
// arrondie : moitié haute de la couleur `color` (currentColor par défaut,
// donc text-primary = accent), moitié basse claire, bande centrale et bouton.
// Le contour suit la couleur du texte du thème (stroke-foreground) : lisible
// en clair comme en sombre.
// Purement décorative par défaut (aria-hidden), sauf si on lui donne un
// aria-label explicite. API : size, color, className.
export default function PokeBall({
  size = 24,
  color = "var(--primary)",
  className,
  "aria-label": ariaLabel,
  ...props
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : "true"}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      focusable="false"
      {...props}
    >
      {/* Moitié basse : fond de carte, pour rester claire en mode sombre. */}
      <path d="M3 16a13 13 0 0 0 26 0z" className="fill-card" />
      {/* Moitié haute : aplat de couleur. */}
      <path d="M3 16a13 13 0 0 1 26 0z" fill={color} />

      {/* Contour, bande centrale et bouton (traits arrondis). */}
      <circle cx="16" cy="16" r="13" fill="none" className="stroke-foreground" strokeWidth="2" />
      <line x1="3" y1="16" x2="29" y2="16" className="stroke-foreground" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="4" className="fill-card stroke-foreground" strokeWidth="2" />
    </svg>
  );
}
