'use client'

import { useTheme, useTranslation } from '@payloadcms/ui'
import { ArrowLeft, ExternalLink, Moon, Sun } from 'lucide-react'

// In the editor's admin language (Account → Language)
const LABELS = {
  open: { hy: 'Բացել կայքը', en: 'Open website', ru: 'Открыть сайт' },
  back: { hy: 'Վերադառնալ կայք', en: 'Back to website', ru: 'Вернуться на сайт' },
  theme: { hy: 'Փոխել լուսավոր / մուգ ռեժիմը', en: 'Switch light / dark mode', ru: 'Переключить светлую / тёмную тему' },
} as const

type Lang = keyof (typeof LABELS)['open']

function useLabel(key: keyof typeof LABELS) {
  const { i18n } = useTranslation()
  const lang = (i18n.language in LABELS[key] ? i18n.language : 'en') as Lang
  return LABELS[key][lang]
}

/** Bottom of the admin sidebar (admin.components.afterNavLinks): opens the public site in a new tab. */
export function OpenSiteLink() {
  const label = useLabel('open')
  return (
    <a href="/" target="_blank" rel="noreferrer" className="avenue-site-link">
      {label}
      <ExternalLink aria-hidden="true" />
    </a>
  )
}

/**
 * Light/dark switch, like the one in the site header. Payload keeps the choice in a cookie
 * (the same setting as Account → Theme); until one is picked the admin follows the system theme.
 */
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const label = useLabel('theme')
  const isDark = theme === 'dark'
  return (
    <button type="button" className="avenue-theme-switch" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label={label} title={label}>
      {isDark ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
    </button>
  )
}

/**
 * Under the login form (admin.components.afterLogin): the way back for someone who came from the
 * site, and the theme switch (the login screen has no header).
 */
export function LoginExtras() {
  const label = useLabel('back')
  return (
    <div className="avenue-login-extras">
      {/* Plain <a>: the site is a separate app (its own root layout), so this is a full page load anyway */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="avenue-site-link">
        <ArrowLeft aria-hidden="true" />
        {label}
      </a>
      <ThemeSwitch />
    </div>
  )
}
