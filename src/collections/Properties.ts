import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook, CollectionConfig, Where } from 'payload'

import { isAgent, isEditor, isEditorReq, isStaff } from './shared/access'
import { fromDict, label, options } from './shared/labels'
import { slugify } from './shared/slug'
import { revalidateSite } from '../lib/revalidate'

export const DEALS = ['sale', 'rent'] as const
export const TYPES = ['apartment', 'house', 'commercial', 'land'] as const
export const TAGS = ['exclusive', 'new', 'newConstruction', 'penthouse'] as const
export const BUILDINGS = ['stone', 'panel', 'monolith'] as const
export const CONDITIONS = ['renovated', 'average', 'zero'] as const
export const AMENITIES = [
  'heating', 'gas', 'hotWater', 'aircon', 'furniture', 'appliances', 'balcony', 'elevator',
  'parking', 'internet', 'security', 'view', 'garden', 'pool', 'fireplace',
] as const
export const STATUSES = ['draft', 'published', 'sold', 'rented', 'archived'] as const
/** Statuses visitors can see. Sold and rented pages stay online with a badge (hidden from search later). */
export const PUBLIC_STATUSES = ['published', 'sold', 'rented'] as const

const FIRST_CODE = 422000

/** New listings get the next public code (the number visitors see, e.g. "ID 422001"). */
const assignCode: CollectionBeforeValidateHook = async ({ data, operation, req }) => {
  if (operation !== 'create' || !data || data.code) return data
  const last = await req.payload.find({
    collection: 'properties',
    sort: '-code',
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  data.code = Math.max(FIRST_CODE, (last.docs[0]?.code ?? 0) + 1)
  return data
}

/** A listing created by an agent is always assigned to that agent's profile. */
const assignAgent: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create' || !isAgent(req) || !req.user) return data
  const profile = await req.payload.find({
    collection: 'agents',
    where: { user: { equals: req.user.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  data.agent = profile.docs[0]?.id ?? null
  return data
}

/** Agents may only change listings assigned to their own profile. */
const ownListingsForAgents = ({ req }: { req: Parameters<typeof isAgent>[0] }): boolean | Where => {
  if (isEditorReq(req)) return true
  if (isAgent(req) && req.user) return { 'agent.user': { equals: req.user.id } }
  return false
}

const notLand = (data: Partial<{ type: string }>) => data?.type !== 'land'

export const Properties: CollectionConfig = {
  slug: 'properties',
  labels: {
    singular: label('Property', 'Գույք', 'Объект'),
    plural: label('Properties', 'Գույք', 'Объекты'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['code', 'title', 'status', 'deal', 'type', 'priceUsd', 'district', 'updatedAt'],
    listSearchableFields: ['title', 'street'],
    group: label('Listings', 'Գույք', 'Объекты'),
    pagination: { defaultLimit: 25 },
    // The public property page, updated live while editing (src/app/(site)/[locale]/preview/property)
    livePreview: {
      url: ({ data, locale, req }) => {
        if (!data?.id) return null // nothing to show until the listing has been saved once
        // Same host the admin is open on (no fixed serverURL), so it works on every deployment URL
        const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
        if (!host) return null
        const proto = req.headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
        return `${proto}://${host}/${locale?.code ?? 'hy'}/preview/property/${data.id}`
      },
      breakpoints: [
        { name: 'mobile', label: 'Mobile', width: 390, height: 844 },
        { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
      ],
    },
  },
  defaultSort: '-updatedAt',
  access: {
    // Visitors see published, sold and rented listings; staff see everything
    read: ({ req }) => (req.user ? true : { status: { in: [...PUBLIC_STATUSES] } }),
    create: isStaff,
    update: ownListingsForAgents,
    delete: isEditor,
  },
  hooks: {
    beforeValidate: [assignCode],
    beforeChange: [assignAgent],
    afterChange: [() => revalidateSite()],
    afterDelete: [() => revalidateSite()],
  },
  fields: [
    // ---------- Sidebar ----------
    {
      name: 'code',
      type: 'number',
      unique: true,
      index: true,
      label: label('Public ID', 'ID', 'ID'),
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: label('Assigned automatically', 'Նշանակվում է ավտոմատ', 'Присваивается автоматически'),
      },
      // A duplicated listing gets a new code
      hooks: { beforeDuplicate: [() => undefined] },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      label: label('Status', 'Կարգավիճակ', 'Статус'),
      options: [
        { value: 'draft', label: label('Draft', 'Սևագիր', 'Черновик') },
        { value: 'published', label: label('Published', 'Հրապարակված', 'Опубликован') },
        { value: 'sold', label: label('Sold', 'Վաճառված', 'Продан') },
        { value: 'rented', label: label('Rented', 'Վարձակալված', 'Сдан') },
        { value: 'archived', label: label('Archived', 'Արխիվացված', 'В архиве') },
      ],
      admin: { position: 'sidebar' },
      // A duplicate starts as a draft
      hooks: { beforeDuplicate: [() => 'draft'] },
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'agents',
      label: label('Agent', 'Գործակալ', 'Агент'),
      admin: { position: 'sidebar' },
      // Agents can't reassign listings
      access: { update: ({ req }) => isEditorReq(req) },
    },
    {
      name: 'slug',
      type: 'text',
      localized: true,
      index: true,
      label: label('URL slug', 'URL', 'URL'),
      admin: {
        position: 'sidebar',
        description: label('Made from the title if empty', 'Ստեղծվում է վերնագրից', 'Создаётся из заголовка'),
      },
      hooks: {
        beforeValidate: [({ value, data }) => value || (data?.title ? slugify(String(data.title)) : value)],
      },
    },

    // ---------- Main area ----------
    {
      type: 'tabs',
      tabs: [
        {
          label: label('Main', 'Հիմնական', 'Основное'),
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'deal',
                  type: 'select',
                  required: true,
                  index: true,
                  label: fromDict((d) => d.listings.groups.deal),
                  options: options(DEALS, (d) => d.deal),
                },
                {
                  name: 'type',
                  type: 'select',
                  required: true,
                  index: true,
                  label: fromDict((d) => d.listings.groups.type),
                  options: options(TYPES, (d) => d.type),
                },
              ],
            },
            {
              name: 'tags',
              type: 'select',
              hasMany: true,
              label: label('Labels', 'Պիտակներ', 'Метки'),
              options: options(TAGS, (d) => d.tag),
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: label('Title', 'Վերնագիր', 'Заголовок'),
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'district',
                  type: 'relationship',
                  relationTo: 'districts',
                  required: true,
                  index: true,
                  label: fromDict((d) => d.listings.groups.district),
                },
                {
                  name: 'street',
                  type: 'text',
                  localized: true,
                  label: label('Street', 'Փողոց', 'Улица'),
                },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              label: fromDict((d) => d.property.description),
              admin: { rows: 8 },
            },
          ],
        },
        {
          label: fromDict((d) => d.listings.groups.price),
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'priceUsd',
                  type: 'number',
                  required: true,
                  min: 0,
                  index: true,
                  label: label('Price, USD', 'Գին, USD', 'Цена, USD'),
                  admin: {
                    description: label(
                      'For rentals: per month. AMD and RUB are calculated from the rates in Site settings.',
                      'Վարձակալության դեպքում՝ ամսական։ AMD և RUB գները հաշվվում են Կայքի կարգավորումների փոխարժեքներով։',
                      'Для аренды: в месяц. Цены в AMD и RUB считаются по курсам из настроек сайта.',
                    ),
                  },
                },
                {
                  name: 'oldPriceUsd',
                  type: 'number',
                  min: 0,
                  label: label('Old price, USD', 'Նախկին գին, USD', 'Старая цена, USD'),
                  admin: {
                    description: label(
                      'Shows a “Price reduced” badge when higher than the price',
                      'Ցույց է տալիս «Գինն իջել է» նշանը, եթե բարձր է գնից',
                      'Показывает метку «Цена снижена», если выше цены',
                    ),
                  },
                  validate: (v: number | null | undefined, { siblingData }: { siblingData: { priceUsd?: number } }) =>
                    v == null || siblingData.priceUsd == null || v > siblingData.priceUsd || 'Must be higher than the price',
                },
              ],
            },
          ],
        },
        {
          label: label('Details', 'Մանրամասներ', 'Детали'),
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'area', type: 'number', required: true, min: 1, index: true, label: label('Area, m²', 'Մակերես, մ²', 'Площадь, м²') },
                { name: 'rooms', type: 'number', min: 0, index: true, label: fromDict((d) => d.property.facts.rooms), admin: { condition: notLand } },
                { name: 'bedrooms', type: 'number', min: 0, label: fromDict((d) => d.property.facts.bedrooms), admin: { condition: notLand } },
                { name: 'bathrooms', type: 'number', min: 0, label: fromDict((d) => d.property.facts.bathrooms), admin: { condition: notLand } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'floor', type: 'number', min: -2, label: fromDict((d) => d.property.facts.floor), admin: { condition: notLand } },
                { name: 'floors', type: 'number', min: 1, label: fromDict((d) => d.property.facts.floors), admin: { condition: notLand } },
                {
                  name: 'ceiling',
                  type: 'number',
                  min: 2,
                  max: 6,
                  admin: { step: 0.05, condition: notLand },
                  label: label('Ceiling height, m', 'Առաստաղի բարձրություն, մ', 'Высота потолков, м'),
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'building',
                  type: 'select',
                  label: fromDict((d) => d.listings.groups.building),
                  options: options(BUILDINGS, (d) => d.building),
                  admin: { condition: notLand },
                },
                {
                  name: 'condition',
                  type: 'select',
                  label: fromDict((d) => d.listings.groups.condition),
                  options: options(CONDITIONS, (d) => d.condition),
                  admin: { condition: notLand },
                },
              ],
            },
            {
              name: 'amenities',
              type: 'select',
              hasMany: true,
              label: fromDict((d) => d.property.amenities.title),
              options: options(AMENITIES, (d) => d.amenity),
            },
          ],
        },
        {
          label: label('Photos', 'Լուսանկարներ', 'Фото'),
          fields: [
            {
              name: 'photos',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: false,
              admin: {
                description: label(
                  'Drag to reorder. The first photo is the cover.',
                  'Քաշեք՝ հերթականությունը փոխելու համար։ Առաջին լուսանկարը շապիկն է։',
                  'Перетащите, чтобы изменить порядок. Первое фото — обложка.',
                ),
              },
              validate: (value: unknown, { siblingData }: { siblingData: { status?: string } }) =>
                siblingData.status !== 'published' ||
                (Array.isArray(value) && value.length > 0) ||
                'Add at least one photo before publishing',
            },
          ],
        },
        {
          label: 'SEO',
          name: 'seo',
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              maxLength: 70,
              label: label('Page title', 'Էջի վերնագիր', 'Заголовок страницы'),
              admin: { description: label('Uses the listing title if empty', 'Դատարկ լինելու դեպքում՝ գույքի վերնագիրը', 'Если пусто — заголовок объекта') },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              maxLength: 170,
              label: label('Meta description', 'Նկարագրություն', 'Описание'),
            },
          ],
        },
      ],
    },
  ],
}
