import 'server-only'

import config from '@payload-config'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { getPayload } from 'payload'
import { cache } from 'react'

import { or } from '@/globals/shared'
import { DICTS } from '@/i18n/dictionaries'
import { isEmptyLexical, paragraphsToLexical } from '@/lib/lexical'
import type { Lang } from '@/types'

export type InfoKey = 'about' | 'privacy' | 'terms'
export type InfoContent = { title: string; body: SerializedEditorState }
export type FaqContent = { title: string; intro: string; items: { q: string; a: string }[]; more: string }
export type IntroContent = { title: string; intro: string }

/**
 * The Pages global for one language. Read without falling back to Armenian (fallbackLocale: false):
 * an empty text shows the dictionary text of the same language instead.
 * These pages are prerendered, so this runs at build time and after admin changes (revalidateSite).
 * `cache` lets generateMetadata and the page share one read per request.
 */
const load = cache(async (locale: Lang) => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'pages', locale, fallbackLocale: false, depth: 0 })
})

export async function getInfoPage(locale: Lang, key: InfoKey): Promise<InfoContent> {
  const g = (await load(locale))[key]
  const d = DICTS[locale].info[key]
  const body = g?.body as SerializedEditorState | null | undefined
  return { title: or(g?.title, d.title), body: body && !isEmptyLexical(body) ? body : paragraphsToLexical(d.body) }
}

export async function getFaqPage(locale: Lang): Promise<FaqContent> {
  const g = (await load(locale)).faq
  const d = DICTS[locale].faq
  const items = (g?.items ?? []).filter((i) => i.question?.trim() && i.answer?.trim()).map((i) => ({ q: i.question, a: i.answer }))
  return { title: or(g?.title, d.title), intro: or(g?.intro, d.intro), items: items.length ? items : d.items, more: or(g?.more, d.more) }
}

export async function getIntro(locale: Lang, key: 'contact' | 'submit'): Promise<IntroContent> {
  const g = (await load(locale))[key]
  const d = DICTS[locale][key]
  return { title: or(g?.title, d.title), intro: or(g?.intro, d.intro) }
}
