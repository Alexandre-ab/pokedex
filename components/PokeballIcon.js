// Icône de Poké Ball dessinée à la main (SVG maison, pas l'image officielle).
// Purement décorative à côté du texte "Pokédex" : masquée aux lecteurs d'écran.
export default function PokeballIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 12a10 10 0 0 1 20 0z" fill="#e3350d" />
      <path d="M2 12a10 10 0 0 0 20 0z" fill="#ffffff" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="#111318" strokeWidth="1.4" />
      <rect x="2" y="11" width="20" height="2" fill="#111318" />
      <circle cx="12" cy="12" r="3.2" fill="#ffffff" stroke="#111318" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="1.3" fill="#ffffff" />
    </svg>
  );
}
