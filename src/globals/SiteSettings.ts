import type { GlobalConfig } from 'payload'

import { anyone, isAdmin } from '../collections/shared/access'
import { fromDict, label } from '../collections/shared/labels'
import { DICTS } from '../i18n/dictionaries'
import { revalidateSite } from '../lib/revalidate'
import type { Lang } from '../types'

/**
 * Contact details, social links and exchange rates shown across the site (header, footer, prices).
 * Defaults are the demo's placeholder values, so an empty database still renders the site.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: label('Site settings', 'Կայքի կարգավորումներ', 'Настройки сайта'),
  admin: { group: label('Settings', 'Կարգավորումներ', 'Настройки') },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: label('Contacts', 'Կոնտակտներ', 'Контакты'),
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'phone',
                  type: 'text',
                  required: true,
                  defaultValue: '+374 93 77 22 71',
                  label: fromDict((d) => d.contact.phone),
                  admin: { description: label('As shown on the site', 'Ինչպես ցուցադրվում է կայքում', 'Как показывается на сайте') },
                },
                {
                  name: 'whatsapp',
                  type: 'text',
                  required: true,
                  defaultValue: '37493772271',
                  label: fromDict((d) => d.contact.whatsapp),
                  admin: { description: label('Digits only, with country code', 'Միայն թվեր՝ երկրի կոդով', 'Только цифры, с кодом страны') },
                  validate: (v: string | null | undefined) =>
                    !v || /^\d{8,15}$/.test(v) || 'Digits only, e.g. 37493772271',
                },
              ],
            },
            {
              name: 'email',
              type: 'email',
              required: true,
              defaultValue: 'info@avenuerealty.am',
              label: fromDict((d) => d.contact.email),
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'address',
                  type: 'text',
                  localized: true,
                  required: true,
                  defaultValue: ({ locale }) =>
                    ({ hy: 'Երևան, Հայաստան', en: 'Yerevan, Armenia', ru: 'Ереван, Армения' })[locale ?? 'hy'],
                  label: fromDict((d) => d.contact.office),
                },
                {
                  name: 'hours',
                  type: 'text',
                  localized: true,
                  defaultValue: ({ locale }) => DICTS[(locale ?? 'hy') as Lang].contact.hoursValue,
                  label: fromDict((d) => d.contact.hours),
                },
              ],
            },
          ],
        },
        {
          label: label('Social links', 'Սոցիալական ցանցեր', 'Соцсети'),
          fields: [
            {
              name: 'socials',
              type: 'group',
              label: false,
              fields: [
                { name: 'facebook', type: 'text', defaultValue: 'https://www.facebook.com/' },
                { name: 'instagram', type: 'text', defaultValue: 'https://www.instagram.com/avenuerealty.am/' },
                { name: 'telegram', type: 'text', defaultValue: 'https://t.me/' },
              ],
            },
          ],
        },
        {
          label: label('Exchange rates', 'Փոխարժեքներ', 'Курсы валют'),
          description: label(
            'Prices are stored in USD and converted with these rates.',
            'Գները պահվում են ԱՄՆ դոլարով և փոխարկվում այս փոխարժեքներով։',
            'Цены хранятся в долларах США и пересчитываются по этим курсам.',
          ),
          fields: [
            {
              name: 'rates',
              type: 'group',
              label: false,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'amd', type: 'number', required: true, min: 1, defaultValue: 387, label: '1 USD = AMD' },
                    { name: 'rub', type: 'number', required: true, min: 0.01, defaultValue: 81, label: '1 USD = RUB' },
                  ],
                },
                {
                  name: 'updatedOn',
                  type: 'date',
                  label: label('Rates updated on', 'Փոխարժեքները թարմացվել են', 'Курсы обновлены'),
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
