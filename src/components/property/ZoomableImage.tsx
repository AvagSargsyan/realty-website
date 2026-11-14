"use client"

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ImgHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export const MIN_ZOOM = 1
export const MAX_ZOOM = 5
const STEP = 1.6 // button / key zoom factor
const DOUBLE = 2.5 // zoom level for a click (mouse) or double-tap (touch)

export type ZoomHandle = { zoomIn: () => void; zoomOut: () => void; reset: () => void }
type View = { s: number; x: number; y: number }
const IDENTITY: View = { s: 1, x: 0, y: 0 }

/**
 * Photo with standard zoom: pinch (touch + trackpad), Ctrl/⌘ + wheel, click (mouse) / double-tap (touch),
 * drag to pan when zoomed, plus an imperative handle for buttons and keys.
 * Zoom is anchored at the pointer, and panning is clamped so the photo can't be dragged off screen.
 */
export const ZoomableImage = forwardRef<
  ZoomHandle,
  ImgHTMLAttributes<HTMLImageElement> & { active: boolean; onZoomChange?: (zoomed: boolean) => void; onSwipe?: (dir: -1 | 1) => void }
>(function ZoomableImage({ active, onZoomChange, onSwipe, className, ...img }, ref) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [view, setView] = useState<View>(IDENTITY)
  const [gesturing, setGesturing] = useState(false)
  const viewRef = useRef(view)
  viewRef.current = view
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ dist: number; s: number; mid: { x: number; y: number } } | null>(null)
  const swipe = useRef<{ x: number; y: number } | null>(null) // one-finger drag at normal size
  const lastTap = useRef(0)
  const down = useRef<{ x: number; y: number } | null>(null) // where a mouse press started, to tell a click from a drag

  /** Keep the photo covering its box: no empty space dragged into view. */
  const clamp = useCallback((v: View): View => {
    const el = imgRef.current
    const s = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.s))
    if (!el || s === 1) return { s, x: 0, y: 0 }
    const maxX = ((s - 1) * el.offsetWidth) / 2
    const maxY = ((s - 1) * el.offsetHeight) / 2
    return { s, x: Math.min(maxX, Math.max(-maxX, v.x)), y: Math.min(maxY, Math.max(-maxY, v.y)) }
  }, [])

  /** Zoom to `s`, keeping the screen point (cx, cy) fixed under the pointer. */
  const zoomAt = useCallback(
    (s: number, cx?: number, cy?: number) => {
      const el = imgRef.current
      if (!el) return
      const v = viewRef.current
      const r = el.getBoundingClientRect()
      // pointer relative to the image centre, in current screen pixels
      const px = (cx ?? r.left + r.width / 2) - (r.left + r.width / 2)
      const py = (cy ?? r.top + r.height / 2) - (r.top + r.height / 2)
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s))
      const k = next / v.s
      setView(clamp({ s: next, x: v.x - px * (k - 1), y: v.y - py * (k - 1) }))
    },
    [clamp],
  )

  useImperativeHandle(ref, () => ({
    zoomIn: () => zoomAt(viewRef.current.s * STEP),
    zoomOut: () => zoomAt(viewRef.current.s / STEP),
    reset: () => setView(IDENTITY),
  }), [zoomAt])

  // reset when this photo stops being the current one
  useEffect(() => {
    if (!active) setView(IDENTITY)
  }, [active])
  useEffect(() => {
    onZoomChange?.(view.s > 1.01)
  }, [view.s > 1.01]) // eslint-disable-line react-hooks/exhaustive-deps

  // Wheel needs a non-passive listener to stop the page from zooming.
  useEffect(() => {
    const el = imgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey && viewRef.current.s === 1) return // plain wheel: let the carousel/page be
      e.preventDefault()
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025)) // trackpad pinch sends ctrl + small deltas
      zoomAt(viewRef.current.s * factor, e.clientX, e.clientY)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [zoomAt])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    down.current = e.pointerType === "mouse" ? { x: e.clientX, y: e.clientY } : null
    setGesturing(true)
    if (pointers.current.size === 2) {
      // second finger: switch from swipe to pinch
      if (swipe.current) setView((v) => ({ ...v, x: 0, y: 0 }))
      swipe.current = null
      const [a, b] = [...pointers.current.values()]
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), s: viewRef.current.s, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
    } else if (viewRef.current.s === 1) {
      swipe.current = { x: e.clientX, y: e.clientY }
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      zoomAt((pinch.current.s * dist) / pinch.current.dist, pinch.current.mid.x, pinch.current.mid.y)
    } else if (viewRef.current.s > 1) {
      const v = viewRef.current
      setView(clamp({ ...v, x: v.x + e.clientX - prev.x, y: v.y + e.clientY - prev.y }))
    } else if (swipe.current && onSwipe) {
      // follow the finger horizontally while swiping between photos
      setView({ s: 1, x: e.clientX - swipe.current.x, y: 0 })
    }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const start = swipe.current
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
    if (pointers.current.size === 0) {
      setGesturing(false)
      swipe.current = null
      if (start && viewRef.current.s === 1) {
        const dx = e.clientX - start.x
        const dy = e.clientY - start.y
        setView(IDENTITY)
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
          onSwipe?.(dx < 0 ? 1 : -1)
          lastTap.current = 0
          return
        }
      }
    }
    // Mouse: a click (pressed and released without dragging) zooms in at that point, or back out
    const press = down.current
    down.current = null
    if (e.type === "pointerup" && press && Math.hypot(e.clientX - press.x, e.clientY - press.y) < 5) {
      toggleAt(e.clientX, e.clientY)
      return
    }
    // Touch: double-tap (a single tap is too easy to trigger while swiping)
    if (e.pointerType === "touch" && pointers.current.size === 0) {
      const now = Date.now()
      if (now - lastTap.current < 300) {
        toggleAt(e.clientX, e.clientY)
        lastTap.current = 0
      } else lastTap.current = now
    }
  }

  const toggleAt = (cx: number, cy: number) => (viewRef.current.s > 1 ? setView(IDENTITY) : zoomAt(DOUBLE, cx, cy))

  return (
    <img
      ref={imgRef}
      {...img}
      alt={img.alt ?? ""}
      draggable={false}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})`,
        transition: gesturing ? "none" : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
        touchAction: "none",
      }}
      className={cn("select-none will-change-transform", view.s > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in", className)}
    />
  )
})
