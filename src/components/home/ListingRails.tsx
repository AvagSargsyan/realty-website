"use client"

import { useId } from "react"
import { motion } from "motion/react"
import { useT } from "@/i18n/client"
import { ListingCard } from "@/components/listing/ListingCard"
import { cn } from "@/lib/utils"
import type { Listing } from "@/types"
import { RailButtons, SectionHeading, useRail } from "./Section"

/* Scroll track that bleeds to the screen edge inside .container-page, with matching snap padding. */
const track =
  "no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pt-1 pb-6 md:-mx-8 md:scroll-px-8 md:px-8"

/** "Exclusive" carousel on a dark petrol band (the section uses the dark token set in both themes). */
export function ExclusiveCarousel({ items, total, viewAllHref }: { items: Listing[]; total: number; viewAllHref: string }) {
  const { t } = useT()
  const { ref: trackRef, edges, scroll } = useRail()
  const id = useId()
  return (
    <section aria-labelledby={`${id}-title`} className="dark bg-surface py-16 text-ink md:py-24">
      <div className="container-page">
        <SectionHeading
          id={`${id}-title`}
          eyebrow={t.home.exclusive.eyebrow}
          title={t.home.exclusive.title}
          intro={t.home.exclusive.intro}
          link={{ to: viewAllHref, label: t.home.viewAllCount(total) }}
        >
          <RailButtons edges={edges} scroll={scroll} controls={`${id}-track`} />
        </SectionHeading>
        <div ref={trackRef} id={`${id}-track`} className={cn(track, "gap-6")}>
          {items.map((l, i) => (
            <motion.div
              key={l.id}
              className="w-[84%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%] xl:w-[23.6%]"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: Math.min(i, 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <ListingCard listing={l} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Blu Dot-style category row: heading + "View all (n)", then a horizontal row of cards with thin dividers. */
export function CategoryRow({ title, items, total, viewAllHref, className }: { title: string; items: Listing[]; total: number; viewAllHref: string; className?: string }) {
  const { t } = useT()
  const { ref: trackRef, edges, scroll } = useRail()
  const id = useId()
  return (
    <section aria-labelledby={`${id}-title`} className={cn("container-page", className)}>
      <SectionHeading
        id={`${id}-title`}
        title={title}
        link={{ to: viewAllHref, label: t.home.viewAllCount(total) }}
        className="border-b border-line pb-5 md:mb-8"
      >
        <RailButtons edges={edges} scroll={scroll} controls={`${id}-track`} />
      </SectionHeading>
      <div ref={trackRef} id={`${id}-track`} className={track}>
        {items.map((l) => (
          <div
            key={l.id}
            className="w-[80%] shrink-0 snap-start border-l border-line px-5 first:border-l-0 first:pl-0 sm:w-[46%] md:px-6 lg:w-[32%] xl:w-[24.5%]"
          >
            <ListingCard listing={l} />
          </div>
        ))}
      </div>
    </section>
  )
}
