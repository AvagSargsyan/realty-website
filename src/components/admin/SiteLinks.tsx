'use client'

import { useTranslation } from '@payloadcms/ui'
import { ArrowLeft, ExternalLink } from 'lucide-react'

// In the editor's admin language (Account → Language)
const LABELS = {
  open: { hy: 'Բացել կայքը', en: 'Open website', ru: 'Открыть сайт' },
  back: { hy: 'Վերադառնալ կայք', en: 'Back to website', ru: 'Вернуться на сайт' },
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

/** Under the login form (admin.components.afterLogin): the way back for someone who came from the footer. */
export function BackToSiteLink() {
  const label = useLabel('back')
  // Plain <a>: the site is a separate app (its own root layout), so this is a full page load anyway
  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a href="/" className="avenue-site-link avenue-site-link--login">
      <ArrowLeft aria-hidden="true" />
      {label}
    </a>
  )
}
