import type { CollectionConfig, Where } from 'payload'

import { isAdmin, isAgent, isEditor, isEditorReq } from './shared/access'
import { fromDict, label } from './shared/labels'

/**
 * Everything visitors send through the site's forms. The forms (Stage 2) save leads on the server
 * with the Local API, so the public REST API can't create them directly.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: {
    singular: label('Lead', 'Հայտ', 'Заявка'),
    plural: label('Leads', 'Հայտեր', 'Заявки'),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['createdAt', 'kind', 'name', 'phone', 'property', 'status'],
    listSearchableFields: ['name', 'phone', 'email'],
    group: label('Clients', 'Հաճախորդներ', 'Клиенты'),
  },
  defaultSort: '-createdAt',
  access: {
    // Agents see leads about their own listings
    read: ({ req }): boolean | Where => {
      if (isEditorReq(req)) return true
      if (isAgent(req) && req.user) return { 'property.agent.user': { equals: req.user.id } }
      return false
    },
    create: isEditor,
    update: isEditor,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          label: label('Type', 'Տեսակ', 'Тип'),
          options: [
            { value: 'request', label: fromDict((d) => d.request.title) },
            { value: 'contact', label: fromDict((d) => d.contact.formTitle) },
            { value: 'submit', label: fromDict((d) => d.submit.title) },
            { value: 'newsletter', label: label('Newsletter', 'Տեղեկագիր', 'Рассылка') },
          ],
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          index: true,
          label: label('Status', 'Կարգավիճակ', 'Статус'),
          options: [
            { value: 'new', label: label('New', 'Նոր', 'Новая') },
            { value: 'inProgress', label: label('In progress', 'Ընթացքում', 'В работе') },
            { value: 'done', label: label('Done', 'Ավարտված', 'Закрыта') },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: fromDict((d) => d.form.name) },
        { name: 'phone', type: 'text', label: fromDict((d) => d.form.phone) },
        { name: 'email', type: 'email', label: fromDict((d) => d.form.email) },
      ],
    },
    { name: 'message', type: 'textarea', label: fromDict((d) => d.form.message) },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      label: label('Property', 'Գույք', 'Объект'),
    },
    {
      name: 'details',
      type: 'json',
      label: label('Submitted property details', 'Ներկայացված գույքի տվյալներ', 'Данные объекта из формы'),
      admin: { condition: (data) => data?.kind === 'submit' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'locale',
          type: 'select',
          label: label('Site language', 'Կայքի լեզու', 'Язык сайта'),
          options: [
            { value: 'hy', label: 'Հայերեն' },
            { value: 'en', label: 'English' },
            { value: 'ru', label: 'Русский' },
          ],
          admin: { readOnly: true },
        },
        { name: 'pageUrl', type: 'text', label: label('Sent from page', 'Ուղարկված էջից', 'Отправлено со страницы'), admin: { readOnly: true } },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      label: label('Internal notes', 'Ներքին նշումներ', 'Внутренние заметки'),
      admin: { description: label('Not visible to the client', 'Հաճախորդին տեսանելի չէ', 'Клиент не видит') },
    },
    {
      // Salted hash of the sender's IP address, only for the per-visitor submission limit (src/lib/spam.ts)
      name: 'ipHash',
      type: 'text',
      index: true,
      admin: { hidden: true },
    },
  ],
}
