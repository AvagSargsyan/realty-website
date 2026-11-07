"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Heart } from "lucide-react"
import { getSavedListings } from "@/app/actions/favorites"
import { Link, useT } from "@/i18n/client"
import { useFavorites, useHydrated } from "@/components/providers/preferences"
import { ListingCard } from "@/components/listing/ListingCard"
import type { Listing } from "@/types"

/** Saved listings, ported from the demo. The saved codes live in the browser; the cards come from the server. */
export function FavoritesView() {
  const { t, lang } = useT()
  const { favorites, toggleFavorite } = useFavorites()
  const hydrated = useHydrated()
  const [loaded, setLoaded] = useState<Map<number, Listing>>(new Map())
  const [ready, setReady] = useState(false)
  // Codes already asked for, so listings that no longer exist aren't requested again and again
  const requested = useRef(new Set<number>())

  // Fetch cards for codes not requested yet (removing one needs no request)
  useEffect(() => {
    if (!hydrated) return
    const missing = favorites.filter((id) => !requested.current.has(id))
    if (!missing.length) {
      setReady(true)
      return
    }
    missing.forEach((id) => requested.current.add(id))
    getSavedListings(lang, missing)
      .then((docs) => setLoaded((prev) => new Map([...prev, ...docs.map((l) => [l.id, l] as const)])))
      .finally(() => setReady(true))
  }, [favorites, hydrated, lang])

  // keep the order in which they were saved, newest first
  const saved = [...favorites].reverse().map((id) => loaded.get(id)).filter((l): l is Listing => l !== undefined)

  // Nothing to show until the saved list is known (avoids flashing "Nothing saved yet")
  if (!ready) return <div className="container-page min-h-[60vh] pt-8 md:pt-12" aria-busy="true" />

  return (
    <div className="container-page pt-8 pb-20 md:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-3xl leading-tight font-extrabold text-ink md:text-4xl">{t.favorites.title}</h1>
          <p className="mt-1.5 text-muted-ink">{t.listings.results(saved.length)}</p>
        </div>
        {saved.length > 0 && (
          <button type="button" onClick={() => saved.forEach((l) => toggleFavorite(l.id))} className="btn-secondary h-11 px-4">
            {t.favorites.clear}
          </button>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-lg border border-dashed border-line px-6 py-20 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-iris-tint text-iris-ink">
            <Heart className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-ink">{t.favorites.emptyTitle}</h2>
          <p className="mt-2 max-w-sm text-muted-ink">{t.favorites.emptyBody}</p>
          <Link href="/listings" className="btn-primary mt-6">{t.favorites.browse}</Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {saved.map((l) => (
              <motion.li key={l.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}>
                <ListingCard listing={l} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
