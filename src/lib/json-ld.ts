import { DICTS } from '@/i18n/dictionaries'
import { REGION_NAMES } from '@/lib/regions'
import { listingsHref, propertyHref } from '@/lib/search'
import { absolute, SITE_NAME } from '@/lib/seo'
import type { SiteSettings } from '@/lib/settings'
import type { Lang, Listing } from '@/types'

/**
 * Structured data (schema.org JSON-LD) that tells search engines what a page is about.
 * Check it with https://validator.schema.org or Google's Rich Results Test.
 */

const AGENCY_ID = absolute('/#agency')

/** The agency itself: on every page (layout). */
export function agencyJsonLd(locale: Lang, s: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': AGENCY_ID,
    name: SITE_NAME,
    url: absolute(`/${locale}`),
    logo: absolute('/favicon.svg'),
    image: absolute(`/og/${locale}`),
    description: DICTS[locale].footer.tagline,
    telephone: s.phone,
    email: s.email,
    address: { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: 'Yerevan', addressCountry: 'AM' },
    areaServed: { '@type': 'City', name: 'Yerevan' },
    sameAs: Object.values(s.socials).filter(Boolean),
  }
}

/** schema.org types for what's being sold or rented */
const PLACE_TYPE = { apartment: 'Apartment', house: 'SingleFamilyResidence', commercial: 'Place', land: 'Place' } as const

/** One listing: what it is, where, its photos and the offer (price, sale or rent, still available or not). */
export function listingJsonLd(locale: Lang, l: Listing) {
  const url = absolute(`/${locale}${propertyHref(l)}`)
  const t = DICTS[locale]
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `${url}#listing`,
    url,
    name: l.title,
    description: l.description || undefined,
    image: l.photos.slice(0, 6).map((p) => absolute(p.large)),
    dateModified: l.updatedAt,
    inLanguage: locale,
    about: {
      '@type': PLACE_TYPE[l.type],
      name: l.title,
      floorSize: { '@type': 'QuantitativeValue', value: l.area, unitCode: 'MTK' },
      ...(l.rooms > 0 ? { numberOfRooms: l.rooms } : {}),
      ...(l.bathrooms > 0 ? { numberOfBathroomsTotal: l.bathrooms } : {}),
      address: {
        '@type': 'PostalAddress',
        streetAddress: l.street || undefined,
        addressLocality: l.district.name,
        addressRegion: REGION_NAMES[l.district.region][locale],
        addressCountry: 'AM',
      },
    },
    offers: {
      '@type': 'Offer',
      price: l.priceUsd,
      priceCurrency: 'USD',
      ...(l.deal === 'rent'
        ? { businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut', priceSpecification: { '@type': 'UnitPriceSpecification', price: l.priceUsd, priceCurrency: 'USD', unitCode: 'MON' } }
        : { businessFunction: 'http://purl.org/goodrelations/v1#Sell' }),
      availability: l.status === 'published' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      seller: { '@id': AGENCY_ID },
    },
    // Same trail as the breadcrumb on the page
    breadcrumb: breadcrumbJsonLd([
      { name: t.nav.home, path: `/${locale}` },
      { name: t.deal[l.deal], path: `/${locale}${listingsHref({ deal: l.deal })}` },
      { name: l.district.name, path: `/${locale}${listingsHref({ deal: l.deal, district: l.district.key })}` },
      { name: t.property.id(l.id), path: `/${locale}${propertyHref(l)}` },
    ]),
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: absolute(item.path) })),
  }
}

/** The FAQ page's questions and answers. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  }
}
