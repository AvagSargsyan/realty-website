"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Dialog } from "radix-ui"
import { ChevronLeft, ChevronRight, Grid2x2, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react"
import { useT } from "@/i18n/client"
import type { Photo } from "@/types"
import { cn } from "@/lib/utils"
import { ZoomableImage, type ZoomHandle } from "./ZoomableImage"

function useEmblaIndex(api: ReturnType<typeof useEmblaCarousel>[1]) {
  const [index, setIndex] = useState(0)
  const onSelect = useCallback(() => api && setIndex(api.selectedScrollSnap()), [api])
  useEffect(() => {
    if (!api) return
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api, onSelect])
  return index
}

/**
 * Full-screen photo viewer with zoom: pinch, Ctrl/⌘ + wheel, double-click/tap, drag to pan,
 * ＋/−/reset buttons and keys (+ − 0). Swiping and ← → change photo; Esc closes.
 * The carousel's own dragging is off here: ZoomableImage handles swipe so it never fights a pinch.
 */
function Lightbox({ photos, title, open, start, onOpenChange }: { photos: Photo[]; title: string; open: boolean; start: number; onOpenChange: (o: boolean) => void }) {
  const { t } = useT()
  const [ref, api] = useEmblaCarousel({ loop: true, startIndex: start, duration: 24, watchDrag: false })
  const index = useEmblaIndex(api)
  const zooms = useRef<(ZoomHandle | null)[]>([])
  const [zoomed, setZoomed] = useState(false)
  const current = () => zooms.current[index]

  useEffect(() => {
    if (open) api?.scrollTo(start, true)
  }, [open, start, api])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") api?.scrollPrev()
      else if (e.key === "ArrowRight") api?.scrollNext()
      else if (e.key === "+" || e.key === "=") current()?.zoomIn()
      else if (e.key === "-" || e.key === "_") current()?.zoomOut()
      else if (e.key === "0") current()?.reset()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }) // re-bound each render so it always targets the current photo

  const tool = "grid size-11 place-items-center rounded-full text-white transition-[background-color,opacity] hover:bg-white/15 disabled:pointer-events-none disabled:opacity-35"

  const nav = "absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-[background-color,scale] hover:bg-white/20 active:scale-95 md:grid"

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/95 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-0 z-[80] flex flex-col bg-[#060a0c] outline-none" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <div className="flex items-center justify-between px-4 py-3 text-white md:px-6">
            <p className="text-sm font-medium tabular-nums" aria-live="polite">{t.property.gallery.counter(index + 1, photos.length)}</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => current()?.zoomOut()} disabled={!zoomed} aria-label={t.property.gallery.zoomOut} className={tool}>
                <ZoomOut className="size-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => current()?.zoomIn()} aria-label={t.property.gallery.zoomIn} className={tool}>
                <ZoomIn className="size-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => current()?.reset()} disabled={!zoomed} aria-label={t.property.gallery.zoomReset} className={tool}>
                <RotateCcw className="size-5" aria-hidden="true" />
              </button>
              <span className="mx-1 h-6 w-px bg-white/20" aria-hidden="true" />
              <Dialog.Close className={tool} aria-label={t.property.gallery.close}>
                <X className="size-6" aria-hidden="true" />
              </Dialog.Close>
            </div>
          </div>
          <div className="relative flex-1">
            <div ref={ref} className="absolute inset-0 overflow-hidden">
              <div className="flex h-full">
                {photos.map((p, i) => (
                  <div key={p.full} className="flex h-full min-w-0 flex-[0_0_100%] items-center justify-center overflow-hidden px-2 md:px-20">
                    <ZoomableImage
                      ref={(h) => {
                        zooms.current[i] = h
                      }}
                      active={i === index}
                      onZoomChange={(z) => i === index && setZoomed(z)}
                      onSwipe={(dir) => (dir > 0 ? api?.scrollNext() : api?.scrollPrev())}
                      // full-size originals so zooming stays sharp
                      src={p.full}
                      srcSet={`${p.large} 1600w, ${p.full} 2000w`}
                      sizes="100vw"
                      alt={`${title}: ${t.card.photo(i + 1, photos.length)}`}
                      loading={Math.abs(i - start) <= 1 ? "eager" : "lazy"}
                      className="max-h-full max-w-full rounded-sm object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => api?.scrollPrev()} aria-label={t.card.prevPhoto} className={cn(nav, "left-4")}>
              <ChevronLeft className="size-6" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => api?.scrollNext()} aria-label={t.card.nextPhoto} className={cn(nav, "right-4")}>
              <ChevronRight className="size-6" aria-hidden="true" />
            </button>
          </div>
          {/* thumbnails */}
          <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto overflow-y-hidden px-4 py-4">
            {photos.map((p, i) => (
              <button
                key={p.full}
                type="button"
                onClick={() => api?.scrollTo(i)}
                aria-label={t.property.gallery.open(i + 1)}
                aria-current={i === index}
                className={cn("h-14 w-20 shrink-0 overflow-hidden rounded-sm transition-opacity", i === index ? "opacity-100 ring-2 ring-white" : "opacity-50 hover:opacity-80")}
              >
                <img src={p.thumb} alt="" className="size-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** Property photos: Airbnb-style grid on desktop, swipeable carousel on phones; both open the lightbox. */
export function Gallery({ photos, title }: { photos: Photo[]; title: string }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const [start, setStart] = useState(0)
  const [mRef, mApi] = useEmblaCarousel({ loop: true, duration: 22 })
  const mIndex = useEmblaIndex(mApi)
  const show = (i: number) => {
    setStart(i)
    setOpen(true)
  }
  const tiles = photos.slice(0, 5)
  const five = tiles.length >= 5

  return (
    <>
      {/* Phones: swipe */}
      <div className="relative -mx-4 md:hidden">
        <div ref={mRef} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {photos.map((p, i) => (
              <button key={p.full} type="button" onClick={() => show(i)} aria-label={t.property.gallery.open(i + 1)} className="aspect-[4/3] min-w-0 flex-[0_0_100%]">
                <img src={p.card} srcSet={`${p.thumb} 480w, ${p.card} 800w, ${p.large} 1600w`} sizes="100vw" alt={i === 0 ? title : ""} loading={i === 0 ? "eager" : "lazy"} draggable={false} className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <span className="pointer-events-none absolute right-4 bottom-4 rounded-sm bg-night/80 px-2.5 py-1 text-xs font-semibold text-white tabular-nums">
          {t.property.gallery.counter(mIndex + 1, photos.length)}
        </span>
      </div>

      {/* Tablet and up: grid */}
      <div className={cn("relative hidden h-[420px] gap-2 overflow-hidden rounded-lg md:grid lg:h-[520px]", five ? "grid-cols-4 grid-rows-2" : "grid-cols-3 grid-rows-2")}>
        {tiles.map((p, i) => (
          <button
            key={p.full}
            type="button"
            onClick={() => show(i)}
            aria-label={t.property.gallery.open(i + 1)}
            className={cn("group relative overflow-hidden bg-surface", i === 0 && "col-span-2 row-span-2", !five && i > 2 && "hidden")}
          >
            <img
              src={i === 0 ? p.large : p.card}
              srcSet={i === 0 ? `${p.card} 800w, ${p.large} 1600w, ${p.full} 2000w` : `${p.thumb} 480w, ${p.card} 800w`}
              sizes={i === 0 ? "50vw" : "25vw"}
              alt={i === 0 ? title : ""}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              className="size-full object-cover transition-[scale,filter] duration-500 ease-out group-hover:scale-[1.03] group-hover:brightness-95"
            />
          </button>
        ))}
        <button type="button" onClick={() => show(0)} className="btn absolute right-4 bottom-4 h-10 bg-background px-4 text-ink shadow-md hover:bg-surface">
          <Grid2x2 className="size-4" aria-hidden="true" />
          {t.property.gallery.showAll(photos.length)}
        </button>
      </div>

      <Lightbox photos={photos} title={title} open={open} start={start} onOpenChange={setOpen} />
    </>
  )
}
