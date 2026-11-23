import Image from "next/image";

// Une carte pour un seul Pokémon : image, numéro (#001) et nom.
export default function PokemonCard({ pokemon }) {
  const { id, name, image } = pokemon;
  const number = String(id).padStart(3, "0");

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <Image
        src={image}
        alt={name}
        width={120}
        height={120}
        className="h-24 w-24 object-contain sm:h-28 sm:w-28"
      />
      <p className="text-sm text-zinc-500 dark:text-zinc-400">#{number}</p>
      <p className="text-sm font-medium capitalize text-zinc-900 dark:text-zinc-50">
        {name}
      </p>
    </div>
  );
}
