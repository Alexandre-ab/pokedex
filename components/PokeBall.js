// Poké Ball en SVG maison (pas l'image officielle). Purement décorative par
// défaut (aria-hidden), sauf si on lui donne un aria-label explicite.
export default function PokeBall({
  size = 24,
  color = "currentColor",
  className,
  "aria-label": ariaLabel,
  ...props
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaLabel ? undefined : "true"}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      focusable="false"
      {...props}
    >
      <path d="M2 12a10 10 0 0 1 20 0z" fill={color} />
      <path d="M2 12a10 10 0 0 0 20 0z" fill="#ffffff" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="#111318" strokeWidth="1.4" />
      <rect x="2" y="11" width="20" height="2" fill="#111318" />
      <circle cx="12" cy="12" r="3.2" fill="#ffffff" stroke="#111318" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="1.3" fill="#ffffff" />
    </svg>
  );
}
