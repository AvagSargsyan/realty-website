"use client"

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

/* Shared, accessible form controls: visible label, error text linked with aria-describedby. */

const control =
  "w-full rounded-md border bg-background px-3.5 text-[0.95rem] text-ink transition-colors placeholder:text-muted-ink/70 hover:border-iris/40 focus-visible:border-iris-ink aria-[invalid=true]:border-destructive"

function Shell({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {hint && <span className="ml-1.5 font-normal text-muted-ink">({hint})</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

type Common = { label: string; hint?: string; error?: string }

export function TextField({ label, hint, error, className, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <Shell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(control, "h-12 border-line", className)}
        {...props}
      />
    </Shell>
  )
}

export function TextArea({ label, hint, error, className, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <Shell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        rows={4}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(control, "min-h-28 resize-y border-line py-3", className)}
        {...props}
      />
    </Shell>
  )
}

export function SelectField({ label, hint, error, className, children, ...props }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <Shell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(control, "h-12 cursor-pointer appearance-none border-line pr-10", className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-ink" aria-hidden="true" />
      </div>
    </Shell>
  )
}

/* ---------- Validation helpers (phone and email are shared with the server, see src/lib/validation.ts) ---------- */
export { isEmail, isPhone } from "@/lib/validation"
export const isNumber = (v: string) => v.trim() !== "" && Number.isFinite(Number(v.replace(/[\s,]/g, ""))) && Number(v.replace(/[\s,]/g, "")) > 0

/** Focus the first invalid control after a failed submit. */
export function focusFirstError(form: HTMLFormElement | null) {
  requestAnimationFrame(() => form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
}
