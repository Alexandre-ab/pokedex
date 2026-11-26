import {
  Bricolage_Grotesque,
  Fraunces,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getPokemonList } from "@/lib/pokeapi";

// Design doux et ergonomique :
// - Bricolage Grotesque pour les titres (chaleureuse). On charge aussi son
//   axe de largeur "wdth" : la vitrine l'utilise condensée (wdth 75) pour
//   ses grands titres en capitales ;
// - Fraunces italique pour LE mot mis en scène dans un titre de la vitrine
//   (axes SOFT et WONK : italique douce et un peu bancale) ;
// - Instrument Sans pour l'interface et le texte courant ;
// - JetBrains Mono pour les numéros (#0025) et compteurs.
const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const fontAccent = Fraunces({
  variable: "--font-accent",
  subsets: ["latin"],
  style: ["italic"],
  axes: ["SOFT", "WONK", "opsz"],
});

const fontSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pokédex",
  description: "Pokédex : recherche, filtres, favoris et sacoche d'équipe.",
};

export default async function RootLayout({ children }) {
  // Déjà mis en cache ('use cache' dans lib/pokeapi.js) : on ne refait pas
  // d'appel réseau supplémentaire en le réutilisant ici. On n'en garde que
  // les noms français, pour les afficher dans le tiroir sacoche du Header.
  const pokemonList = await getPokemonList();
  const namesById = Object.fromEntries(
    pokemonList.map((pokemon) => [pokemon.id, pokemon.nameFr])
  );

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontAccent.variable} ${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Header = navbar haute rétractable (desktop) + bandeau et dock (mobile). */}
          <Header namesById={namesById} />
          {/* Zone principale : chaque page y rend son propre
              <main id="main-content">. En desktop, on la décale une fois pour
              toutes de la hauteur de la navbar (lg:pt-16 = 64 px) : quand
              elle se contracte en pilule au scroll, rien ne saute. En
              mobile, on laisse de la place en bas pour le dock flottant. */}
          <div className="flex flex-1 flex-col pb-28 lg:pb-0 lg:pt-16">
            {children}
          </div>
          {/* Sur mobile, les toasts s'affichent au-dessus du dock. */}
          <Toaster mobileOffset={{ bottom: "6.5rem" }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
