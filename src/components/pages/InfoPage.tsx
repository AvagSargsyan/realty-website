import { RichText } from "@payloadcms/richtext-lexical/react"
import { Link } from "@/i18n/client"
import type { Dict } from "@/i18n/dictionaries"
import type { InfoContent, InfoKey } from "@/lib/pages"

/** Styles for what the Pages editor allows: paragraphs, h2/h3, bold, italic, lists and links. */
const prose = [
  "mt-8 space-y-5 text-lg leading-relaxed text-ink/85",
  "[&_h2]:pt-4 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-ink",
  "[&_h3]:pt-2 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-ink",
  "[&_ul]:list-disc [&_ol]:list-decimal [&_ul,&_ol]:space-y-2 [&_ul,&_ol]:ps-6",
  "[&_a]:font-semibold [&_a]:text-iris-ink [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-bold [&_strong]:text-ink",
].join(" ")

/** Short text pages linked from the footer: About, Privacy, Terms. Texts from Admin → Settings → Pages. */
export function InfoPage({ t, page, content }: { t: Dict; page: InfoKey; content: InfoContent }) {
  return (
    <div className="container-page pt-8 pb-24 md:pt-12">
      <article className="mx-auto max-w-3xl">
        <h1 className="border-b border-line pb-8 text-3xl leading-tight font-extrabold text-ink md:text-5xl">{content.title}</h1>
        <RichText data={content.body} className={prose} disableIndent disableTextAlign />
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
