"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Library, Heart, Backpack, ArrowUpRight } from "lucide-react";
import { useFavoritesStore } from "@/store/favorites";
import { useTeamStore } from "@/store/team";
import { MAX_TEAM_SIZE } from "@/lib/team";
import { Button } from "@/components/ui/button";
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
import PokeBall from "@/components/PokeBall";

// Navigation globale, douce et ergonomique.
// - Desktop (lg et +) : un RAIL LATÉRAL FIXE à gauche (w-60, fond uni) avec
//   la marque, l'accès rapide Index / Favoris / Sacoche (compteurs clairs),
//   un mini-aperçu rond des 6 emplacements de l'équipe (ouvre le tiroir) et
//   le bouton de thème en bas.
// - Mobile (< lg) : un bandeau supérieur léger NON fixe (logo + thème) et un
//   DOCK flottant en pilule en bas d'écran (Index, Favoris, Sacoche).
// Les deux versions existent dans le HTML ; c'est le CSS (hidden / lg:flex)
// qui choisit laquelle afficher — aucun calcul de taille d'écran en JS,
// donc aucun risque d'erreur d'hydratation.
//
// C'est aussi ici qu'on déclenche la réhydratation des stores des favoris
// et de la sacoche (une seule fois, après le montage côté client), puisque
// Header est présent sur toutes les pages via app/layout.js.
// "namesById" (venu de app/layout.js, Server Component) permet d'afficher
// le nom français de chaque Pokémon de la sacoche.

// Illustration officielle d'un Pokémon (même source que les cartes).
function illustration(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

// Numéro sur 4 chiffres : 25 -> "0025" (affiché #0025).
function numeroArchive(id) {
  return String(id).padStart(4, "0");
}

// Un lien est "actif" si on est sur sa page. L'Index reste actif sur les
// fiches détaillées (/pokemon/...), qui en font partie.
function estActif(pathname, href) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/pokemon");
  return pathname === href;
}

// Petit composant qui lit l'URL. Avec `cacheComponents: true`, usePathname()
// dépend de la requête : il doit être sous <Suspense> pour que le reste du
// Header puisse être pré-rendu au build.
function HeaderAvecChemin({ namesById }) {
  const pathname = usePathname();
  return <HeaderContenu namesById={namesById} pathname={pathname} />;
}

// Point d'entrée : le shell est pré-rendu avec pathname="" (aucun lien actif)
// en attendant l'URL ; même mise en page, donc ni clignotement ni décalage.
export default function Header({ namesById = {} }) {
  return (
    <Suspense fallback={<HeaderContenu namesById={namesById} pathname="" />}>
      <HeaderAvecChemin namesById={namesById} />
    </Suspense>
  );
}

