import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Affiché quand l'id dans l'URL n'est pas un Pokémon valide (1 à 1025) :
// une carte douce avec un message clair et un bouton pour revenir à l'index.
export default function NotFound() {
  return (
    <div className="flex-1 bg-background px-4 pt-5 pb-10 sm:px-6 lg:px-10 lg:pt-10">
      <main id="main-content" className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-card px-6 py-16 text-center shadow-soft dark:ring-1 dark:ring-border">
          <p aria-hidden="true" className="font-heading text-7xl leading-none font-bold text-muted-foreground/40">
            ?
          </p>
          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground">
            Pokémon introuvable
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            Aucun Pokémon ne porte ce numéro. Les numéros de l&apos;index vont de 1 à 1025.
          </p>
          <Button
            variant="outline"
            render={<Link href="/" />}
            nativeButton={false}
            className="mt-6 min-h-11 rounded-xl px-5"
          >
            <ArrowLeft data-icon="inline-start" />
            Retour à l&apos;index
          </Button>
        </div>
      </main>
    </div>
  );
}
