import { cn } from "@/lib/utils"

/**
 * Placeholders shown by the routes' loading.tsx while the server renders the page. Their boxes follow
 * the real layouts (ListingsView, ListingCard), so nothing jumps when the content arrives.
 * No text: loading.tsx gets no locale.
 */

export function Bone({ className }: { className?: string }) {
  return <div className={cn("rounded-md bg-surface-2 motion-safe:animate-pulse", className)} />
}

export function ListingCardSkeleton() {
  return (
    <div>
      <Bone className="aspect-[4/3] rounded-lg" />
      <Bone className="mt-5 h-3 w-1/3" />
      <Bone className="mt-3 h-5 w-4/5" />
      <Bone className="mt-2.5 h-4 w-1/2" />
      <Bone className="mt-4 h-4 w-2/3" />
      <div className="mt-4 border-t border-line pt-3.5">
        <Bone className="h-6 w-1/3" />
      </div>
    </div>
  )
}

export function ListingsSkeleton() {
  return (
    <div className="container-page pt-8 pb-20 md:pt-12" aria-busy="true">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <Bone className="h-9 w-56 md:h-10" />
          <Bone className="mt-2.5 h-4 w-28" />
        </div>
        <div className="flex gap-3">
          <Bone className="h-11 w-40" />
          <Bone className="h-11 w-28" />
        </div>
      </div>
      <div className="mt-6 grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="hidden space-y-6 lg:block">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <Bone className="h-4 w-24" />
              <Bone className="mt-3 h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// No property-page skeleton on purpose: a loading.tsx there starts the response before the page knows
// whether the listing exists, so unknown codes answered 200 instead of 404 and old slugs redirected in
// the browser instead of with a 308. The navigation progress bar covers those clicks.
