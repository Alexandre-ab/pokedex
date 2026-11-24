import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getPokemonList } from "@/lib/pokeapi";

// Design doux et ergonomique :
// - Bricolage Grotesque pour les titres (chaleureuse, largeur normale) ;
// - Instrument Sans pour l'interface et le texte courant ;
// - JetBrains Mono pour les numéros (#0025) et compteurs.
const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
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
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Header = rail latéral fixe (desktop) + bandeau et dock (mobile). */}
          <Header namesById={namesById} />
          {/* Zone principale : chaque page y rend son propre
              <main id="main-content">. On la décale de la largeur du rail
              en desktop (lg:pl-rail), et on lui laisse de la place en bas
              en mobile pour ne pas passer sous le dock flottant. */}
          <div className="flex flex-1 flex-col pb-28 lg:pb-0 lg:pl-rail">
            {children}
          </div>
          {/* Sur mobile, les toasts s'affichent au-dessus du dock. */}
          <Toaster mobileOffset={{ bottom: "6.5rem" }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
