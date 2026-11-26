"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Library, Heart, Backpack, Search } from "lucide-react";
import { useFavoritesStore } from "@/store/favorites";
import { useTeamStore } from "@/store/team";
import { MAX_TEAM_SIZE } from "@/lib/team";
import { EVENEMENT_FOCUS_RECHERCHE } from "@/lib/vitrine";
import { cn } from "@/lib/utils";
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
// - Desktop (lg et +) : une NAVBAR HAUTE fixe, pleine largeur en haut de
//   page (marque, Index / Favoris / Sacoche avec compteurs, aperçu des 6
//   emplacements de l'équipe qui ouvre le tiroir, thème). Dès qu'on défile,
//   elle se contracte en douceur en PILULE FLOTTANTE centrée.
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

// Seuils d'hystérésis de la navbar desktop : elle se compacte au-delà de
// 80 px de défilement et ne redevient large que sous 40 px. Deux seuils
// distincts évitent qu'elle "tremble" quand on s'arrête pile autour d'un seul.
const SEUIL_COMPACT = 80;
const SEUIL_LARGE = 40;

// Vrai quand la page a défilé (avec hystérésis). L'état initial vaut false
// au serveur comme au premier rendu client : aucun écart d'hydratation.
function useNavCompacte() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    function verifier() {
      const y = window.scrollY;
      setCompact((actuel) => (actuel ? y > SEUIL_LARGE : y > SEUIL_COMPACT));
    }
    // Première vérification à l'image suivante (page rechargée déjà
    // défilée), puis à chaque défilement. "passive" : on ne bloque jamais
    // le défilement.
    const image = requestAnimationFrame(verifier);
    window.addEventListener("scroll", verifier, { passive: true });
    return () => {
      cancelAnimationFrame(image);
      window.removeEventListener("scroll", verifier);
    };
  }, []);

  return compact;
}

