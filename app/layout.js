import { Darker_Grotesque, Rubik } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

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

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
