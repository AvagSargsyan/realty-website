"use client"

import { useRef, useState, useTransition, type FormEvent } from "react"
import { MessageCircle } from "lucide-react"
import { submitLead } from "@/app/actions/leads"
import { useT } from "@/i18n/client"
import { useBotCheck } from "@/components/forms/bot-check"
import { FormSuccess, leadErrorText } from "@/components/forms/ContactForm"
import { focusFirstError, isNumber, isPhone, SelectField, TextArea, TextField } from "@/components/forms/fields"
import { TYPES } from "@/lib/filters"
import { REGION_NAMES } from "@/lib/regions"
import { cn } from "@/lib/utils"
import type { Deal, ListingDistrict, PropertyType, Region } from "@/types"

type Values = {
  deal: Deal
  type: PropertyType
  district: string
  address: string
  area: string
  rooms: string
  price: string
  notes: string
  name: string
  phone: string
}
const INITIAL: Values = { deal: "sale", type: "apartment", district: "", address: "", area: "", rooms: "", price: "", notes: "", name: "", phone: "" }

const toNumber = (s: string) => (s.trim() ? Number(s.replace(/[\s,]/g, "")) : undefined)

/** "Submit a property", ported from the demo. Saved as a Lead (kind "submit") with the property details. */
export function SubmitView({ districts }: { districts: ListingDistrict[] }) {
  const { t, lang } = useT()
  const formRef = useRef<HTMLFormElement>(null)
  const [v, setV] = useState<Values>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({})
  const [sent, setSent] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const [sending, startSending] = useTransition()
  const { widget, getToken } = useBotCheck(lang)

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setV((x) => ({ ...x, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const er: typeof errors = {}
    if (!v.district) er.district = t.form.required
    if (!v.address.trim()) er.address = t.form.required
    if (!isNumber(v.area)) er.area = v.area.trim() ? t.form.invalidNumber : t.form.required
    if (v.rooms.trim() && !isNumber(v.rooms)) er.rooms = t.form.invalidNumber
    if (v.price.trim() && !isNumber(v.price)) er.price = t.form.invalidNumber
    if (!v.name.trim()) er.name = t.form.required
    if (!v.phone.trim()) er.phone = t.form.required
    else if (!isPhone(v.phone)) er.phone = t.form.invalidPhone
    setErrors(er)
    if (Object.keys(er).length) return focusFirstError(formRef.current)
    const website = new FormData(e.currentTarget as HTMLFormElement).get("website")
    setFailed(null)
    startSending(async () => {
      const res = await submitLead({
        kind: "submit",
        locale: lang,
        name: v.name,
        phone: v.phone,
        message: v.notes,
        details: {
          deal: v.deal,
          type: v.type,
          district: v.district,
          address: v.address,
          area: toNumber(v.area)!,
          rooms: toNumber(v.rooms),
          priceUsd: toNumber(v.price),
        },
        website: typeof website === "string" ? website : undefined,
        botToken: await getToken(),
      })
      if (!res.ok) return setFailed(leadErrorText(res.error, t))
      setSent(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    })
  }

  const legend = "mb-5 font-heading text-lg font-extrabold text-ink"

  return (
    <div className="container-page pt-8 pb-20 md:pt-12">
      <div className="mx-auto max-w-3xl">
        <div className="border-b border-line pb-8">
          <h1 className="text-3xl leading-tight font-extrabold text-ink md:text-5xl">{t.submit.title}</h1>
          <p className="mt-4 text-lg text-muted-ink">{t.submit.intro}</p>
        </div>

        {sent ? (
          <div className="mt-10 rounded-lg border border-line p-8">
            <FormSuccess
              title={t.submit.successTitle}
              body={t.submit.successBody}
              action={
                <button type="button" className="btn-secondary" onClick={() => { setV(INITIAL); setSent(false) }}>
                  {t.submit.another}
                </button>
              }
            />
          </div>
        ) : (
          <form ref={formRef} onSubmit={onSubmit} noValidate className="relative mt-10 grid gap-10">
            <fieldset className="grid gap-5">
              <legend className={legend}>{t.submit.property}</legend>
              <div>
                <p className="mb-1.5 text-sm font-semibold text-ink" id="deal-label">{t.submit.deal}</p>
                <div role="radiogroup" aria-labelledby="deal-label" className="inline-flex rounded-md bg-surface p-1">
                  {(["sale", "rent"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      aria-checked={v.deal === d}
                      onClick={() => setV((x) => ({ ...x, deal: d }))}
                      className={cn("h-10 rounded-sm px-5 text-sm font-semibold transition-colors", v.deal === d ? "bg-iris text-white shadow-sm" : "text-ink/75 hover:text-ink")}
                    >
                      {d === "sale" ? t.submit.sell : t.submit.rentOut}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField label={t.submit.type} value={v.type} onChange={set("type")}>
                  {TYPES.map((k) => <option key={k} value={k}>{t.type[k]}</option>)}
                </SelectField>
                <SelectField label={t.submit.district} value={v.district} onChange={set("district")} error={errors.district}>
                  <option value="">—</option>
                  {(Object.keys(REGION_NAMES) as Region[])
                    .filter((region) => districts.some((d) => d.region === region))
                    .map((region) => (
                      <optgroup key={region} label={REGION_NAMES[region][lang]}>
                        {districts.filter((d) => d.region === region).map((d) => (
                          <option key={d.key} value={d.key}>{d.name}</option>
                        ))}
                      </optgroup>
                    ))}
                </SelectField>
              </div>
              <TextField label={t.submit.address} autoComplete="street-address" value={v.address} onChange={set("address")} error={errors.address} />
              <div className="grid gap-5 sm:grid-cols-3">
                <TextField label={t.submit.area} inputMode="decimal" value={v.area} onChange={set("area")} error={errors.area} />
                <TextField label={t.submit.rooms} hint={t.form.optional} inputMode="numeric" value={v.rooms} onChange={set("rooms")} error={errors.rooms} />
                <TextField label={t.submit.price} hint={t.form.optional} inputMode="numeric" value={v.price} onChange={set("price")} error={errors.price} />
              </div>
              <TextArea label={t.submit.notes} hint={t.form.optional} value={v.notes} onChange={set("notes")} />
              <p className="flex items-center gap-2 text-sm text-muted-ink">
                <MessageCircle className="size-4 shrink-0 text-iris-ink" aria-hidden="true" />
                {t.submit.photosNote}
              </p>
            </fieldset>

            <fieldset className="grid gap-5 border-t border-line pt-8">
              <legend className={cn(legend, "float-left w-full")}>{t.submit.contactDetails}</legend>
              <div className="clear-both grid gap-5 sm:grid-cols-2">
                <TextField label={t.form.name} autoComplete="name" value={v.name} onChange={set("name")} error={errors.name} />
                <TextField label={t.form.phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="+374 ..." value={v.phone} onChange={set("phone")} error={errors.phone} />
              </div>
            </fieldset>

            {/* Honeypot: hidden from people and screen readers; bots that fill it are ignored by the server */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="pointer-events-none absolute top-0 left-0 size-px overflow-hidden opacity-0" />
            {widget}
            {failed && (
              <p role="alert" className="text-sm text-destructive">
                {failed}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <p className="text-xs text-muted-ink">{t.form.demoNote}</p>
              <button type="submit" disabled={sending} aria-busy={sending} className="btn-accent">{t.submit.send}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
