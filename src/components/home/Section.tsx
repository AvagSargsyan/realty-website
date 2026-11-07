"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { motion } from "motion/react"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Link, useT } from "@/i18n/client"
import { cn } from "@/lib/utils"

export const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 }, // appear as soon as a sliver is visible, so nothing looks empty
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
}

/** Section title row (Blu Dot style): eyebrow + title on the left, a "View all" link and/or controls on the right. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  link,
  children,
  className,
}: {
  id: string
  eyebrow?: string
  title: string
  intro?: string
  link?: { to: string; label: string }
  children?: ReactNode
  className?: string
}) {
  return (
    <motion.div {...fadeUp} className={cn("mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 md:mb-10", className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-3 inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.22em] text-iris-ink uppercase">
            <span className="h-px w-8 bg-brand-bright" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h2 id={id} className="text-3xl leading-tight font-extrabold text-ink md:text-4xl">
          {title}
        </h2>
        {intro && <p className="mt-3 text-base text-muted-ink md:text-lg">{intro}</p>}
      </div>
      <div className="flex items-center gap-4">
        {link && (
          <Link href={link.to} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-iris-ink">
            <span className="link-underline">{link.label}</span>
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        )}
        {children}
      </div>
    </motion.div>
  )
}

/** Horizontal, swipeable row with snap points and prev/next buttons (native scrolling, so it works with touch, trackpad and keyboard). */
export function useRail() {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
    }
  }, [update])

  const scroll = (dir: -1 | 1) => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" })
  }

  return { ref, edges, scroll }
}

export function RailButtons({ edges, scroll, controls }: { edges: { start: boolean; end: boolean }; scroll: (dir: -1 | 1) => void; controls: string }) {
  const { t } = useT()
  const cls =
    "grid size-11 place-items-center rounded-full border border-line bg-background text-ink transition-[background-color,border-color,color,opacity,scale] duration-200 hover:border-iris-ink hover:text-iris-ink active:scale-95 disabled:pointer-events-none disabled:opacity-35"
  return (
    <div className="hidden gap-2 md:flex">
      <button type="button" aria-controls={controls} aria-label={t.home.prev} disabled={edges.start} onClick={() => scroll(-1)} className={cls}>
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button type="button" aria-controls={controls} aria-label={t.home.next} disabled={edges.end} onClick={() => scroll(1)} className={cls}>
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </div>
  )
}