// Un lien est "actif" si on est sur sa page. "page" est le chemin de la
// page visée, sans ancre : le lien Index pointe vers "/#catalogue" mais sa
// page est "/". L'Index reste actif sur les fiches détaillées
// (/pokemon/...), qui en font partie.
function estActif(pathname, page) {
  if (page === "/") return pathname === "/" || pathname.startsWith("/pokemon");
  return pathname === page;
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

  const compact = useNavCompacte();
  const router = useRouter();

  // Bouton loupe : sur l'accueil, on prévient PokemonGrid (il défile jusqu'au
  // catalogue et place le curseur dans la recherche). Ailleurs (favoris,
  // sacoche, fiche), on retourne d'abord au catalogue de l'accueil.
  function ouvrirRecherche() {
    if (pathname === "/") {
      window.dispatchEvent(new CustomEvent(EVENEMENT_FOCUS_RECHERCHE));
    } else {
      router.push("/#catalogue");
    }
  }

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

  // Les entrées de la navigation (navbar desktop). "compteur" est affiché en mono ;
  // "lecteur" est la version lue par les lecteurs d'écran.
  const liens = [
    {
      // L'Index mène directement au catalogue, sous la vitrine de l'accueil.
      href: "/#catalogue",
      page: "/",
      label: "Index",
      Icone: Library,
      compteur: String(totalIndex),
      lecteur: `${totalIndex} Pokémon`,
    },
    {
      href: "/favoris",
      page: "/favoris",
      label: "Favoris",
      Icone: Heart,
      compteur: String(nombreFavoris),
      lecteur: `${nombreFavoris} favori${nombreFavoris > 1 ? "s" : ""}`,
    },
    {
      href: "/sacoche",
      page: "/sacoche",
      label: "Sacoche",
      Icone: Backpack,
      compteur: `${nombreDansLaSacoche}/${MAX_TEAM_SIZE}`,
      lecteur: `${nombreDansLaSacoche} sur ${MAX_TEAM_SIZE}`,
    },
  ];

  const libelleApercu = `Aperçu de la sacoche : ${nombreDansLaSacoche} Pokémon sur ${MAX_TEAM_SIZE}`;

  return (
    // Une seule sacoche (Sheet) partagée : l'aperçu d'équipe de la navbar ET le
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
      {/* Sur l'accueil, un 2e lien d'évitement saute la vitrine et mène
          directement au catalogue filtrable. */}
      {pathname === "/" && (
        <a
          href="#catalogue"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-primary-foreground focus:shadow-float focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Aller au catalogue
        </a>
      )}

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

      {/* ============ DESKTOP : navbar haute → pilule flottante ============ */}
      {/* Le conteneur fixe occupe toute la largeur mais laisse passer les
          clics (pointer-events-none) : seule la barre elle-même est
          cliquable. La page est décalée de 64 px (lg:pt-16 dans
          app/layout.js) une fois pour toutes : quand la barre rétrécit, rien
          ne bouge dessous. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 hidden justify-center lg:flex">
        <div
          data-compact={compact ? "true" : undefined}
          className={cn(
            // Commun aux deux états. Toutes les valeurs qui changent sont
            // NUMÉRIQUES (largeur max, hauteur, marges, rayon…) : le
            // navigateur peut donc les interpoler en douceur dans les deux
            // sens, sans saut, y compris en remontant en haut de page.
            "pointer-events-auto flex w-full items-center justify-between",
            "motion-safe:transition-[max-width,height,margin,padding,gap,border-radius,box-shadow,background-color,border-color] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
            compact
              ? // Pilule flottante centrée (42rem laisse assez d'air aux
                // 3 liens, à la loupe, à la jauge et au bouton thème, sur
                // une ligne).
                // Rayon = moitié de la hauteur (26 px) : arrondi parfait,
                // et interpolable (contrairement à rounded-full).
                "mt-3 h-[52px] max-w-[42rem] gap-2 rounded-[26px] border border-border bg-card px-3 shadow-float"
              : // Barre légère pleine largeur, en haut de page.
                "mt-0 h-16 max-w-[100vw] gap-6 rounded-none border border-transparent border-b-border/70 bg-background px-8"
          )}
        >
          {/* Marque : Poké Ball + titre. La Poké Ball pivote d'un demi-tour
              au survol (désactivé si l'utilisateur préfère moins
              d'animations). En compact, le mot « Pokédex » se replie en
              douceur (largeur 0 + fondu) au lieu de disparaître d'un coup :
              le lien garde son nom accessible grâce à aria-label.
              flex-1 reste en place dans les deux états : pas de saut. */}
          <div className="flex flex-1">
            <Link
              href="/"
              aria-label="Pokédex, accueil"
              className="group flex min-h-10 items-center rounded-full px-1.5 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <PokeBall
                size={32}
                className={cn(
                  "shrink-0 motion-safe:transition-[transform,width,height] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:rotate-180",
                  compact ? "size-[26px]" : "size-8"
                )}
              />
              <span
                aria-hidden={compact || undefined}
                className={cn(
                  "overflow-hidden font-heading text-xl font-bold tracking-tight whitespace-nowrap motion-safe:transition-[max-width,opacity,margin] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
                  compact ? "ml-0 max-w-0 opacity-0" : "ml-2.5 max-w-28 opacity-100"
                )}
              >
                Pokédex
              </span>
            </Link>
          </div>

          {/* Accès rapide : lien actif en pastille arrondie. En large, le
              compteur est affiché ; en compact, il se replie en douceur
              (largeur 0 + fondu) et reste lu par les lecteurs d'écran. */}
          <nav aria-label="Navigation principale">
            <ul className="flex items-center gap-1">
              {liens.map(({ href, page, label, Icone, compteur, lecteur }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={estActif(pathname, page) ? "page" : undefined}
                    className={cn(
                      "group/lien flex items-center rounded-full text-sm font-medium whitespace-nowrap text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-foreground motion-safe:transition-[color,background-color,padding,min-height] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
                      compact ? "min-h-10 px-3" : "min-h-11 px-4"
                    )}
                  >
                    <Icone
                      className="mr-2 size-5 shrink-0 group-aria-[current=page]/lien:text-primary"
                      aria-hidden="true"
                    />
                    {label}
                    {/* Pastille du compteur : toujours dans le DOM, elle
                        se replie (largeur, marge, padding à 0) en compact. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "text-index overflow-hidden rounded-full bg-muted py-0.5 text-center whitespace-nowrap text-foreground motion-safe:transition-[max-width,min-width,margin,padding,opacity] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
                        compact
                          ? "ml-0 max-w-0 min-w-0 px-0 opacity-0"
                          : "ml-2 max-w-20 min-w-8 px-2 opacity-100"
                      )}
                    >
                      {compteur}
                    </span>
                    <span className="sr-only">, {lecteur}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2">
            {/* Loupe : n'apparaît qu'en mode compact (quand la barre de
                recherche du catalogue n'est plus à l'écran). Toujours dans
                le DOM : elle se déplie en douceur (largeur + fondu) au lieu
                d'apparaître d'un coup. Masquée, elle sort du parcours clavier
                (tabIndex -1) et des lecteurs d'écran (aria-hidden). */}
            <button
              type="button"
              onClick={ouvrirRecherche}
              tabIndex={compact ? 0 : -1}
              aria-hidden={!compact}
              aria-label="Rechercher un Pokémon"
              title="Rechercher (/)"
              className={cn(
                "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-safe:transition-[max-width,opacity,color,background-color] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
                compact ? "max-w-10 opacity-100" : "pointer-events-none max-w-0 opacity-0"
              )}
            >
              <Search className="size-5 shrink-0" aria-hidden="true" />
            </button>
            {/* Aperçu de l'équipe : ouvre le tiroir de la sacoche.
                Les MÊMES 6 emplacements servent aux deux états : en large,
                des ronds de 32 px avec l'illustration ; en compact, ils
                rétrécissent en douceur jusqu'à une mini-jauge de points.
                Rien n'est démonté : la largeur varie sans à-coup. */}
            <SheetTrigger
              aria-label={libelleApercu}
              className="flex min-h-10 items-center gap-2.5 rounded-full px-2.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-safe:transition-colors motion-safe:duration-200"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex items-center motion-safe:transition-[gap] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
                  compact ? "gap-0.5" : "gap-1"
                )}
              >
                {emplacements.map((id, index) => (
                  <span
                    key={id ? `pokemon-${id}` : `vide-${index}`}
                    title={id ? (namesById[id] ?? undefined) : undefined}
                    className={cn(
                      "flex shrink-0 items-center justify-center overflow-hidden rounded-full motion-safe:transition-[width,height,background-color,border-width] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
                      compact ? "size-1.5" : "size-8",
                      id
                        ? cn(
                            "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-75",
                            compact ? "bg-primary" : "bg-muted"
                          )
                        : compact
                          ? "border-0 bg-border"
                          : "border-2 border-dashed border-border"
                    )}
                  >
                    {id && (
                      <Image
                        src={illustration(id)}
                        alt=""
                        width={32}
                        height={32}
                        sizes="32px"
                        className={cn(
                          "size-7 max-w-none object-contain motion-safe:transition-opacity motion-safe:duration-300",
                          compact ? "opacity-0" : "opacity-100"
                        )}
                      />
                    )}
                  </span>
                ))}
              </span>
              <span aria-hidden="true" className="text-index text-foreground">
                {nombreDansLaSacoche}/{MAX_TEAM_SIZE}
              </span>
            </SheetTrigger>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ============ MOBILE : dock flottant en pilule ============ */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-sm lg:hidden"
      >
        <ul className="grid grid-cols-3 gap-1 rounded-full border border-border bg-card p-1.5 shadow-float">
          {liens.slice(0, 2).map(({ href, page, label, Icone, lecteur }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={estActif(pathname, page) ? "page" : undefined}
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
      {/* data-lenis-prevent : le défilement doux de l'accueil ne touche pas au
          défilement interne du tiroir. */}
      <SheetContent data-lenis-prevent className="bg-card">
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
