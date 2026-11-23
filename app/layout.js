import { Darker_Grotesque, Rubik } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getPokemonList } from "@/lib/pokeapi";

// Direction visuelle "Holo Arcade" : Darker Grotesque pour les titres et
// numéros, Rubik pour l'interface et le texte courant.
const fontDisplay = Darker_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const fontSans = Rubik({
  variable: "--font-sans",
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
      className={`${fontDisplay.variable} ${fontSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header namesById={namesById} />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
