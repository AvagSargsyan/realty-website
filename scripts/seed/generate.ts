/**
 * Sample listings, ported from the demo's scripts/generate-listings.mjs.
 * Deterministic: the same seed and mix always give the same listings, so
 * generateListings(DEMO) reproduces the demo's 30 listings exactly (same IDs, prices, photos).
 */
import { LOCATIONS, PHOTO_POOLS, type PhotoPool } from './data'

type Deal = 'sale' | 'rent'
type Type = 'apartment' | 'house' | 'commercial' | 'land'
type L = { hy: string; en: string; ru: string }

export type SampleListing = {
  code: number
  deal: Deal
  type: Type
  tags: string[]
  title: L
  district: string
  street: L
  priceUsd: number
  oldPriceUsd?: number
  area: number
  rooms: number
  bedrooms: number
  bathrooms: number
  floor: number
  floors: number
  ceiling: number
  building: 'stone' | 'panel' | 'monolith'
  condition: 'renovated' | 'average' | 'zero'
  amenities: string[]
  description: L
  /** Unsplash photo IDs with the pool they came from (used for alt text) */
  photos: { id: string; pool: PhotoPool }[]
}

export type GeneratorOptions = { seed: number; startId: number; mix: [Deal, Type, number][] }

/** The demo's exact settings. */
export const DEMO: GeneratorOptions = {
  seed: 20261106,
  startId: 420118,
  mix: [
    ['sale', 'apartment', 14],
    ['sale', 'house', 5],
    ['sale', 'commercial', 2],
    ['sale', 'land', 1],
    ['rent', 'apartment', 6],
    ['rent', 'commercial', 2],
  ],
}

const DISTRICT_NAMES: Record<string, [string, string, string]> = {
  kentron: ['Կենտրոն', 'Kentron', 'Кентрон'], arabkir: ['Արաբկիր', 'Arabkir', 'Арабкир'], ajapnyak: ['Աջափնյակ', 'Ajapnyak', 'Ачапняк'],
  avan: ['Ավան', 'Avan', 'Аван'], davtashen: ['Դավթաշեն', 'Davtashen', 'Давташен'], erebuni: ['Էրեբունի', 'Erebuni', 'Эребуни'],
  kanakerZeytun: ['Քանաքեռ-Զեյթուն', 'Kanaker-Zeytun', 'Канакер-Зейтун'], malatiaSebastia: ['Մալաթիա-Սեբաստիա', 'Malatia-Sebastia', 'Малатия-Себастия'],
  norNork: ['Նոր Նորք', 'Nor Nork', 'Нор Норк'], shengavit: ['Շենգավիթ', 'Shengavit', 'Шенгавит'],
  abovyanCity: ['Աբովյան', 'Abovyan', 'Абовян'], tsaghkadzor: ['Ծաղկաձոր', 'Tsaghkadzor', 'Цахкадзор'],
}

const APT_AMENITIES = ['heating', 'gas', 'hotWater', 'aircon', 'furniture', 'appliances', 'balcony', 'elevator', 'parking', 'internet', 'security', 'view']
const HOUSE_AMENITIES = ['heating', 'gas', 'hotWater', 'aircon', 'furniture', 'appliances', 'parking', 'garden', 'pool', 'fireplace', 'security', 'view', 'internet']
const COMMERCIAL_AMENITIES = ['heating', 'aircon', 'parking', 'internet', 'security', 'elevator']

function titles(type: Type, rooms: number, street: string[], district: string): L {
  const [sHy, sEn, sRu] = street
  const [dHy, dEn, dRu] = DISTRICT_NAMES[district]
  switch (type) {
    case 'apartment':
      return { hy: `${rooms} սենյականոց բնակարան, ${sHy}`, en: `${rooms}-room apartment on ${sEn}`, ru: `${rooms}-комнатная квартира, ${sRu}` }
    case 'house':
      return { hy: `Առանձնատուն ${dHy}ում`, en: `Family house in ${dEn}`, ru: `Частный дом, ${dRu}` }
    case 'commercial':
      return { hy: `Կոմերցիոն տարածք, ${sHy}`, en: `Commercial space on ${sEn}`, ru: `Коммерческое помещение, ${sRu}` }
    default:
      return { hy: `Հողատարածք ${dHy}ում`, en: `Land plot in ${dEn}`, ru: `Земельный участок, ${dRu}` }
  }
}

