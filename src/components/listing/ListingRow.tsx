"use client"

import { ArrowDownRight, BedDouble, Building2, MapPin, Ruler } from "lucide-react"
import { Link, useT } from "@/i18n/client"
import { usePrice } from "@/components/providers/usePrice"
import { formatNumber } from "@/lib/format"
import { REGION_NAMES } from "@/lib/regions"
import { propertyHref } from "@/lib/search"
import { cn } from "@/lib/utils"
import type { Listing } from "@/types"
import { FavoriteButton, TagBadge } from "./ListingCard"

/** Horizontal listing card for the List view: photo left, facts and a short description right. */
export function ListingRow({ listing, className }: { listing: Listing; className?: string }) {
  const { t, lang } = useT()
  const { price } = usePrice()
  const href = propertyHref(listing)
  const title = listing.title
  const cover = listing.photos[0]
  const facts = [
    listing.rooms > 0 && { icon: BedDouble, label: t.card.rooms(listing.rooms) },
    { icon: Ruler, label: `${formatNumber(listing.area, lang)} ${t.units.sqm}` },
    listing.type === "apartment" && listing.floor !== undefined && { icon: Building2, label: t.card.floor(listing.floor, listing.floors) },
    listing.type === "house" && listing.floors && { icon: Building2, label: t.card.floors(listing.floors) },
  ].filter(Boolean) as { icon: typeof Ruler; label: string }[]

  return (
    <article className={cn("group relative grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6", className)}>
      <div className="relative z-10 overflow-hidden rounded-lg bg-surface">
        {/* photo is absolutely positioned so loading it never changes the row height */}
        <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-52">
          {cover && (
            <img
              src={cover.card}
              srcSet={`${cover.thumb} 480w, ${cover.card} 800w`}
              sizes="(min-width: 640px) 40vw, 92vw"
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
            />
          )}
        </Link>
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {listing.tags.filter((tg) => tg !== "newConstruction").map((tg) => (
            <TagBadge key={tg} tag={tg} />
          ))}
        </div>
        <FavoriteButton id={listing.id} className="absolute top-2.5 right-2.5" />
      </div>

      <div className="flex min-w-0 flex-col py-1">
        <div className="flex items-center justify-between gap-3 text-xs font-medium tracking-wider text-muted-ink uppercase">
          <span>{t.type[listing.type]} · {t.deal[listing.deal]}</span>
          {listing.tags.includes("newConstruction") && <span className="text-iris-ink">{t.tag.newConstruction}</span>}
        </div>
        <h3 className="mt-1.5 font-heading text-lg leading-snug font-bold text-ink">
          <Link href={href} className="decoration-ink/30 underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0 after:content-[''] focus-visible:underline">
            {title}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-ink">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          {listing.district.name}, {REGION_NAMES[listing.district.region][lang]}
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink/80">
          {facts.map((f) => (
            <li key={f.label} className="inline-flex items-center gap-1.5">
              <f.icon className="size-4 text-muted-ink" aria-hidden="true" />
              {f.label}
            </li>
          ))}
        </ul>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-ink">{listing.description}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="flex items-baseline gap-1.5">
            <span className="font-heading text-xl font-extrabold tracking-tight text-ink">{price(listing.priceUsd)}</span>
            {listing.deal === "rent" && <span className="text-sm text-muted-ink">{t.card.perMonth}</span>}
          </p>
          {listing.oldPriceUsd && (
            <p className="flex items-center gap-1 text-sm text-positive" title={t.card.priceDropped}>
              <ArrowDownRight className="size-4" aria-hidden="true" />
              <s className="text-muted-ink">{price(listing.oldPriceUsd)}</s>
              <span className="sr-only">{t.card.priceDropped}</span>
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
