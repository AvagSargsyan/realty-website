'use client'

import { usePathname } from 'next/navigation'
import { useThemeSync } from './preferences'

/** Mounted once in the layout: keeps the `dark` class right across navigations and system theme changes. */
export function ThemeSync() {
  useThemeSync(usePathname())
  return null
}
