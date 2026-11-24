import { Skeleton } from "@/components/ui/skeleton";

// Squelette de la fiche, utilisé comme fallback à la fois dans le <Suspense>
// de app/pokemon/[id]/page.js et dans app/pokemon/[id]/loading.js.
// Il reprend la mise en page de la fiche (visuel à gauche, informations à
// droite) pour que rien ne "saute" quand les données arrivent.
export default function PokemonDetailSkeleton() {
  return (
    <div className="flex-1 bg-background px-4 pt-5 pb-10 sm:px-6 lg:px-10 lg:pt-8">
      <main aria-busy="true" className="mx-auto max-w-6xl">
        {/* Annoncé aux lecteurs d'écran pendant le chargement. */}
        <p className="sr-only">Chargement de la fiche…</p>

        {/* Retour à l'index. */}
        <div className="flex min-h-11 items-center">
          <Skeleton className="h-4 w-36 rounded-full" />
        </div>

        <div className="mt-3 grid overflow-hidden rounded-3xl bg-card shadow-soft dark:ring-1 dark:ring-border lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* Visuel + navigation. */}
          <div className="flex flex-col gap-2 p-2">
            <div className="flex aspect-square flex-1 items-center justify-center rounded-2xl bg-muted sm:aspect-[5/4] lg:aspect-auto lg:min-h-[28rem]">
              <Skeleton className="size-56 rounded-full sm:size-64 lg:size-72" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-11 flex-1 rounded-xl" />
              <Skeleton className="h-11 flex-1 rounded-xl" />
            </div>
          </div>

          {/* Informations : nom, types, description, tuiles, statistiques. */}
          <div className="flex flex-col p-4 sm:p-6">
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="mt-3 h-12 w-3/4 rounded-2xl" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-5 h-20 w-full rounded-2xl" />
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-2xl" />
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3">
                  <Skeleton className="h-3 w-14 rounded-full" />
                  <Skeleton className="h-3 rounded-full" />
                  <Skeleton className="h-3 w-8 justify-self-end rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
