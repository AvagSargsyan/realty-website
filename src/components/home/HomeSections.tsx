"use client"

import { useId } from "react"
import { motion } from "motion/react"
import { ArrowRight, BadgeCheck, Handshake, KeyRound, Phone, Quote, Star } from "lucide-react"
import { Link, useT } from "@/i18n/client"
import { useSettings } from "@/components/providers/SettingsProvider"
import { listingsHref, type Tile } from "@/lib/search"
import { cn } from "@/lib/utils"
import { fadeUp, SectionHeading } from "./Section"

/* ---------- Popular-search tiles (counts and covers come from the server, see the home page) ---------- */

export function PopularTiles({ tiles }: { tiles: Tile[] }) {
  const { t } = useT()
  const id = useId()

  return (
    <section aria-labelledby={`${id}-title`} className="container-page py-16 md:py-24">
      <SectionHeading id={`${id}-title`} title={t.home.popular.title} link={{ to: listingsHref(), label: t.home.viewAll }} />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 xl:grid-cols-6">
        {tiles.map((tile, i) => (
          <motion.li
            key={tile.key}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={listingsHref(tile.query)} className="group block">
              <div className="aspect-[4/5] overflow-hidden rounded-md bg-surface">
                {tile.cover && (
                  <img
                    src={tile.cover.card}
                    srcSet={`${tile.cover.thumb} 480w, ${tile.cover.card} 800w, ${tile.cover.large} 1600w`}
                    sizes="(min-width: 1280px) 16vw, (min-width: 768px) 30vw, 46vw"
                    alt=""
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-heading leading-snug font-bold text-ink group-hover:text-iris-ink">{t.home.popular[tile.key]}</p>
                  <p className="mt-0.5 text-sm text-muted-ink">{t.home.popular.count(tile.count)}</p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-ink transition-[translate,color] duration-300 group-hover:translate-x-0.5 group-hover:text-iris-ink" aria-hidden="true" />
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- Services: Buy / Sell / Rent ---------- */
const SERVICE_LINKS = [listingsHref({ deal: "sale" }), "/submit", listingsHref({ deal: "rent" })]
const SERVICE_ICONS = [KeyRound, BadgeCheck, Handshake]

export function Services() {
  const { t } = useT()
  const id = useId()
  return (
    <section aria-labelledby={`${id}-title`} className="container-page py-16 md:py-24">
      <SectionHeading id={`${id}-title`} title={t.home.services.title} className="border-b border-line pb-5" />
      <div className="grid md:grid-cols-3">
        {t.home.services.items.map((s, i) => {
          const Icon = SERVICE_ICONS[i]
          return (
            <motion.div
              key={s.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.08 }}
              className="flex flex-col border-line py-8 md:border-l md:px-8 md:py-4 border-t first:border-t-0 md:border-t-0 md:first:border-l-0 md:first:pl-0"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-full bg-iris-tint text-iris-ink">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-heading text-sm font-bold tracking-widest text-muted-ink">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-2xl font-extrabold text-ink">{s.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-muted-ink">{s.body}</p>
              <Link href={SERVICE_LINKS[i]} className="group mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-iris-ink">
                <span className="link-underline">{s.cta}</span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

/* ---------- Reviews ---------- */
const RATING = 4.8
const REVIEW_COUNT = 120

function Stars({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5 text-brand-bright", className)} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="size-4 fill-current" />
      ))}
    </span>
  )
}

export function Reviews() {
  const { t, lang } = useT()
  const id = useId()
  const rating = new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-US", { minimumFractionDigits: 1 }).format(RATING)
  return (
    <section aria-labelledby={`${id}-title`} className="bg-surface py-16 md:py-24">
      <div className="container-page">
        <SectionHeading id={`${id}-title`} title={t.home.reviews.title}>
          <div className="flex items-center gap-3 rounded-md border border-line bg-background px-4 py-3">
            <span className="font-heading text-3xl leading-none font-extrabold text-ink">{rating}</span>
            <div>
              <Stars />
              <p className="mt-0.5 text-xs text-muted-ink">
                {t.home.reviews.onGoogle} · {t.home.reviews.basedOn(REVIEW_COUNT)}
              </p>
            </div>
          </div>
        </SectionHeading>
        <ul className="grid gap-5 md:grid-cols-3 md:gap-6">
          {t.home.reviews.items.map((r, i) => (
            <motion.li
              key={r.name}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.08 }}
              className="flex flex-col rounded-lg border border-line bg-background p-6 md:p-7"
            >
              <div className="flex items-center justify-between">
                <Stars />
                <Quote className="size-6 text-iris-ink/25" aria-hidden="true" />
              </div>
              <blockquote className="mt-5 flex-1 text-[1.02rem] leading-relaxed text-ink">{r.text}</blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <span className="grid size-10 place-items-center rounded-full bg-iris text-sm font-bold text-white" aria-hidden="true">
                  {r.name.charAt(0)}
                </span>
                <div>
                  <p className="font-semibold text-ink">{r.name}</p>
                  <p className="text-sm text-muted-ink">{r.role}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted-ink">{t.home.reviews.sample}</p>
      </div>
    </section>
  )
}

/* ---------- Call to action: sell with us ---------- */
export function SellCta() {
  const { t } = useT()
  const settings = useSettings()
  const id = useId()
  return (
    <section aria-labelledby={`${id}-title`} className="container-page py-16 md:py-24">
      <motion.div {...fadeUp} className="relative isolate overflow-hidden rounded-lg bg-iris px-6 py-12 text-white md:px-14 md:py-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 [mask-image:linear-gradient(90deg,transparent,black)] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.09)_1px,transparent_1px)] bg-[size:100%_44px]"
        />
        <div aria-hidden="true" className="absolute top-0 left-6 h-1 w-24 bg-brand-bright md:left-14" />
        <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 id={`${id}-title`} className="text-3xl leading-tight font-extrabold md:text-4xl">{t.home.cta.title}</h2>
            <p className="mt-4 max-w-xl text-lg text-white/85">{t.home.cta.body}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/submit" className="btn-accent">
              {t.home.cta.primary}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href={settings.phoneHref} className="btn border border-white/40 text-white hover:border-white hover:bg-white/10">
              <Phone className="size-4" aria-hidden="true" />
              {t.home.cta.secondary}
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
