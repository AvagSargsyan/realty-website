"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Lang } from "@/types"

/**
 * Cloudflare Turnstile bot check for the forms. It runs only when a form is sent ("execute" mode) and
 * stays invisible unless Cloudflare wants the visitor to tick a box ("interaction-only"), so the
 * forms look as in the demo. Off when NEXT_PUBLIC_TURNSTILE_SITE_KEY is empty: getToken() then
 * returns undefined and the server skips the check too.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  execute: (widgetId: string) => void
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}
declare global {
  interface Window {
    turnstile?: Turnstile
  }
}

let scriptLoading: Promise<void> | null = null
function loadScript() {
  if (window.turnstile) return Promise.resolve()
  scriptLoading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script")
    s.src = SCRIPT_URL
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      scriptLoading = null
      reject(new Error("Turnstile script failed to load"))
    }
    document.head.appendChild(s)
  })
  return scriptLoading
}

export function useBotCheck(lang: Lang) {
  const container = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const waiting = useRef<((token: string | undefined) => void) | null>(null)
  const used = useRef(false)
  const [interactive, setInteractive] = useState(false)

  useEffect(() => {
    if (!SITE_KEY) return
    let cancelled = false
    const finish = (token: string | undefined) => {
      waiting.current?.(token)
      waiting.current = null
    }
    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return
        widgetId.current = window.turnstile.render(container.current, {
          sitekey: SITE_KEY,
          execution: "execute",
          appearance: "interaction-only",
          language: lang,
          callback: (token: string) => finish(token),
          "error-callback": () => finish(undefined),
          "expired-callback": () => finish(undefined),
          "before-interactive-callback": () => setInteractive(true),
          "after-interactive-callback": () => setInteractive(false),
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
      if (widgetId.current) window.turnstile?.remove(widgetId.current)
      widgetId.current = null
    }
  }, [lang])

  /** A fresh token for one submission (undefined when the check is off or couldn't run). */
  const getToken = useCallback((): Promise<string | undefined> => {
    const ts = window.turnstile
    const id = widgetId.current
    if (!SITE_KEY || !ts || !id) return Promise.resolve(undefined)
    return new Promise((resolve) => {
      waiting.current = resolve
      if (used.current) ts.reset(id)
      used.current = true
      ts.execute(id)
      // A visitor who has to tick the box gets time for it; after that the server says "couldn't verify"
      setTimeout(() => {
        if (waiting.current === resolve) {
          waiting.current = null
          resolve(undefined)
        }
      }, 60_000)
    })
  }, [])

  // Out of the layout (no empty row in the form's grid) until Cloudflare asks the visitor to tick the
  // box; then the checkbox appears here, above the send button. The form must be `relative`.
  const widget = SITE_KEY ? <div ref={container} className={interactive ? undefined : "absolute top-0 left-0"} /> : null
  return { widget, getToken }
}
