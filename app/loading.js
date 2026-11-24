import { ViewTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Affiché pendant que l'accueil (app/page.js) charge ses données.
// Reprend la structure de la page : titre, barre de recherche, puis cartes
// arrondies. Seuls les contenus sont remplacés par des blocs qui pulsent.
export default function Loading() {
  return (
    <ViewTransition exit="slide-down">
      <div className="flex-1 bg-background px-4 pt-6 pb-10 sm:px-6 lg:px-10 lg:pt-10">
        <main aria-busy="true" className="mx-auto max-w-7xl">
          <p className="sr-only">Chargement de l&apos;index…</p>

          {/* En-tête */}
          <div className="pb-2">
            <Skeleton className="h-10 w-48 rounded-xl sm:h-12" />
            <Skeleton className="mt-3 h-4 w-full max-w-xl rounded-lg" />
          </div>

          {/* Barre de recherche */}
          <div className="mt-4 pt-3 pb-5">
            <div className="h-[6.5rem] rounded-2xl bg-card shadow-soft sm:h-[3.75rem]" />
          </div>

          {/* Cartes : numéro, illustration, nom, types, actions. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="flex flex-col rounded-2xl bg-card p-3 shadow-soft">
                <Skeleton className="h-4 w-12 rounded-lg" />
                <Skeleton className="mt-2 aspect-square rounded-xl" />
                <Skeleton className="mt-3 h-5 w-3/4 rounded-lg" />
                <Skeleton className="mt-2 h-5 w-16 rounded-full" />
                <div className="mt-3 flex gap-2">
                  <Skeleton className="h-10 flex-1 rounded-xl" />
                  <Skeleton className="h-10 flex-1 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </ViewTransition>
  );
}
