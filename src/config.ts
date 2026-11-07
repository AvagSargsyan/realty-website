import type { Currency } from '@/types'

/**
 * Contact details and rates, as in the demo. All values are placeholders.
 * They move into the Site settings global (editable in the admin) later in Stage 1.
 */
export const config = {
  brand: 'Avenue',
  brandTagline: 'Real Estate Agency',
  phone: '+374 93 77 22 71',
  phoneHref: 'tel:+37493772271',
  whatsappHref: 'https://wa.me/37493772271',
  email: 'info@avenuerealty.am',
  address: { hy: 'Երևան, Հայաստան', en: 'Yerevan, Armenia', ru: 'Ереван, Армения' },
  socials: {
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/avenuerealty.am/',
    telegram: 'https://t.me/',
  },
  /** Fixed exchange rates for now: 1 USD = X */
  rates: { USD: 1, AMD: 387, RUB: 81 } satisfies Record<Currency, number>,
}
