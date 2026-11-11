"use client"

import { useRef, useState, useTransition, type FormEvent } from "react"
import { CheckCircle2 } from "lucide-react"
import { submitLead, type LeadResult } from "@/app/actions/leads"
import { useT } from "@/i18n/client"
import type { Dict } from "@/i18n/dictionaries"
import { useBotCheck } from "./bot-check"
import { focusFirstError, isEmail, isPhone, TextArea, TextField } from "./fields"

type Values = { name: string; phone: string; email: string; message: string }

/** The message shown under a form when the server refused or failed to save it. */
export function leadErrorText(error: Extract<LeadResult, { ok: false }>["error"], t: Dict) {
  if (error === "botCheck") return t.form.botCheck
  if (error === "tooMany") return t.form.tooMany
  return t.form.sendFailed
}

/** Success panel shared by all forms. */
export function FormSuccess({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  const { t } = useT()
  return (
    <div role="status" className="flex flex-col items-center py-6 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-iris-tint text-iris-ink">
        <CheckCircle2 className="size-7" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-2xl font-extrabold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-muted-ink">{body}</p>
      <p className="mt-4 text-xs text-muted-ink">{t.form.demoNote}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/**
 * Name / phone / email / message form. Checks the fields in the browser, then saves a Lead on the
 * server (submitLead). `propertyCode` links a viewing request to its listing.
 */
export function ContactForm({
  defaultMessage = "",
  withEmail = true,
  onDone,
  kind = "contact",
  propertyCode,
}: {
  defaultMessage?: string
  withEmail?: boolean
  onDone?: () => void
  kind?: "request" | "contact"
  propertyCode?: number
}) {
  const { t, lang } = useT()
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState<Values>({ name: "", phone: "", email: "", message: defaultMessage })
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({})
  const [sent, setSent] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const [sending, startSending] = useTransition()
  const { widget, getToken } = useBotCheck(lang)

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const er: typeof errors = {}
    if (!values.name.trim()) er.name = t.form.required
    if (!values.phone.trim()) er.phone = t.form.required
    else if (!isPhone(values.phone)) er.phone = t.form.invalidPhone
    if (withEmail && values.email.trim() && !isEmail(values.email)) er.email = t.form.invalidEmail
    if (!values.message.trim()) er.message = t.form.required
    setErrors(er)
    if (Object.keys(er).length) return focusFirstError(formRef.current)
    const website = new FormData(e.currentTarget as HTMLFormElement).get("website")
    setFailed(null)
    startSending(async () => {
      const res = await submitLead({
        kind,
        propertyCode,
        locale: lang,
        name: values.name,
        phone: values.phone,
        email: withEmail ? values.email : undefined,
        message: values.message,
        website: typeof website === "string" ? website : undefined,
        botToken: await getToken(),
      })
      if (res.ok) setSent(true)
      else setFailed(leadErrorText(res.error, t))
    })
  }

  if (sent)
    return (
      <FormSuccess
        title={t.form.successTitle}
        body={t.form.successBody}
        action={onDone && <button type="button" onClick={onDone} className="btn-secondary">{t.form.close}</button>}
      />
    )

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label={t.form.name} autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} />
        <TextField label={t.form.phone} type="tel" autoComplete="tel" inputMode="tel" placeholder="+374 ..." value={values.phone} onChange={set("phone")} error={errors.phone} />
      </div>
      {withEmail && (
        <TextField label={t.form.email} hint={t.form.optional} type="email" autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} />
      )}
      <TextArea label={t.form.message} value={values.message} onChange={set("message")} error={errors.message} />
      {/* Honeypot: hidden from people and screen readers; bots that fill it are ignored by the server */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="pointer-events-none absolute top-0 left-0 size-px overflow-hidden opacity-0" />
      {widget}
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          {failed}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-xs text-muted-ink">{t.form.demoNote}</p>
        <button type="submit" disabled={sending} aria-busy={sending} className="btn-primary">{t.form.send}</button>
      </div>
    </form>
  )
}
