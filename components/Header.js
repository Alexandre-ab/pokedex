"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Heart, Backpack } from "lucide-react";
import { useFavoritesStore } from "@/store/favorites";
import { useTeamStore } from "@/store/team";
import { MAX_TEAM_SIZE } from "@/lib/team";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import ThemeToggle from "@/components/ThemeToggle";
import PokeballIcon from "@/components/PokeballIcon";

// En-tête global : liens Pokédex et Favoris, tiroir rapide de la sacoche
// (en plus de la page /sacoche), et bascule clair/sombre.
// C'est ici qu'on déclenche la réhydratation des stores des favoris et de
// la sacoche (une seule fois, après le montage côté client), puisque Header
// est présent sur toutes les pages via app/layout.js.
// "namesById" (venu de app/layout.js, Server Component) permet d'afficher
// le nom français de chaque Pokémon de la sacoche dans le tiroir.
export default function Header({ namesById = {} }) {
  useEffect(() => {
    useFavoritesStore.persist.rehydrate();
    useTeamStore.persist.rehydrate();
  }, []);

  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length);

  const teamHasHydrated = useTeamStore((state) => state.hasHydrated);
  const teamIds = useTeamStore((state) => state.teamIds);
  const remove = useTeamStore((state) => state.remove);

  // Avant l'hydratation, on affiche toujours 0 pour que le serveur et le
  // client rendent exactement le même HTML.
  const nombreFavoris = hasHydrated ? favoriteCount : 0;
  const nombreDansLaSacoche = teamHasHydrated ? teamIds.length : 0;

  return (
    <>
      {/* Lien d'évitement : permet au clavier de sauter directement au
          contenu, sans devoir parcourir tous les liens de l'en-tête. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Passer au contenu principal
      </a>
      <header className="site-header border-b border-border bg-background">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-xl font-bold text-foreground"
          >
            <PokeballIcon className="size-6" />
            Pokédex
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" render={<Link href="/favoris" />} nativeButton={false}>
              <Heart data-icon="inline-start" />
              Favoris
              <Badge variant="secondary">{nombreFavoris}</Badge>
            </Button>

            <Sheet>
              <SheetTrigger render={<Button variant="ghost" />}>
                <Backpack data-icon="inline-start" />
                Sacoche
                <Badge variant="secondary">
                  {nombreDansLaSacoche}/{MAX_TEAM_SIZE}
                </Badge>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    Sacoche ({nombreDansLaSacoche}/{MAX_TEAM_SIZE})
                  </SheetTitle>
                  <SheetDescription>Ton équipe actuelle.</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-2 px-4">
                  {teamIds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      La sacoche est vide.
                    </p>
                  ) : (
                    teamIds.map((id) => (
                      <div
                        key={id}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                      >
                        <span className="text-sm font-medium text-foreground">
                          #{String(id).padStart(3, "0")} {namesById[id] ?? ""}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => remove(id)}>
                          Retirer
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <SheetFooter>
                  <Button render={<Link href="/sacoche" />} nativeButton={false}>
                    Voir la sacoche complète
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <ThemeToggle />
          </div>
        </nav>
      </header>
    </>
  );
}
