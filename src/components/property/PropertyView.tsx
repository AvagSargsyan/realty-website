"use client"

import { motion } from "motion/react"
import {
  AirVent, ArrowDownRight, ArrowUpDown, Bath, BedDouble, Building2, ChevronRight, DoorOpen, Droplets, Fence, Flame, Hammer, Heart, Heater,
  Layers, MapPin, MessageCircle, Mountain, MoveVertical, Phone, Refrigerator, Ruler, Send, Share2, ShieldCheck, Sofa, SquareParking, Trees, Waves, Wifi,
  type LucideIcon,
} from "lucide-react"
import { Link, useT } from "@/i18n/client"
import { useFavorites } from "@/components/providers/preferences"
import { useSettings } from "@/components/providers/SettingsProvider"
import { usePrice } from "@/components/providers/usePrice"
import { TagBadge } from "@/components/listing/ListingCard"
import { CategoryRow } from "@/components/home/ListingRails"
import { Gallery } from "@/components/property/Gallery"
import { RequestDialog } from "@/components/property/RequestDialog"
import { useToast } from "@/components/ui/toast"
import { formatNumber } from "@/lib/format"
import { REGION_NAMES } from "@/lib/regions"
import { listingsHref } from "@/lib/search"
import { cn } from "@/lib/utils"
import type { Lang, Listing } from "@/types"

const AMENITY_ICONS: Record<string, LucideIcon> = {
  heating: Heater, gas: Flame, hotWater: Droplets, aircon: AirVent, furniture: Sofa, appliances: Refrigerator, balcony: Fence,
  elevator: ArrowUpDown, parking: SquareParking, internet: Wifi, security: ShieldCheck, view: Mountain, garden: Trees, pool: Waves, fireplace: Flame,
}
const AMENITY_GROUPS = {
  comfort: ["heating", "gas", "hotWater", "aircon", "internet", "fireplace"],
  furnishing: ["furniture", "appliances"],
  building: ["elevator", "parking", "security", "balcony"],
  outdoor: ["view", "garden", "pool"],
} as const
const DATE_LOCALE: Record<Lang, string> = { hy: "hy-AM", en: "en-GB", ru: "ru-RU" }

/**
 * Property page, ported from the demo. The listing and the similar listings come from the server
 * (src/app/(site)/[locale]/property/...); contacts from Site settings.
 */
