"use client"

import { Check, ChevronDown, Globe, Monitor, Moon, Sun } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { usePathname } from "next/navigation"
import { useNavigate } from "@/components/providers/navigation-progress"
import { useT } from "@/i18n/client"
import { useCurrency, useHydrated, useTheme } from "@/components/providers/preferences"
import type { Currency, Lang, Theme } from "@/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export const LANGS: { value: Lang; label: string; short: string }[] = [
  { value: "hy", label: "Հայերեն", short: "ՀԱՅ" },
  { value: "en", label: "English", short: "EN" },
  { value: "ru", label: "Русский", short: "РУ" },
]
export const CURRENCIES: { value: Currency; symbol: string }[] = [
  { value: "USD", symbol: "$" },
  { value: "AMD", symbol: "֏" },
  { value: "RUB", symbol: "₽" },
]

/** Switch language by moving to the same page under another locale: /hy/listings?x=1 -> /en/listings?x=1 */
function useSetLang() {
  const { navigate } = useNavigate()
  const pathname = usePathname()
  return (next: Lang) => {
    const rest = pathname.split("/").slice(2).join("/")
    // Remembered for `/`, which the proxy redirects to the visitor's language
    document.cookie = `avenue.lang=${next}; path=/; max-age=31536000; samesite=lax`
    navigate(`/${next}${rest ? `/${rest}` : ""}${window.location.search}`)
  }
}

const triggerCls =
  "inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-ink transition-colors duration-200 hover:bg-surface-2 data-[state=open]:bg-surface-2"

export function LanguageSwitch() {
  const { t, lang } = useT()
  const setLang = useSetLang()
  const current = LANGS.find((l) => l.value === lang)!
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerCls} aria-label={`${t.header.language}: ${current.label}`}>
        <Globe className="size-4" aria-hidden="true" />
        <span>{current.short}</span>
        <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {LANGS.map((l) => (
          <DropdownMenuItem key={l.value} onSelect={() => setLang(l.value)} className="justify-between py-2">
            <span lang={l.value}>{l.label}</span>
            {l.value === lang && <Check className="size-4" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CurrencySwitch() {
  const [currency, setCurrency] = useCurrency()
  const { t } = useT()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerCls} aria-label={`${t.header.currency}: ${currency}`}>
        <span>{CURRENCIES.find((c) => c.value === currency)!.symbol}</span>
        <span className="hidden xl:inline">{currency}</span>
        <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {CURRENCIES.map((c) => (
          <DropdownMenuItem key={c.value} onSelect={() => setCurrency(c.value)} className="justify-between py-2">
            <span>
              <span className="inline-block w-5">{c.symbol}</span>
              {c.value}
            </span>
            {c.value === currency && <Check className="size-4" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Header button: flips between light and dark (an explicit choice overrides "auto"). */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useT()
  const isDark = resolvedTheme === "dark"
  const hydrated = useHydrated()
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t.header.toggleTheme}
      title={t.header.toggleTheme}
      className="grid size-10 place-items-center overflow-hidden rounded-md text-ink transition-colors duration-200 hover:bg-surface-2"
    >
      {/* Until hydration the stored theme is unknown to React, so CSS picks the icon (no flip on load) */}
      {!hydrated ? (
        <span className="grid place-items-center">
          <Sun className="size-[18px] dark:hidden" aria-hidden="true" />
          <Moon className="hidden size-[18px] dark:block" aria-hidden="true" />
        </span>
      ) : (
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={resolvedTheme}
          initial={{ y: 12, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -12, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid place-items-center"
        >
          {isDark ? <Moon className="size-[18px]" aria-hidden="true" /> : <Sun className="size-[18px]" aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
      )}
    </button>
  )
}

const THEMES: { value: Theme; icon: typeof Sun }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
]

/** Inline pill toggles used in the mobile menu. */
export function InlineSwitches() {
  const { t, lang } = useT()
  const setLang = useSetLang()
  const [currency, setCurrency] = useCurrency()
  const { theme, setTheme } = useTheme()
  const pill = (active: boolean) =>
    cn(
      "h-9 min-w-0 flex-1 truncate rounded-md border px-2 text-[0.8rem] font-medium transition-colors",
      active ? "border-iris bg-iris text-white" : "border-line bg-background text-ink hover:border-iris-ink/40 hover:bg-surface",
    )
  return (
    <div className="space-y-3.5">
      <fieldset>
        <legend className="mb-1.5 text-[0.7rem] font-medium tracking-wider text-muted-ink uppercase">{t.header.language}</legend>
        <div className="flex gap-2">
          {LANGS.map((l) => (
            <button key={l.value} type="button" className={pill(l.value === lang)} aria-pressed={l.value === lang} onClick={() => setLang(l.value)} lang={l.value}>
              {l.label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-[0.7rem] font-medium tracking-wider text-muted-ink uppercase">{t.header.currency}</legend>
        <div className="flex gap-2">
          {CURRENCIES.map((c) => (
            <button key={c.value} type="button" className={pill(c.value === currency)} aria-pressed={c.value === currency} onClick={() => setCurrency(c.value)}>
              {c.symbol} {c.value}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-[0.7rem] font-medium tracking-wider text-muted-ink uppercase">{t.header.theme}</legend>
        <div className="flex gap-2">
          {THEMES.map(({ value, icon: Icon }) => (
            // Icon only on phones (the labels didn't fit); the name stays for screen readers and as a tooltip
            <button
              key={value}
              type="button"
              className={cn(pill(value === theme), "inline-flex items-center justify-center")}
              aria-pressed={value === theme}
              aria-label={t.header[value]}
              title={t.header[value]}
              onClick={() => setTheme(value)}
            >
              <Icon className="size-4" aria-hidden="true" />
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
