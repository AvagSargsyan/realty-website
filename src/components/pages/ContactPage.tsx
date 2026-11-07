import { Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react"
import { ContactForm } from "@/components/forms/ContactForm"
import type { Dict } from "@/i18n/dictionaries"
import type { SiteSettings } from "@/lib/settings"

/** Contact page, ported from the demo as a server component; contacts and hours come from Site settings. */
export function ContactPage({ t, settings }: { t: Dict; settings: SiteSettings }) {
  const rows: { icon: LucideIcon; label: string; value: string; href?: string; external?: boolean }[] = [
    { icon: Phone, label: t.contact.phone, value: settings.phone, href: settings.phoneHref },
    { icon: MessageCircle, label: t.contact.whatsapp, value: t.contact.writeWhatsapp, href: settings.whatsappHref, external: true },
    { icon: Mail, label: t.contact.email, value: settings.email, href: `mailto:${settings.email}` },
    { icon: MapPin, label: t.contact.office, value: settings.address },
    { icon: Clock, label: t.contact.hours, value: settings.hours || t.contact.hoursValue },
  ]

  return (
    <div className="container-page pt-8 pb-20 md:pt-12">
      <div className="max-w-2xl border-b border-line pb-8">
        <h1 className="text-3xl leading-tight font-extrabold text-ink md:text-5xl">{t.contact.title}</h1>
        <p className="mt-4 text-lg text-muted-ink">{t.contact.intro}</p>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
        <ul className="divide-y divide-line self-start">
          {rows.map((r) => {
            const body = (
              <>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-iris-tint text-iris-ink">
                  <r.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-muted-ink">{r.label}</span>
                  <span className="mt-0.5 block font-semibold text-ink transition-colors group-hover:text-iris-ink">{r.value}</span>
                </span>
              </>
            )
            return (
              <li key={r.label} className="py-4 first:pt-0">
                {r.href ? (
                  <a href={r.href} {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex items-center gap-4">
                    {body}
                  </a>
                ) : (
                  <div className="flex items-center gap-4">{body}</div>
                )}
              </li>
            )
          })}
        </ul>

        <section aria-labelledby="contact-form" className="rounded-lg border border-line bg-background p-6 md:p-8">
          <h2 id="contact-form" className="mb-6 text-2xl font-extrabold text-ink">{t.contact.formTitle}</h2>
          <ContactForm />
        </section>
      </div>
    </div>
  )
}
