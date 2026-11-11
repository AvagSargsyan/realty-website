"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { ArrowDown } from "lucide-react"
import { useT } from "@/i18n/client"
import { cn } from "@/lib/utils"
import type { HomeContent } from "@/lib/home"
import type { ListingDistrict, Photo } from "@/types"

type HeroContent = HomeContent["hero"]
import { SearchBox } from "./SearchBox"

/*
 * Free-licence Unsplash photos, saved as local WebP files in public/images/hero/ (800, 1200, 1800 px):
 * copper-glass: new copper-and-glass residential facade, Yerevan (Danila Rassokhin, photo-1727719391310-2510beb1674a)
 * luxury-house: white modern villa, pool and lawn (Salvo Media, photo-1783125127199-860da9744dcc; not Yerevan)
 * white-modern: modern white apartment building, Yerevan (Tigran Kharatyan, photo-1651752523215-9bf678c29355)
 */
const PHOTO_COPPER_GLASS = "copper-glass"
const PHOTO_LUXURY_HOUSE = "luxury-house"
const PHOTO_WHITE_MODERN = "white-modern"
const heroSrc = (name: string, w: number) => `/images/hero/${name}-${w}.webp`

const ease = [0.22, 1, 0.36, 1] as const
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease },
})

/** A built-in hero photo, or one picked in the Home page global (Payload sizes 480 / 800 / 1600 px). */
function Img({ id, photo, className, sizes = "50vw" }: { id: string; photo: Photo | null; className?: string; sizes?: string }) {
  return (
    <img
      src={photo ? photo.card : heroSrc(id, 1200)}
      srcSet={
        photo
          ? `${photo.thumb} 480w, ${photo.card} 800w, ${photo.large} 1600w`
          : `${heroSrc(id, 800)} 800w, ${heroSrc(id, 1200)} 1200w, ${heroSrc(id, 1800)} 1800w`
      }
      sizes={sizes}
      alt=""
      aria-hidden="true"
      loading="eager"
      fetchPriority="high"
      className={cn("size-full object-cover", className)}
    />
  )
}

/** Headline + search box, left side of the hero. */
function HeroText({ className, districts, content }: { className?: string; districts: ListingDistrict[]; content: HeroContent }) {
  return (
    <div className={cn("max-w-xl", className)}>
      <motion.p {...rise(0)} className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.22em] text-iris-ink uppercase">
        <span className="h-px w-8 bg-brand-bright" aria-hidden="true" />
        {content.eyebrow}
      </motion.p>
      <motion.h1 {...rise(0.06)} className="mt-5 text-4xl leading-[1.05] font-extrabold text-ink md:text-5xl xl:text-6xl">
        {content.title}
      </motion.h1>
      <motion.p {...rise(0.12)} className="mt-5 text-lg leading-relaxed text-muted-ink">
        {content.intro}
      </motion.p>
      <motion.div {...rise(0.18)} className="mt-8">
        <SearchBox districts={districts} />
      </motion.div>
    </div>
  )
}

/** Ruled-lines background (theme-aware: built from colour tokens). */
function BgLines() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-surface">
      <div className="absolute inset-0 [mask-image:linear-gradient(180deg,black,transparent_85%)] bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--ink)_7%,transparent)_1px,transparent_1px)] bg-[size:100%_44px]" />
    </div>
  )
}

/**
 * Scroll-down hint: an icon-only round button (same shape as the carousel arrows) with a thin
 * logo-orange arrow that drifts down. Bottom-left of the hero, under the text column and clear of
 * the mosaic. Jumps to the next section; fades out once the visitor starts scrolling.
 * The visible design has no text; the label is kept for screen readers.
 */
function ScrollCue() {
  const { t } = useT()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  const go = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = e.currentTarget.closest("section")?.nextElementSibling
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    next?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  }
  return (
    <motion.button
      type="button"
      onClick={go}
      initial={{ opacity: 0 }}
      animate={{ opacity: scrolled ? 0 : 1 }}
      transition={{ duration: 0.4, delay: scrolled ? 0 : 1 }}
      tabIndex={scrolled ? -1 : 0}
      aria-label={t.home.hero.scroll}
      title={t.home.hero.scroll}
      className={cn(
        // soft ring, translucent fill with a light blur; hover only firms the ring a little
        "group absolute bottom-7 left-4 z-10 hidden size-12 place-items-center rounded-full border border-line/70 bg-background/55 backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-line hover:bg-background/85 md:left-8 md:grid",
        scrolled && "pointer-events-none",
      )}
    >
      <ArrowDown className="scroll-nudge size-[18px] text-brand-bright" strokeWidth={1.75} aria-hidden="true" />
    </motion.button>
  )
}

/**
 * Home hero, "Stepped mosaic": text left; right, a staggered mosaic of property photos
 * (one tall residential tower + a luxury villa and a modern apartment building stacked),
 * soft shadows, ruled lines behind and a short logo-orange bar.
 */
export function Hero({ districts, content }: { districts: ListingDistrict[]; content: HeroContent }) {
  const tiles = [
    { id: PHOTO_COPPER_GLASS, cls: "row-span-2 md:translate-y-8", pos: "object-[50%_center]" },
    { id: PHOTO_LUXURY_HOUSE, cls: "md:-translate-y-6", pos: "object-[40%_center]" },
    { id: PHOTO_WHITE_MODERN, cls: "md:-translate-y-6", pos: "object-[50%_30%]" },
  ]
  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      <BgLines />
      <div className="container-page relative grid min-h-[580px] items-center gap-10 py-14 md:grid-cols-[1.05fr_1fr] md:py-0">
        <HeroText districts={districts} content={content} className="relative z-10 md:pt-20 md:pb-32" />
        <ScrollCue />
        <div className="relative md:my-14">
          <motion.div
            aria-hidden="true"
            className="absolute right-[12%] -bottom-3 z-10 h-1 w-24 rounded-full bg-brand-bright md:-bottom-1"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.6, ease }}
            style={{ originX: 1 }}
          />
          <div className="grid h-[380px] grid-cols-2 grid-rows-2 gap-3 md:h-[480px] md:gap-4">
            {tiles.map((tile, i) => (
              <motion.div
                key={tile.id}
                className={cn("group overflow-hidden rounded-md shadow-[0_24px_50px_-28px_rgba(0,0,0,0.45)]", tile.cls)}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.1 + i * 0.13, ease }}
              >
                <Img id={tile.id} photo={content.photos[i] ?? null} sizes="30vw" className={cn("transition-transform duration-700 ease-out group-hover:scale-[1.04]", tile.pos)} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
