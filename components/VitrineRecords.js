import Image from "next/image";
import Link from "next/link";
import { Aperture } from "lucide-react";
import { TYPE_STYLES } from "@/lib/typeStyles";
import { illustrationNormale, numeroSurQuatre, separerMilliers } from "@/lib/vitrine";

// ---------------------------------------------------------------------------
// Panthéon des records (section « abysse », la plus profonde de la page).
// Server Component : aucun JavaScript envoyé au navigateur, survols en CSS.
//
// Une carte = un record : sa valeur en mono géante, l'illustration officielle
// et un lien vers la fiche. La « carte à œillet » est percée d'un trou rond
// en bas à droite (utilitaire carte-oeillet) où se loge la pastille du type.
// Grille 3×2 alignée sur desktop (cartes de même hauteur). Pas de nom de transition partagé sur les illustrations : ces Pokémon
// sont aussi dans le catalogue (deux noms identiques casseraient la View
// Transition).
//
// records : [{ id, titre, nom, types, nombre, unite, exAequo: [{ id, nom }] }]
// (préparés dans app/page.js à partir des fiches PokéAPI en cache).
// total : nombre d'espèces du Pokédex (1 025).
// ---------------------------------------------------------------------------
export default function VitrineRecords({ records, total }) {
  return (
    <section
      aria-labelledby="titre-records"
      className="relative isolate rounded-[1.75rem] bg-vitrine-abysse sm:rounded-[2.5rem]"
    >
      {/* Classe « dark » : tokens en version sombre (accent #FF5A6E, 6,46:1
          sur l'abysse ; couleurs de type sombres pour les pastilles). */}
      <div className="dark px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div>
              <p className="text-index tracking-[0.04em] text-vitrine-brume uppercase">Panthéon des records</p>
              <h2 id="titre-records" className="titre-section mt-3 max-w-[16ch] text-vitrine-os">
                Six records, un seul <span className="mot-cle">panthéon</span>.
              </h2>
            </div>
            <p className="max-w-sm text-base leading-relaxed text-pretty text-vitrine-brume">
              Les champions de chaque mesure parmi les {separerMilliers(total)} espèces, d&apos;après
              les statistiques de base de PokéAPI.
            </p>
          </div>

          <ul className="mt-[clamp(2rem,1.5rem+2vw,3.5rem)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {records.map((record) => {
              const typePrincipal = record.types[0];
              const libellesTypes = record.types.map((type) => TYPE_STYLES[type]?.label ?? type).join(" / ");
              return (
                <li key={record.id} className="h-full">
                  <Link
                    href={`/pokemon/${record.id}`}
                    transitionTypes={["nav-forward"]}
                    className="group/record relative isolate flex h-full flex-col rounded-3xl p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:p-6"
                  >
                    {/* Fond de la carte : filet de 1 px (3,21:1 sur l'abysse)
                        et trou de l'œillet (décoratif). */}
                    <span
                      aria-hidden="true"
                      className="carte-oeillet absolute inset-0 -z-10 rounded-3xl border border-vitrine-filet bg-vitrine-nuit/50 motion-safe:transition-colors motion-safe:duration-300 group-hover/record:bg-vitrine-nuit"
                    />

                    <p className="text-index tracking-[0.04em] text-vitrine-brume uppercase">{record.titre}</p>
                    <p className="mt-2 font-mono text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] leading-none whitespace-nowrap font-bold tracking-[-0.04em] text-vitrine-os tabular-nums">
                      {record.nombre}
                      {record.unite && " "}
                      {record.unite && (
                        <span className="text-[0.4em] font-medium tracking-normal text-vitrine-brume">
                          {record.unite}
                        </span>
                      )}
                    </p>

                    <Image
                      src={illustrationNormale(record.id)}
                      alt=""
                      width={475}
                      height={475}
                      sizes="(min-width: 640px) 160px, 144px"
                      className="mx-auto my-4 h-36 w-36 object-contain sm:h-40 sm:w-40 motion-safe:transition-transform motion-safe:duration-[260ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/record:scale-105"
                    />

                    {/* Légende : à gauche de l'œillet (pr-16 lui laisse la place). */}
                    <div className="mt-auto pr-16">
                      <p className="font-heading text-xl leading-tight font-bold tracking-tight text-vitrine-os">
                        {record.nom}
                      </p>
                      <p className="mt-1 text-index text-vitrine-brume">
                        #{numeroSurQuatre(record.id)} · {libellesTypes}
                      </p>
                      {record.exAequo.length > 0 && (
                        <p className="mt-1 text-sm text-vitrine-brume">
                          Ex æquo avec{" "}
                          {record.exAequo.map((autre) => `${autre.nom} (#${numeroSurQuatre(autre.id)})`).join(", ")}
                        </p>
                      )}
                    </div>

                    {/* A10 — Pastille de l'œillet, couleur du type principal ;
                        elle tourne d'un quart de tour au survol. */}
                    <span
                      aria-hidden="true"
                      style={{
                        backgroundColor: `var(--type-${typePrincipal})`,
                        color: `var(--type-${typePrincipal}-foreground)`,
                      }}
                      className="absolute right-3 bottom-3 flex size-12 items-center justify-center rounded-full motion-safe:transition-transform motion-safe:duration-[260ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/record:rotate-90"
                    >
                      <Aperture className="size-5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
