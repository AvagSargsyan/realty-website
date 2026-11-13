import type { Field, GlobalConfig } from 'payload'

import { isEditor, anyone } from '../collections/shared/access'
import { fromDict, label, type AdminLabel } from '../collections/shared/labels'
import { revalidateSite } from '../lib/revalidate'
import { dictText as text } from './shared'

/**
 * Editable texts, hero photos and listing picks for the home page.
 * Every text starts as the website's own wording (the dictionaries). A field left empty in a language
 * shows that wording too (src/lib/home.ts), so the page never goes blank or shows another language.
 */

const L = {
  eyebrow: label('Small line above the title', 'Փոքր տող վերնագրից վերև', 'Строка над заголовком'),
  title: label('Title', 'Վերնագիր', 'Заголовок'),
  intro: label('Text', 'Տեքստ', 'Текст'),
  button: label('Link text', 'Հղման տեքստ', 'Текст ссылки'),
}

/** Where a row of listings comes from. Everything except "manual" is a live query. */
export const ROW_SOURCES = ['exclusive', 'new', 'rent', 'sale', 'penthouse', 'newConstruction', 'manual'] as const
export type RowSource = (typeof ROW_SOURCES)[number]

const sourceOptions = [
  { value: 'exclusive', label: fromDict((d) => d.tag.exclusive) },
  { value: 'new', label: fromDict((d) => d.tag.new) },
  { value: 'rent', label: fromDict((d) => d.deal.rent) },
  { value: 'sale', label: fromDict((d) => d.deal.sale) },
  { value: 'penthouse', label: fromDict((d) => d.tag.penthouse) },
  { value: 'newConstruction', label: fromDict((d) => d.tag.newConstruction) },
  { value: 'manual', label: label('Picked by hand', 'Ընտրված ձեռքով', 'Выбранные вручную') },
]

/** Source select + hand-picked listings (shown only for "manual"). */
const rowSource = (defaultSource: RowSource): Field[] => [
  {
    name: 'source',
    type: 'select',
    required: true,
    defaultValue: defaultSource,
    options: sourceOptions,
    label: label('Listings shown', 'Ցուցադրվող հայտարարություններ', 'Какие объявления показывать'),
    admin: {
      description: label(
        'Newest first. "Picked by hand" shows the listings below in their order.',
        'Նորերը՝ առաջինը։ «Ընտրված ձեռքով»՝ ներքևի հայտարարությունները՝ իրենց հերթականությամբ։',
        'Сначала новые. «Выбранные вручную» показывает объявления ниже в их порядке.',
      ),
    },
  },
  {
    name: 'picks',
    type: 'relationship',
    relationTo: 'properties',
    hasMany: true,
    maxRows: 12,
    filterOptions: { status: { equals: 'published' } },
    label: label('Listings', 'Հայտարարություններ', 'Объявления'),
    admin: { condition: (_, sibling) => sibling?.source === 'manual' },
  },
]

