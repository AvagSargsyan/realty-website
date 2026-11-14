'use client'

import { useCallback, useEffect, useLayoutEffect, useSyncExternalStore } from 'react'
import { THEME_COLORS, THEME_STORAGE_KEY } from '@/lib/theme'
import type { Currency, Theme } from '@/types'

/**
 * Visitor preferences kept in the browser (as in the demo): theme, currency, saved listings.
 *
 * Pages stay static and cached, so the server can't know these values. useSyncExternalStore renders
 * the default on the server and during hydration, then switches to the stored value without a
 * hydration error. The theme itself never flashes: an inline script at the start of <body> sets the `dark`
 * class before the first paint (see THEME_SCRIPT in lib/theme.ts).
 */

const KEYS = { theme: THEME_STORAGE_KEY, currency: 'avenue.currency', favorites: 'avenue.favorites' } as const
type Key = keyof typeof KEYS

const listeners = new Set<() => void>()
const cache = new Map<Key, { raw: string | null; value: unknown }>()

/** localStorage can be unavailable (private mode, blocked storage): never let it break the page. */
function read<T>(key: Key, fallback: T): T {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEYS[key])
  } catch {
    /* ignore */
  }
  // Return the same object while the stored string is unchanged (useSyncExternalStore needs stable snapshots)
  const hit = cache.get(key)
  if (hit && hit.raw === raw) return hit.value as T
  let value: T = fallback
  try {
    value = raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    /* ignore */
  }
  cache.set(key, { raw, value })
  return value
}

function write(key: Key, value: unknown) {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Keep other tabs in sync
  const onStorage = (e: StorageEvent) => {
    if (e.key && Object.values(KEYS).includes(e.key as (typeof KEYS)[Key])) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function usePref<T>(key: Key, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  )
  const set = useCallback((v: T) => write(key, v), [key])
  return [value, set] as const
}

const NO_FAVORITES: number[] = []

export function useCurrency() {
  return usePref<Currency>('currency', 'USD')
}

export function useFavorites() {
  const [favorites, setFavorites] = usePref<number[]>('favorites', NO_FAVORITES)
  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites])
  const toggleFavorite = useCallback(
    (id: number) => {
      const current = read<number[]>('favorites', NO_FAVORITES)
      setFavorites(current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
    },
    [setFavorites],
  )
  return { favorites, isFavorite, toggleFavorite }
}

/* ---------- Theme ---------- */

function subscribeSystemDark(listener: () => void) {
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
  mq?.addEventListener('change', listener)
  return () => mq?.removeEventListener('change', listener)
}

export function useTheme() {
  const [theme, setThemePref] = usePref<Theme>('theme', 'system')
  const systemDark = useSyncExternalStore(
    subscribeSystemDark,
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
    () => false,
  )
  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  const setTheme = useCallback(
    (t: Theme) => {
      setThemePref(t)
      const dark =
        t === 'dark' || (t === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
      applyTheme(dark)
    },
    [setThemePref],
  )
  return { theme, setTheme, resolvedTheme }
}

/**
 * Follows the system theme while "auto" is selected. Listens to the media query directly instead of
 * reacting to resolvedTheme, which is "light" during hydration and would briefly undo dark mode.
 */
export function useThemeSync(pathname: string) {
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const onChange = () => {
      if (read<Theme>('theme', 'system') === 'system') applyTheme(mq.matches)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Switching language re-renders <html> (it is in the [locale] layout) and drops the `dark` class,
  // while the inline theme script only runs on full page loads. Re-apply the stored theme before paint
  // after every navigation. Reads storage directly, so it agrees with the script during hydration.
  useLayoutEffect(() => {
    applyTheme(storedThemeIsDark())
  }, [pathname])
}

function storedThemeIsDark() {
  const t = read<Theme>('theme', 'system')
  return t === 'dark' || (t === 'system' && (window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false))
}

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? THEME_COLORS.dark : THEME_COLORS.light)
}

const noopSubscribe = () => () => {}

/** false on the server and during hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}
