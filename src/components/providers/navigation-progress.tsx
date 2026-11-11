"use client"

import { useLinkStatus } from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useSyncExternalStore, useTransition } from "react"

/**
 * A thin bar at the top of the page while a navigation is waiting for the server.
 *
 * Next.js has no global "navigation started" event, so the pending states are collected here:
 * every localized <Link> reports its useLinkStatus() and code that calls router.push/replace goes
 * through useNavigate(). The bar shows while any of them is pending. CSS delays it by 150 ms, so
 * navigations that are instant (prefetched pages, loading skeletons) never flash it.
 */

let pendingCount = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const isBusy = () => pendingCount > 0

/** Counts this component as "navigating" while `pending` is true. */
export function useReportPending(pending: boolean) {
  useEffect(() => {
    if (!pending) return
    pendingCount++
    emit()
    return () => {
      pendingCount--
      emit()
    }
  }, [pending])
}

/** Rendered inside every localized <Link> (src/i18n/client.tsx). */
export function LinkPending() {
  const { pending } = useLinkStatus()
  useReportPending(pending)
  return null
}

/** router.push/replace in a transition, so the progress bar and `pending` cover the server render. */
export function useNavigate() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  useReportPending(pending)
  const navigate = (href: string, { replace = false, scroll = true }: { replace?: boolean; scroll?: boolean } = {}) =>
    startTransition(() => (replace ? router.replace(href, { scroll }) : router.push(href, { scroll })))
  return { navigate, pending }
}

export function NavigationProgress() {
  const busy = useSyncExternalStore(subscribe, isBusy, () => false)
  return <div aria-hidden="true" className="nav-progress" data-active={busy || undefined} />
}
