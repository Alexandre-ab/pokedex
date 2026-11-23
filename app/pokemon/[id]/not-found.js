import Link from "next/link";

// Affiché quand l'id dans l'URL n'est pas un Pokémon valide (1 à 1025).
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center dark:bg-black">
      <p className="text-xl font-medium text-zinc-900 dark:text-zinc-50">
        Pokémon introuvable
      </p>
      <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
        ← Retour au Pokédex
      </Link>
    </div>
  );
}