const heroPhoto = (name: string, en: AdminLabel): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  label: en,
})

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: label('Home page', 'Գլխավոր էջ', 'Главная страница'),
  admin: { group: label('Settings', 'Կարգավորումներ', 'Настройки') },
  access: { read: anyone, update: isEditor },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: label('Hero', 'Գլխավոր բլոկ', 'Главный блок'),
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: false,
              fields: [
                text('eyebrow', L.eyebrow, (d) => d.home.hero.eyebrow),
                text('title', L.title, (d) => d.home.hero.title),
                text('intro', L.intro, (d) => d.home.hero.intro, true),
                {
                  type: 'collapsible',
                  label: label('Photos', 'Լուսանկարներ', 'Фотографии'),
                  admin: {
                    description: label(
                      'Optional. Empty photos keep the built-in ones.',
                      'Ոչ պարտադիր։ Դատարկ լինելու դեպքում մնում են ներկառուցված լուսանկարները։',
                      'Необязательно. Пустые оставляют встроенные фото.',
                    ),
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        heroPhoto('photoTall', label('Tall photo (left)', 'Բարձր լուսանկար (ձախ)', 'Высокое фото (слева)')),
                        heroPhoto('photoTop', label('Top right', 'Վերևի աջ', 'Справа сверху')),
                        heroPhoto('photoBottom', label('Bottom right', 'Ներքևի աջ', 'Справа снизу')),
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: label('Listings', 'Հայտարարություններ', 'Объявления'),
          fields: [
            text('popularTitle', label('"Popular searches" title', '«Հանրաճանաչ որոնումներ» վերնագիր', 'Заголовок «Популярные запросы»'), (d) => d.home.popular.title),
            {
              name: 'exclusive',
              type: 'group',
              label: label('Dark carousel', 'Մուգ կարուսել', 'Тёмная карусель'),
              fields: [
                text('eyebrow', L.eyebrow, (d) => d.home.exclusive.eyebrow),
                text('title', L.title, (d) => d.home.exclusive.title),
                text('intro', L.intro, (d) => d.home.exclusive.intro),
                ...rowSource('exclusive'),
              ],
            },
            {
              name: 'row1',
              type: 'group',
              label: label('First row', 'Առաջին շարք', 'Первый ряд'),
              fields: [text('title', L.title, (d) => d.home.rows.newest), ...rowSource('new')],
            },
            {
              name: 'row2',
              type: 'group',
              label: label('Second row', 'Երկրորդ շարք', 'Второй ряд'),
              fields: [text('title', L.title, (d) => d.home.rows.rent), ...rowSource('rent')],
            },
          ],
        },
        {
          label: label('Services', 'Ծառայություններ', 'Услуги'),
          fields: [
            {
              name: 'services',
              type: 'group',
              label: false,
              fields: [
                text('title', L.title, (d) => d.home.services.title),
                ...(['buy', 'sell', 'rent'] as const).map(
                  (key, i): Field => ({
                    name: key,
                    type: 'group',
                    label: label(
                      ['Buy', 'Sell', 'Rent'][i],
                      ['Գնել', 'Վաճառել', 'Վարձակալել'][i],
                      ['Купить', 'Продать', 'Аренда'][i],
                    ),
                    fields: [
                      text('title', L.title, (d) => d.home.services.items[i].title),
                      text('body', L.intro, (d) => d.home.services.items[i].body, true),
                      text('cta', L.button, (d) => d.home.services.items[i].cta),
                    ],
                  }),
                ),
              ],
            },
          ],
        },
        {
          label: label('Reviews', 'Կարծիքներ', 'Отзывы'),
          description: label(
            'The reviews themselves are in Clients → Reviews.',
            'Կարծիքներն իրենք՝ Հաճախորդներ → Կարծիքներ բաժնում։',
            'Сами отзывы — в разделе Клиенты → Отзывы.',
          ),
          fields: [
            {
              name: 'reviews',
              type: 'group',
              label: false,
              fields: [
                text('title', L.title, (d) => d.home.reviews.title),
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'rating',
                      type: 'number',
                      min: 1,
                      max: 5,
                      defaultValue: 4.8,
                      label: label('Average rating on Google', 'Միջին գնահատական Google-ում', 'Средняя оценка в Google'),
                      admin: { step: 0.1, description: label('Empty hides the rating box', 'Դատարկ լինելու դեպքում գնահատականը չի ցուցադրվում', 'Если пусто, оценка не показывается') },
                    },
                    {
                      name: 'count',
                      type: 'number',
                      min: 1,
                      defaultValue: 120,
                      label: label('Number of Google reviews', 'Google-ի կարծիքների քանակ', 'Число отзывов в Google'),
                    },
                  ],
                },
                {
                  name: 'sampleNote',
                  type: 'checkbox',
                  defaultValue: true,
                  label: label('Show "Sample reviews for the demo" under the reviews', 'Ցուցադրել «Կարծիքների օրինակներ» նշումը', 'Показывать пометку «Примеры отзывов»'),
                },
              ],
            },
          ],
        },
        {
          label: label('Call to action', 'Կոչ գործողության', 'Призыв к действию'),
          fields: [
            {
              name: 'cta',
              type: 'group',
              label: false,
              fields: [
                text('title', L.title, (d) => d.home.cta.title),
                text('body', L.intro, (d) => d.home.cta.body, true),
                {
                  type: 'row',
                  fields: [
                    text('primary', label('Main button', 'Հիմնական կոճակ', 'Основная кнопка'), (d) => d.home.cta.primary),
                    text('secondary', label('Phone button', 'Հեռախոսի կոճակ', 'Кнопка телефона'), (d) => d.home.cta.secondary),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