export function PropertyView({ listing: l, similar, similarTotal }: { listing: Listing; similar: Listing[]; similarTotal: number }) {
  const { t, lang } = useT()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { price, perSqm } = usePrice()
  const settings = useSettings()
  const toast = useToast()
  const title = l.title

  const saved = isFavorite(l.id)
  const isRent = l.deal === "rent"
  const updated = new Intl.DateTimeFormat(DATE_LOCALE[lang], { dateStyle: "long" }).format(new Date(l.updatedAt))
  const whatsapp = `${settings.whatsappHref}?text=${encodeURIComponent(t.property.whatsappText(title, l.id))}`

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title, url })
      else {
        await navigator.clipboard.writeText(url)
        toast.show(t.property.linkCopied)
      }
    } catch {
      /* the user closed the share sheet, or the clipboard is blocked */
    }
  }

  const facts: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Ruler, label: t.property.facts.area, value: `${formatNumber(l.area, lang)} ${t.units.sqm}` },
    ...(l.rooms > 0 ? [{ icon: DoorOpen, label: t.property.facts.rooms, value: String(l.rooms) }] : []),
    ...(l.bedrooms > 0 ? [{ icon: BedDouble, label: t.property.facts.bedrooms, value: String(l.bedrooms) }] : []),
    ...(l.bathrooms > 0 ? [{ icon: Bath, label: t.property.facts.bathrooms, value: String(l.bathrooms) }] : []),
    ...(l.type === "apartment"
      ? [{ icon: Layers, label: t.property.facts.floor, value: `${l.floor} / ${l.floors}` }]
      : l.type === "land"
        ? []
        : [{ icon: Layers, label: t.property.facts.floors, value: String(l.floors) }]),
    ...(l.type !== "land" ? [{ icon: MoveVertical, label: t.property.facts.ceiling, value: `${formatNumber(l.ceiling, lang)} ${t.property.facts.m}` }] : []),
    ...(l.type !== "land" ? [{ icon: Building2, label: t.property.facts.building, value: l.building ? t.building[l.building] : "—" }] : []),
    ...(l.type !== "land" ? [{ icon: Hammer, label: t.property.facts.condition, value: l.condition ? t.condition[l.condition] : "—" }] : []),
  ]

  const groups = (Object.keys(AMENITY_GROUPS) as (keyof typeof AMENITY_GROUPS)[])
    .map((g) => ({ g, items: AMENITY_GROUPS[g].filter((a) => l.amenities.includes(a)) }))
    .filter((x) => x.items.length)

  const actionBtn = "btn h-12 w-full"

  return (
    <>
      <div className="container-page pt-4 pb-28 md:pt-8 lg:pb-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 hidden text-sm text-muted-ink md:block">
          <ol className="flex flex-wrap items-center gap-1.5 [&>li]:inline-flex [&>li]:items-center [&>li]:gap-1.5">
            <li><Link href="/" className="hover:text-ink">{t.nav.home}</Link></li>
            <li><ChevronRight className="size-3.5" aria-hidden="true" /><Link href={listingsHref({ deal: l.deal })} className="hover:text-ink">{t.deal[l.deal]}</Link></li>
            <li><ChevronRight className="size-3.5" aria-hidden="true" /><Link href={listingsHref({ deal: l.deal, district: l.district.key })} className="hover:text-ink">{l.district.name}</Link></li>
            <li aria-current="page" className="text-ink"><ChevronRight className="size-3.5" aria-hidden="true" />{t.property.id(l.id)}</li>
          </ol>
        </nav>

        <Gallery photos={l.photos} title={title} />

        <div className="mt-8 grid gap-10 md:mt-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_400px]">
          {/* Left column */}
          <div className="min-w-0">
            <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              {/* Sold and rented listings keep their page (left out of search), clearly marked */}
              {l.status !== "published" && (
                <p role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-line bg-surface px-4 py-3 text-sm text-ink">
                  <span className="inline-flex h-6 items-center rounded-sm bg-night px-2 text-[0.68rem] font-bold tracking-[0.08em] text-white uppercase">
                    {t.property.status[l.status]}
                  </span>
                  {t.property.status.note}
                </p>
              )}
              {l.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {l.tags.map((tg) => <TagBadge key={tg} tag={tg} className="border border-line" />)}
                </div>
              )}
              <p className="text-xs font-medium tracking-wider text-muted-ink uppercase">{t.type[l.type]} · {t.deal[l.deal]}</p>
              <h1 className="mt-2 text-3xl leading-tight font-extrabold text-ink md:text-4xl">{title}</h1>
              <p className="mt-3 flex items-center gap-1.5 text-muted-ink">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                {[l.street, l.district.name, REGION_NAMES[l.district.region][lang]].filter(Boolean).join(", ")}
              </p>
              <p className="mt-2 text-sm text-muted-ink">
                {t.property.id(l.id)} · {t.property.updated(updated)}
              </p>
            </motion.header>

            {/* Key details */}
            <section aria-labelledby="facts" className="mt-10 border-t border-line pt-8">
              <h2 id="facts" className="text-xl font-extrabold text-ink">{t.property.facts.title}</h2>
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-iris-tint text-iris-ink">
                      <f.icon className="size-[18px]" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-sm text-muted-ink">{f.label}</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{f.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </section>

            {/* Description */}
            <section aria-labelledby="desc" className="mt-10 border-t border-line pt-8">
              <h2 id="desc" className="text-xl font-extrabold text-ink">{t.property.description}</h2>
              <p className="mt-4 max-w-3xl text-[1.05rem] leading-relaxed text-ink/85">{l.description}</p>
            </section>

            {/* Amenities */}
            {groups.length > 0 && (
              <section aria-labelledby="amen" className="mt-10 border-t border-line pt-8">
                <h2 id="amen" className="text-xl font-extrabold text-ink">{t.property.amenities.title}</h2>
                <div className="mt-6 grid gap-8 sm:grid-cols-2">
                  {groups.map(({ g, items }) => (
                    <div key={g}>
                      <h3 className="text-xs font-semibold tracking-[0.14em] text-muted-ink uppercase">{t.property.amenities[g]}</h3>
                      <ul className="mt-3 space-y-2.5">
                        {items.map((a) => {
                          const Icon = AMENITY_ICONS[a] ?? ShieldCheck
                          return (
                            <li key={a} className="flex items-center gap-3 text-ink">
                              <Icon className="size-[18px] text-iris-ink" aria-hidden="true" />
                              {t.amenity[a as keyof typeof t.amenity]}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column: sticky price panel (Blu Dot style) */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-lg border border-line bg-background p-6 shadow-[0_24px_60px_-40px_rgba(11,31,39,0.5)] md:p-7">
              <p className="text-xs font-semibold tracking-[0.18em] text-iris-ink uppercase">{t.deal[l.deal]}</p>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="font-heading text-4xl font-extrabold tracking-tight text-ink">{price(l.priceUsd)}</span>
                {isRent && <span className="text-muted-ink">{t.card.perMonth}</span>}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {!isRent && l.area > 0 && <span className="text-muted-ink">{t.property.perSqm(perSqm(l.priceUsd, l.area))}</span>}
                {l.oldPriceUsd && (
                  <span className="inline-flex items-center gap-1 text-positive">
                    <ArrowDownRight className="size-4" aria-hidden="true" />
                    {t.property.reducedFrom(price(l.oldPriceUsd))}
                  </span>
                )}
              </div>

              <div className="mt-6 grid gap-2.5 border-t border-line pt-6">
                <a href={settings.phoneHref} className={cn(actionBtn, "bg-iris text-white hover:-translate-y-px hover:bg-iris-soft")}>
                  <Phone className="size-4" aria-hidden="true" />
                  {t.property.call} · {settings.phone}
                </a>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={cn(actionBtn, "border border-line bg-background text-ink hover:border-iris-ink hover:text-iris-ink")}>
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {t.property.whatsapp}
                </a>
                <RequestDialog
                  title={title}
                  code={l.id}
                  trigger={
                    <button type="button" className={cn(actionBtn, "border border-line bg-background text-ink hover:border-iris-ink hover:text-iris-ink")}>
                      <Send className="size-4" aria-hidden="true" />
                      {t.property.request}
                    </button>
                  }
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button type="button" onClick={share} className="btn h-11 text-ink hover:bg-surface">
                  <Share2 className="size-4" aria-hidden="true" />
                  {t.property.share}
                </button>
                <button type="button" onClick={() => toggleFavorite(l.id)} aria-pressed={saved} className="btn h-11 text-ink hover:bg-surface">
                  <Heart className={cn("size-4 transition-[color,fill]", saved && "fill-brand text-brand")} aria-hidden="true" />
                  {saved ? t.card.saved : t.card.save}
                </button>
              </div>
              <p className="mt-4 border-t border-line pt-4 text-center text-sm text-muted-ink">{t.property.agentNote}</p>
            </div>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <CategoryRow
          rail={{ title: t.property.similar, items: similar, total: similarTotal, viewAllHref: listingsHref({ deal: l.deal, type: l.type }) }}
          className="pb-28 lg:pb-24"
        />
      )}

      {/* Phones: fixed call bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-lg leading-tight font-extrabold text-ink">
              {price(l.priceUsd)}
              {isRent && <span className="ml-1 text-sm font-medium text-muted-ink">{t.card.perMonth}</span>}
            </p>
          </div>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label={t.property.whatsapp} className="btn h-11 border border-line px-3.5 text-ink">
            <MessageCircle className="size-5" aria-hidden="true" />
          </a>
          <a href={settings.phoneHref} className="btn-primary h-11 px-5">
            <Phone className="size-4" aria-hidden="true" />
            {t.property.call}
          </a>
        </div>
      </div>
    </>
  )
}
