import { Plus } from "lucide-react"
import { Link } from "@/i18n/client"
import type { Dict } from "@/i18n/dictionaries"
import type { FaqContent } from "@/lib/pages"
import type { SiteSettings } from "@/lib/settings"

/** FAQ, ported from the demo as a server component. Texts from Admin → Settings → Pages → FAQ. */
export function FaqPage({ t, settings, content }: { t: Dict; settings: SiteSettings; content: FaqContent }) {
  return (
    <div className="container-page pt-8 pb-20 md:pt-12">
      <div className="mx-auto max-w-3xl">
        <div className="border-b border-line pb-8">
          <h1 className="text-3xl leading-tight font-extrabold text-ink md:text-5xl">{content.title}</h1>
          <p className="mt-4 text-lg text-muted-ink">{content.intro}</p>
        </div>

        <div className="divide-y divide-line border-b border-line">
          {content.items.map((item, i) => (
            <details key={item.q} className="group py-1" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-heading text-lg font-bold text-ink select-none hover:text-iris-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus className="size-5 shrink-0 text-muted-ink transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-muted-ink">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-surface p-6 md:p-8">
          <p className="font-heading text-xl font-extrabold text-ink">{content.more}</p>
          <div className="flex flex-wrap gap-3">
            <a href={settings.phoneHref} className="btn-secondary">{t.property.call}</a>
            <Link href="/contact" className="btn-primary">{t.nav.contact}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
