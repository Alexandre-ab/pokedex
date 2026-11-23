import { Skeleton } from "@/components/ui/skeleton";

// Squelette de la fiche détaillée, utilisé comme fallback à la fois dans
// le <Suspense> de app/pokemon/[id]/page.js et dans app/pokemon/[id]/loading.js.
export default function PokemonDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <main className="mx-auto max-w-2xl">
        <Skeleton className="mb-6 h-5 w-32" />
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="mx-auto h-40 w-40 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-4 w-12" />
          <Skeleton className="mx-auto mt-2 h-7 w-40" />
          <div className="mt-6 flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
