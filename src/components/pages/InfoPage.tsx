import { Link } from "@/i18n/client"
import type { Dict } from "@/i18n/dictionaries"

export type InfoKey = "about" | "privacy" | "terms"

/** Short text pages linked from the footer: About, Privacy, Terms (server component; a Pages collection comes in Stage 3). */
export function InfoPage({ t, page }: { t: Dict; page: InfoKey }) {
  const content = t.info[page]
  return (
    <div className="container-page pt-8 pb-24 md:pt-12">
      <article className="mx-auto max-w-3xl">
        <h1 className="border-b border-line pb-8 text-3xl leading-tight font-extrabold text-ink md:text-5xl">{content.title}</h1>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/85">
          {content.body.map((p) => <p key={p}>{p}</p>)}
        </div>
        {page === "about" && (
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/listings" className="btn-primary">{t.favorites.browse}</Link>
            <Link href="/contact" className="btn-secondary">{t.nav.contact}</Link>
          </div>
        )}
      </article>
    </div>
  )
}