function HeaderContenu({ namesById, pathname }) {
  useEffect(() => {
    useFavoritesStore.persist.rehydrate();
    useTeamStore.persist.rehydrate();
  }, []);

  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length);

  const teamHasHydrated = useTeamStore((state) => state.hasHydrated);
  const teamIds = useTeamStore((state) => state.teamIds);
  const remove = useTeamStore((state) => state.remove);

  // Avant l'hydratation, on affiche toujours 0 (et une équipe vide) pour
  // que le serveur et le client rendent exactement le même HTML.
  const nombreFavoris = hasHydrated ? favoriteCount : 0;
  const equipe = teamHasHydrated ? teamIds : [];
  const nombreDansLaSacoche = equipe.length;

  // Les 6 emplacements du plateau : un id de Pokémon, ou null si vide.
  const emplacements = Array.from(
    { length: MAX_TEAM_SIZE },
    (_, index) => equipe[index] ?? null
  );

  // Total de l'index, calculé depuis les noms reçus (repli sur 1025).
  const totalIndex = Object.keys(namesById).length || 1025;

  // Les entrées du sommaire (rail desktop). "compteur" est affiché en mono ;
  // "lecteur" est la version lue par les lecteurs d'écran.
  const liens = [
    {
      href: "/",
      label: "Index",
      Icone: Library,
      compteur: String(totalIndex),
      lecteur: `${totalIndex} Pokémon`,
    },
    {
      href: "/favoris",
      label: "Favoris",
      Icone: Heart,
      compteur: String(nombreFavoris),
      lecteur: `${nombreFavoris} favori${nombreFavoris > 1 ? "s" : ""}`,
    },
    {
      href: "/sacoche",
      label: "Sacoche",
      Icone: Backpack,
      compteur: `${nombreDansLaSacoche}/${MAX_TEAM_SIZE}`,
      lecteur: `${nombreDansLaSacoche} sur ${MAX_TEAM_SIZE}`,
    },
  ];

  const libelleApercu = `Aperçu de la sacoche : ${nombreDansLaSacoche} Pokémon sur ${MAX_TEAM_SIZE}`;

  return (
    // Une seule sacoche (Sheet) partagée : l'aperçu d'équipe du rail ET le
    // bouton Sacoche du dock l'ouvrent tous les deux (deux déclencheurs,
    // un seul tiroir).
    <Sheet>
      {/* Lien d'évitement : permet au clavier de sauter directement au
          contenu, sans devoir parcourir tous les liens de la navigation. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-primary-foreground focus:shadow-float focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Passer au contenu principal
      </a>

      {/* ============ MOBILE : bandeau supérieur léger (non fixe) ============ */}
      <header className="lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <Link href="/" className="flex items-center gap-2.5 rounded-full py-1 pr-3 text-foreground">
            <PokeBall size={32} />
            <span className="font-heading text-xl font-bold tracking-tight">Pokédex</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* ============ DESKTOP : rail latéral fixe ============ */}
      <header className="fixed inset-y-0 left-0 z-30 hidden w-rail flex-col gap-6 overflow-y-auto border-r border-sidebar-border bg-sidebar px-3 py-5 lg:flex">
        {/* Marque : Poké Ball + titre. La Poké Ball pivote d'un demi-tour au
            survol (désactivé si l'utilisateur préfère moins d'animations). */}
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl px-3 py-2 text-foreground"
        >
          <PokeBall
            size={36}
            className="motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:rotate-180"
          />
          <span className="font-heading text-2xl font-bold tracking-tight">Pokédex</span>
        </Link>

        {/* Accès rapide : cibles de 44 px minimum, lien actif en pastille
            arrondie, compteur clair à droite. */}
        <nav aria-label="Navigation principale">
          <ul className="flex flex-col gap-1">
            {liens.map(({ href, label, Icone, compteur, lecteur }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={estActif(pathname, href) ? "page" : undefined}
                  className="group/lien flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-foreground motion-safe:transition-colors motion-safe:duration-200"
                >
                  <Icone
                    className="size-5 shrink-0 group-aria-[current=page]/lien:text-primary"
                    aria-hidden="true"
                  />
                  <span className="flex-1">{label}</span>
                  <span
                    aria-hidden="true"
                    className="text-index min-w-8 rounded-full bg-muted px-2 py-0.5 text-center text-foreground"
                  >
                    {compteur}
                  </span>
                  <span className="sr-only">, {lecteur}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Aperçu de l'équipe : 6 pastilles rondes, remplies en temps réel.
            Un clic (n'importe où sur le bloc) ouvre le tiroir de la sacoche. */}
        <SheetTrigger
          aria-label={libelleApercu}
          className="group/equipe block w-full rounded-2xl border border-border bg-card p-4 text-left shadow-soft hover:border-rule-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-safe:transition-colors motion-safe:duration-200"
        >
          <span className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Mon équipe</span>
            <span className="text-index text-muted-foreground">
              {nombreDansLaSacoche}/{MAX_TEAM_SIZE}
            </span>
          </span>
          <span className="mt-3 grid grid-cols-3 justify-items-center gap-2">
            {emplacements.map((id, index) =>
              id ? (
                <span
                  key={`pokemon-${id}`}
                  title={namesById[id] ?? undefined}
                  className="flex size-12 items-center justify-center rounded-full bg-muted motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-75 motion-safe:duration-300"
                >
                  <Image
                    src={illustration(id)}
                    alt=""
                    width={48}
                    height={48}
                    sizes="48px"
                    className="size-10 object-contain"
                  />
                </span>
              ) : (
                <span
                  key={`vide-${index}`}
                  className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-border text-xs text-muted-foreground"
                >
                  {index + 1}
                </span>
              )
            )}
          </span>
          <span className="mt-3 flex items-center justify-between text-xs font-medium text-muted-foreground group-hover/equipe:text-foreground">
            Ouvrir l&apos;aperçu
            <ArrowUpRight className="size-4 motion-safe:transition-transform motion-safe:duration-200 group-hover/equipe:translate-x-0.5 group-hover/equipe:-translate-y-0.5" aria-hidden="true" />
          </span>
        </SheetTrigger>

        {/* Pied du rail : thème, tout en bas. */}
        <div className="mt-auto">
          <ThemeToggle withLabel />
        </div>
      </header>

      {/* ============ MOBILE : dock flottant en pilule ============ */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-sm lg:hidden"
      >
        <ul className="grid grid-cols-3 gap-1 rounded-full border border-border bg-card p-1.5 shadow-float">
          {liens.slice(0, 2).map(({ href, label, Icone, lecteur }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={estActif(pathname, href) ? "page" : undefined}
                className="flex h-14 flex-col items-center justify-center gap-0.5 rounded-full text-xs font-medium text-muted-foreground aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-foreground motion-safe:transition-colors motion-safe:duration-200"
              >
                <span className="relative">
                  <Icone className="size-5" aria-hidden="true" />
                  {/* Badge du nombre de favoris (masqué s'il n'y en a pas). */}
                  {href === "/favoris" && nombreFavoris > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1.5 left-3 min-w-4 rounded-full bg-primary px-1 text-center font-mono text-[0.625rem] leading-4 text-primary-foreground tabular-nums"
                    >
                      {nombreFavoris}
                    </span>
                  )}
                </span>
                {label}
                {href === "/favoris" && <span className="sr-only">, {lecteur}</span>}
              </Link>
            </li>
          ))}
          <li>
            <SheetTrigger
              aria-label={libelleApercu}
              data-actif={pathname === "/sacoche" ? "true" : undefined}
              className="flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-full text-xs font-medium text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none data-[actif=true]:bg-accent data-[actif=true]:font-semibold data-[actif=true]:text-foreground motion-safe:transition-colors motion-safe:duration-200"
            >
              <span className="relative">
                <Backpack className="size-5" aria-hidden="true" />
                {nombreDansLaSacoche > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1.5 left-3 min-w-4 rounded-full bg-primary px-1 text-center font-mono text-[0.625rem] leading-4 text-primary-foreground tabular-nums"
                  >
                    {nombreDansLaSacoche}
                  </span>
                )}
              </span>
              Sacoche
            </SheetTrigger>
          </li>
        </ul>
      </nav>

      {/* ============ Tiroir d'aperçu de la sacoche ============ */}
      <SheetContent className="bg-card">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="font-heading text-2xl font-bold">
            Sacoche ({nombreDansLaSacoche}/{MAX_TEAM_SIZE})
          </SheetTitle>
          <SheetDescription>Ton équipe actuelle.</SheetDescription>
        </SheetHeader>
        <ol className="flex flex-col gap-2 px-4">
          {equipe.length === 0 ? (
            <li className="rounded-2xl border-2 border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              La sacoche est vide. Ajoute un Pokémon depuis sa fiche ou l&apos;Index.
            </li>
          ) : (
            equipe.map((id) => (
              <li
                key={id}
                className="flex items-center gap-3 rounded-2xl bg-muted/60 p-2 pr-3"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-card">
                  <Image
                    src={illustration(id)}
                    alt=""
                    width={40}
                    height={40}
                    sizes="40px"
                    className="size-10 object-contain"
                  />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-index text-muted-foreground">
                    #{numeroArchive(id)}
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {namesById[id] ?? ""}
                  </span>
                </span>
                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => remove(id)}>
                  Retirer
                </Button>
              </li>
            ))
          )}
        </ol>
        <SheetFooter>
          <Button className="rounded-full" render={<Link href="/sacoche" />} nativeButton={false}>
            Voir la sacoche complète
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
