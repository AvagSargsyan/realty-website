"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "motion/react"
import { ArrowDownRight, BedDouble, Building2, ChevronLeft, ChevronRight, Heart, MapPin, Ruler } from "lucide-react"
import { Link, useT } from "@/i18n/client"
import { useFavorites } from "@/components/providers/preferences"
import { usePrice } from "@/components/providers/usePrice"
import { formatNumber } from "@/lib/format"
import { REGION_NAMES } from "@/lib/regions"
import { propertyHref } from "@/lib/search"
import { cn } from "@/lib/utils"
import type { Listing, Tag } from "@/types"

const MAX_CARD_PHOTOS = 5

export function TagBadge({ tag, className }: { tag: Tag; className?: string }) {
  const { t } = useT()
  const styles: Record<Tag, { box: string; dot: string }> = {
    exclusive: { box: "bg-night text-white", dot: "bg-brand-bright" },
    new: { box: "bg-white text-night", dot: "bg-iris" },
    newConstruction: { box: "bg-white text-night", dot: "bg-muted-ink" },
    penthouse: { box: "bg-white text-night", dot: "bg-brand-bright" },
  }
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-sm px-2 text-[0.68rem] font-bold tracking-[0.08em] uppercase shadow-[0_1px_2px_rgba(22,21,43,0.12)]",
        styles[tag].box,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", styles[tag].dot)} aria-hidden="true" />
      {t.tag[tag]}
    </span>
  )
}

export function FavoriteButton({ id, className }: { id: number; className?: string }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { t } = useT()
  const active = isFavorite(id)
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(id)}
      aria-pressed={active}
      aria-label={active ? t.card.saved : t.card.save}
      className={cn("float-btn size-10", className)}
    >
      <motion.span
        key={String(active)}
        initial={{ scale: active ? 0.5 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 520, damping: 14 }}
        className="grid place-items-center"
      >
        <Heart
          className={cn(
            "size-[18px] transition-[color,fill] duration-200",
            active && "fill-brand text-brand",
          )}
          aria-hidden="true"
        />
      </motion.span>
    </button>
  )
}

function CardPhotos({ listing, href, title }: { listing: Listing; href: string; title: string }) {
  const { t } = useT()
  const photos = listing.photos.slice(0, MAX_CARD_PHOTOS)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 22 })
  const [index, setIndex] = useState(0)

  const onSelect = useCallback(() => emblaApi && setIndex(emblaApi.selectedScrollSnap()), [emblaApi])
  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  const go = (dir: -1 | 1) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (dir < 0) emblaApi?.scrollPrev()
    else emblaApi?.scrollNext()
  }

  return (
    <div className="relative z-10 overflow-hidden rounded-lg bg-surface transition-shadow duration-300 group-hover:shadow-[0_18px_40px_-22px_rgba(38,50,56,0.45)]">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {photos.map((p, i) => (
            <Link
              key={p.full}
              href={href}
              tabIndex={-1}
              aria-hidden={i !== index}
              className="relative aspect-[4/3] min-w-0 flex-[0_0_100%] overflow-hidden"
            >
              {/* Fixed Payload sizes (480 / 800 / 1600 px), served straight from the Blob CDN */}
              <img
                src={p.card}
                srcSet={`${p.thumb} 480w, ${p.card} 800w, ${p.large} 1600w`}
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 92vw"
                alt={i === 0 ? title : `${title}: ${t.card.photo(i + 1, photos.length)}`}
                loading="lazy"
                draggable={false}
                className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* subtle gradient so white badges/dots stay readable */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={go(-1)}
            aria-label={t.card.prevPhoto}
            className="float-btn absolute top-1/2 left-2.5 size-9 -translate-y-1/2 opacity-0 transition-[opacity,background-color,color,box-shadow,scale] group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={go(1)}
            aria-label={t.card.nextPhoto}
            className="float-btn absolute top-1/2 right-2.5 size-9 -translate-y-1/2 opacity-0 transition-[opacity,background-color,color,box-shadow,scale] group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden="true">
            {photos.map((p, i) => (
              <span key={p.full} className={cn("h-1.5 rounded-full bg-white transition-all duration-300", i === index ? "w-4 opacity-100" : "w-1.5 opacity-60")} />
            ))}
          </div>
        </>
      )}

      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
        {listing.tags.filter((tg) => tg !== "newConstruction").map((tg) => (
          <TagBadge key={tg} tag={tg} />
        ))}
      </div>
      <FavoriteButton id={listing.id} className="absolute top-2.5 right-2.5" />
    </div>
  )
}

export function ListingCard({ listing, className }: { listing: Listing; className?: string }) {
  const { t, lang } = useT()
  const { price } = usePrice()
  const href = propertyHref(listing)
  const title = listing.title
  const location = `${listing.district.name}, ${REGION_NAMES[listing.district.region][lang]}`
  const isRent = listing.deal === "rent"

  const facts = [
    listing.rooms > 0 && { icon: BedDouble, label: t.card.rooms(listing.rooms) },
    { icon: Ruler, label: `${formatNumber(listing.area, lang)} ${t.units.sqm}` },
    listing.type === "apartment" && listing.floor !== undefined && { icon: Building2, label: t.card.floor(listing.floor, listing.floors) },
    listing.type === "house" && listing.floors && { icon: Building2, label: t.card.floors(listing.floors) },
  ].filter(Boolean) as { icon: typeof Ruler; label: string }[]

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <CardPhotos listing={listing} href={href} title={title} />

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-center justify-between gap-3 text-xs font-medium tracking-wider text-muted-ink uppercase">
          <span>
            {t.type[listing.type]} · {t.deal[listing.deal]}
          </span>
          {listing.tags.includes("newConstruction") && <span className="text-iris-ink">{t.tag.newConstruction}</span>}
        </div>

        <h3 className="mt-1.5 font-heading text-[1.08rem] leading-snug font-bold text-ink">
          <Link href={href} className="decoration-ink/30 underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0 after:z-0 after:content-[''] focus-visible:underline">
            {title}
          </Link>
        </h3>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-ink">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          {location}
        </p>

        <ul className="mt-3 mb-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink/80">
          {facts.map((f) => (
            <li key={f.label} className="inline-flex items-center gap-1.5">
              <f.icon className="size-4 text-muted-ink" aria-hidden="true" />
              {f.label}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3.5">
          <p className="flex items-baseline gap-1.5">
            <span className="font-heading text-lg font-extrabold tracking-tight text-ink">{price(listing.priceUsd)}</span>
            {isRent && <span className="text-sm text-muted-ink">{t.card.perMonth}</span>}
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