function description(type: Type, deal: Deal, l: { area: number; condition: string }): L {
  const cond = ({
    renovated: ['նոր վերանորոգված', 'newly renovated', 'с новым ремонтом'],
    average: ['լավ վիճակում', 'well-kept', 'в хорошем состоянии'],
    zero: ['զրոյական վիճակում', 'shell-condition', 'в черновой отделке'],
  } as Record<string, string[]>)[l.condition]
  const deal3 = deal === 'sale' ? ['Վաճառվում է', 'For sale:', 'Продаётся'] : ['Վարձով է տրվում', 'For rent:', 'Сдаётся']
  if (type === 'land')
    return {
      hy: `${deal3[0]} ${l.area} ք.մ. հողատարածք գեղեցիկ տեսարանով։ Հարմար է առանձնատան կամ հանգստյան տան կառուցման համար։ Կոմունիկացիաները մոտակայքում են։`,
      en: `${deal3[1]} a ${l.area} m² plot with beautiful views. Ideal for building a family home or a holiday house. Utilities are nearby.`,
      ru: `${deal3[2]} участок ${l.area} м² с красивым видом. Подходит для строительства дома или дачи. Коммуникации рядом.`,
    }
  return {
    hy: `${deal3[0]} ${cond[0]} ${l.area} ք.մ. գույք՝ լուսավոր սենյակներով և հարմար դասավորությամբ։ Մոտակայքում են դպրոցներ, խանութներ և հանրային տրանսպորտ։ Դիտումը՝ նախնական պայմանավորվածությամբ։`,
    en: `${deal3[1]} a ${cond[1]} ${l.area} m² property with bright rooms and a practical layout. Schools, shops and public transport are within walking distance. Viewings by appointment.`,
    ru: `${deal3[2]} ${cond[2]} объект площадью ${l.area} м² со светлыми комнатами и удобной планировкой. Рядом школы, магазины и общественный транспорт. Просмотр по предварительной договорённости.`,
  }
}

