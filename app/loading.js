import { ViewTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Affiché pendant que la grille (app/page.js) charge ses données.
export default function Loading() {
  return (
    <ViewTransition exit="slide-down">
      <div className="min-h-screen bg-background px-4 py-8">
        <main className="mx-auto max-w-6xl">
          <Skeleton className="mx-auto mb-6 h-9 w-40" />
          <Skeleton className="mb-4 h-10 w-full" />
          <div className="mb-6 flex justify-center gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-16 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    </ViewTransition>
  );
}
