'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { SiteSettings } from '@/lib/settings'

const SettingsContext = createContext<SiteSettings | null>(null)

/** Site settings (contacts, rates) loaded on the server by the layout and shared with client components. */
export function SettingsProvider({ value, children }: { value: SiteSettings; children: ReactNode }) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SiteSettings {
  const s = useContext(SettingsContext)
  if (!s) throw new Error('useSettings must be used inside <SettingsProvider>')
  return s
}