export function generateListings({ seed: initialSeed, startId, mix }: GeneratorOptions): SampleListing[] {
  // ---------- seeded random (same algorithm and call order as the demo) ----------
  let seed = initialSeed
  const rand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296
  const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]
  const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
  const round = (n: number, step: number) => Math.round(n / step) * step
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const jitter = (n: number, amount: number) => +(n + (rand() - 0.5) * amount).toFixed(5)

  const coverIndex: Partial<Record<PhotoPool, number>> = {}
  const nextCover = (pool: PhotoPool) => {
    coverIndex[pool] = ((coverIndex[pool] ?? -1) + 1) % PHOTO_POOLS[pool].length
    return PHOTO_POOLS[pool][coverIndex[pool]!]
  }

  const tagged = (pool: PhotoPool, ids: string[]) => ids.map((id) => ({ id, pool }))
  function photosFor(type: Type) {
    const u = (pool: PhotoPool, n: number, exclude: string[] = []) =>
      tagged(pool, shuffle(PHOTO_POOLS[pool].filter((x) => !exclude.includes(x))).slice(0, n))
    switch (type) {
      case 'apartment': {
        const c = nextCover('living')
        return [...tagged('living', [c]), ...u('building', 1), ...u('kitchen', 2), ...u('bedroom', 2), ...u('living', 2, [c]), ...u('bathroom', 1)]
      }
      case 'house': {
        const c = nextCover('house')
        return [...tagged('house', [c]), ...u('house', 1, [c]), ...u('living', 2), ...u('kitchen', 2), ...u('bedroom', 2), ...u('bathroom', 1)]
      }
      case 'commercial': {
        const c = nextCover('office')
        return [...tagged('office', [c]), ...u('office', 6, [c])]
      }
      default:
        return [...tagged('land', [nextCover('land')]), ...u('land', 3)].filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i)
    }
  }

  const listings: SampleListing[] = []
  let id = startId

  for (const [deal, type, count] of mix) {
    for (let i = 0; i < count; i++) {
      let loc: (typeof LOCATIONS)[number]
      if (type === 'land') loc = LOCATIONS.find((l) => l[0] === 'tsaghkadzor')!
      else if (type === 'house') loc = pick(LOCATIONS.filter((l) => ['avan', 'davtashen', 'norNork', 'ajapnyak', 'abovyanCity', 'tsaghkadzor', 'arabkir'].includes(l[0])))
      else if (type === 'commercial') loc = pick(LOCATIONS.filter((l) => ['kentron', 'arabkir', 'shengavit', 'norNork'].includes(l[0])))
      else loc = rand() < 0.4 ? LOCATIONS[0] : pick(LOCATIONS.filter((l) => l[1] === 'yerevan'))
      const [district, , streets, mult] = loc
      const street = pick(streets)

      const rooms = type === 'apartment' ? pick([1, 2, 2, 3, 3, 3, 4, 4, 5]) : type === 'house' ? int(4, 7) : 0
      const area =
        type === 'apartment' ? round(rooms * int(22, 34) + int(8, 25), 1)
        : type === 'house' ? int(180, 520)
        : type === 'commercial' ? int(60, 420)
        : int(600, 2400)
      const floors = type === 'apartment' ? pick([5, 9, 12, 14, 16, 4, 3]) : type === 'house' ? int(2, 3) : type === 'commercial' ? pick([1, 2, 5, 9]) : 0
      const floor = type === 'apartment' ? int(1, floors) : type === 'commercial' ? 1 : 0
      const condition = type === 'land' ? 'zero' : pick(['renovated', 'renovated', 'renovated', 'average', 'zero'] as const)
      const building = type === 'apartment' || type === 'commercial' ? pick(['monolith', 'monolith', 'stone', 'stone', 'panel'] as const) : 'stone'

      let price: number
      if (deal === 'sale') {
        const perSqm = { apartment: 1700, house: 1300, commercial: 2000, land: 90 }[type]
        price = round(area * perSqm * mult * (condition === 'renovated' ? 1.1 : condition === 'zero' ? 0.85 : 1) * (0.9 + rand() * 0.3), 1000)
      } else {
        const perSqm = ({ apartment: 11, commercial: 16 } as Record<string, number>)[type]
        price = round(area * perSqm * mult * (0.9 + rand() * 0.3), 50)
      }
      const dropped = rand() < 0.25
      const oldPriceUsd = dropped ? round(price * (1.05 + rand() * 0.08), deal === 'sale' ? 1000 : 50) : undefined

      const tags: string[] = []
      if (rand() < 0.3) tags.push('exclusive')
      if (rand() < 0.25) tags.push('new')
      if (type === 'apartment' && building === 'monolith' && rand() < 0.6) tags.push('newConstruction')
      if (type === 'apartment' && rooms >= 4 && floor === floors && floors >= 9) tags.push('penthouse')

      const pool = type === 'house' ? HOUSE_AMENITIES : type === 'commercial' ? COMMERCIAL_AMENITIES : type === 'apartment' ? APT_AMENITIES : []
      const amenities = shuffle(pool).slice(0, Math.max(0, int(Math.ceil(pool.length * 0.45), pool.length - 1)))

      // Same order of random calls as the demo's object literal: id, bathrooms, ceiling, photos, lat, lng, date
      const code = id + int(3, 140)
      const bedrooms = type === 'apartment' ? Math.max(1, rooms - 1) : type === 'house' ? rooms - 1 : 0
      const bathrooms = type === 'apartment' ? (rooms >= 3 ? 2 : 1) : type === 'house' ? int(2, 4) : type === 'commercial' ? 1 : 0
      const ceiling = type === 'land' ? 0 : pick([2.7, 2.8, 3.0, 3.0, 3.2])
      const photos = photosFor(type)
      // The demo also drew map coordinates and a date; the calls are kept so the sequence matches
      jitter(street[3] as number, 0.008)
      jitter(street[4] as number, 0.01)
      int(0, 40)

      const base = { area, condition }
      listings.push({
        code, deal, type, tags,
        title: titles(type, rooms, street as string[], district),
        district,
        street: { hy: street[0] as string, en: street[1] as string, ru: street[2] as string },
        priceUsd: price,
        ...(oldPriceUsd ? { oldPriceUsd } : {}),
        area,
        rooms,
        bedrooms,
        bathrooms,
        floor, floors,
        ceiling,
        building, condition, amenities,
        description: description(type, deal, base),
        photos,
      })
      id = code
    }
  }

  // Ensure enough "exclusive" listings for the home carousel
  listings
    .filter((l) => l.deal === 'sale')
    .slice(0, 8)
    .forEach((l, i) => {
      if (i % 2 === 0 && !l.tags.includes('exclusive')) l.tags.unshift('exclusive')
    })

  return shuffle(listings)
}
