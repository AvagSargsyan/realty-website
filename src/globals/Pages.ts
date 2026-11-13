import {
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import type { Field, GlobalConfig, Tab } from 'payload'

import { anyone, isEditor } from '../collections/shared/access'
import { label, type AdminLabel } from '../collections/shared/labels'
import { DICTS, type Dict } from '../i18n/dictionaries'
import { paragraphsToLexical } from '../lib/lexical'
import { revalidateSite } from '../lib/revalidate'
import type { Lang } from '../types'
import { dictText as text } from './shared'

/**
 * Texts of the smaller pages: About, FAQ, Contact, Submit, Privacy and Terms.
 * Like the Home page global, every text starts as the website's own wording, and a text left empty
 * in a language shows that wording (src/lib/pages.ts).
 */

/** Only what fits the page design: headings, emphasis, lists and links to web addresses. */
const editor = lexicalEditor({
  features: [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    BoldFeature(),
    ItalicFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    // Internal links would need a link to a document; pages here are linked by their address instead
    LinkFeature({ enabledCollections: [] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})

const L = {
  title: label('Title', 'Վերնագիր', 'Заголовок'),
  intro: label('Text under the title', 'Տեքստ վերնագրի տակ', 'Текст под заголовком'),
  body: label('Page text', 'Էջի տեքստ', 'Текст страницы'),
}

const body = (pick: (d: Dict) => string[]): Field => ({
  name: 'body',
  type: 'richText',
  localized: true,
  label: L.body,
  editor,
  defaultValue: ({ locale }: { locale?: string }) => paragraphsToLexical(pick(DICTS[(locale ?? 'hy') as Lang])),
})

const tab = (name: string, tabLabel: AdminLabel, fields: Field[]): Tab => ({ name, label: tabLabel, fields })

export const Pages: GlobalConfig = {
  slug: 'pages',
  label: label('Pages', 'Էջեր', 'Страницы'),
  admin: {
    group: label('Settings', 'Կարգավորումներ', 'Настройки'),
    description: label(
      'Texts of the About, FAQ, Contact, Submit, Privacy and Terms pages. An empty text shows the built-in wording of that language.',
      'Մեր մասին, ՀՏՀ, Կապ, Ներկայացնել, Գաղտնիություն և Պայմաններ էջերի տեքստերը։ Դատարկ տեքստի փոխարեն ցուցադրվում է տվյալ լեզվի ներկառուցված տեքստը։',
      'Тексты страниц «О нас», FAQ, «Контакты», «Предложить объект», «Конфиденциальность» и «Условия». Вместо пустого текста показывается встроенный текст этого языка.',
    ),
  },
  access: { read: anyone, update: isEditor },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        tab('about', label('About', 'Մեր մասին', 'О нас'), [text('title', L.title, (d) => d.info.about.title), body((d) => d.info.about.body)]),
        tab('faq', label('FAQ', 'ՀՏՀ', 'FAQ'), [
          text('title', L.title, (d) => d.faq.title),
          text('intro', L.intro, (d) => d.faq.intro, true),
          {
            // Localized as a whole: each language has its own list, so a translation can add or drop questions
            name: 'items',
            type: 'array',
            localized: true,
            label: label('Questions', 'Հարցեր', 'Вопросы'),
            labels: {
              singular: label('Question', 'Հարց', 'Вопрос'),
              plural: label('Questions', 'Հարցեր', 'Вопросы'),
            },
            admin: { initCollapsed: true, components: { RowLabel: '/globals/FaqRowLabel#FaqRowLabel' } },
            defaultValue: ({ locale }: { locale?: string }) =>
              DICTS[(locale ?? 'hy') as Lang].faq.items.map((i) => ({ question: i.q, answer: i.a })),
            fields: [
              { name: 'question', type: 'text', required: true, label: label('Question', 'Հարց', 'Вопрос') },
              { name: 'answer', type: 'textarea', required: true, label: label('Answer', 'Պատասխան', 'Ответ') },
            ],
          },
          text('more', label('Text above the buttons at the bottom', 'Տեքստ ներքևի կոճակների վերևում', 'Текст над кнопками внизу'), (d) => d.faq.more),
        ]),
        tab('contact', label('Contact', 'Կապ', 'Контакты'), [
          text('title', L.title, (d) => d.contact.title),
          text('intro', L.intro, (d) => d.contact.intro, true),
        ]),
        tab('submit', label('Submit a property', 'Ներկայացնել գույք', 'Предложить объект'), [
          text('title', L.title, (d) => d.submit.title),
          text('intro', L.intro, (d) => d.submit.intro, true),
        ]),
        tab('privacy', label('Privacy', 'Գաղտնիություն', 'Конфиденциальность'), [
          text('title', L.title, (d) => d.info.privacy.title),
          body((d) => d.info.privacy.body),
        ]),
        tab('terms', label('Terms', 'Պայմաններ', 'Условия'), [
          text('title', L.title, (d) => d.info.terms.title),
          body((d) => d.info.terms.body),
        ]),
      ],
    },
  ],
}
