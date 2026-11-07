"use client"

import { Mail, MapPin, Phone } from "lucide-react"
import { Link, useT } from "@/i18n/client"
import { useSettings } from "@/components/providers/SettingsProvider"
import { config } from "@/config"
import { Logo } from "./Logo"

const YEAR = new Date().getFullYear()

/* Brand icons are drawn inline (lucide no longer ships brand logos). */
const SocialIcon = ({ name }: { name: "facebook" | "instagram" | "telegram" }) => {
  const paths = {
    facebook: <path d="M14 8h2.5V4.5H14c-2.2 0-4 1.8-4 4V11H7.5v3.5H10V20h3.5v-5.5H16l.5-3.5h-3V8.5c0-.3.2-.5.5-.5Z" />,
    instagram: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16.8" cy="7.2" r="1.1" />
      </>
    ),
    telegram: <path d="M20.5 4.5 3.8 11c-.9.3-.9 1.6 0 1.9l4 1.3 1.6 4.9c.2.7 1.1.9 1.6.4l2.3-2.2 4.2 3.1c.6.4 1.4.1 1.6-.6l2.7-12.4c.2-.8-.6-1.4-1.3-1.2ZM9.5 14l7-5.6-5.7 6.6-.3 2.7-1-3.7Z" />,
  }
  return (
    <svg viewBox="0 0 24 24" className="size-[18px] fill-current" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

export function Footer() {
  const { t } = useT()
  const settings = useSettings()
  // Only the social networks that have a link in Site settings
  const socials = (["facebook", "instagram", "telegram"] as const).filter((key) => settings.socials[key])
  const columns = [
    {
      title: t.footer.explore,
      links: [
        { to: "/listings?deal=sale", label: t.nav.buy },
        { to: "/listings?deal=rent", label: t.nav.rent },
        { to: "/listings?deal=sale&type=house", label: t.typePlural.house },
        { to: "/listings?type=commercial", label: t.typePlural.commercial },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { to: "/about", label: t.footer.about },
        { to: "/faq", label: t.footer.faq },
        { to: "/submit", label: t.footer.submit },
        { to: "/contact", label: t.nav.contact },
      ],
    },
  ]

  return (
    <footer className="mt-24 bg-night text-white">
      {/* Phones: the two link lists sit side by side; brand and contact take the full width */}
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:gap-12 md:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="col-span-2 max-w-sm space-y-5 md:col-span-1">
          <Logo tone="light" />
          <p className="text-[0.95rem] leading-relaxed text-white/65">{t.footer.tagline}</p>
          <div className="flex gap-2">
            {socials.map((key) => (
              <a
                key={key}
                href={settings.socials[key]}
                target="_blank"
                rel="noreferrer"
                aria-label={key[0].toUpperCase() + key.slice(1)}
                className="grid size-10 place-items-center rounded-md border border-white/20 text-white transition-[background-color,border-color,color,translate] duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-night"
              >
                <SocialIcon name={key} />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-4 font-sans text-xs font-semibold tracking-[0.18em] text-white/50 uppercase">{col.title}</h2>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link href={l.to} className="link-underline text-[0.95rem] text-white/80 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="col-span-2 md:col-span-1">
          <h2 className="mb-4 font-sans text-xs font-semibold tracking-[0.18em] text-white/50 uppercase">{t.footer.contact}</h2>
          <ul className="space-y-3 text-[0.95rem] text-white/80">
            <li>
              <a href={settings.phoneHref} className="group/c inline-flex items-center gap-2.5 transition-colors hover:text-white">
                <Phone className="size-4 text-brand-bright" aria-hidden="true" /> {settings.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="group/c inline-flex items-center gap-2.5 transition-colors hover:text-white">
                <Mail className="size-4 text-brand-bright" aria-hidden="true" /> {settings.email}
              </a>
            </li>
            <li className="inline-flex items-center gap-2.5">
              <MapPin className="size-4 text-brand-bright" aria-hidden="true" /> {settings.address}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-5 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <p>© {YEAR} {config.brand} {config.brandTagline}. {t.footer.rights}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="link-underline hover:text-white">{t.footer.privacy}</Link>
            <Link href="/terms" className="link-underline hover:text-white">{t.footer.terms}</Link>
            <span className="rounded-sm border border-white/15 px-2 py-1 text-xs font-medium text-white/70">{t.footer.demo}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
