"use client"

import { useEffect, useState, type FormEvent } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useNavigate } from "@/components/providers/navigation-progress"
import { Heart, Menu, Phone, Search, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Link, localizedHref, useT } from "@/i18n/client"
import { useCurrency, useFavorites } from "@/components/providers/preferences"
import { useSettings } from "@/components/providers/SettingsProvider"
import { cn } from "@/lib/utils"
import { Logo } from "./Logo"
import { CurrencySwitch, InlineSwitches, LanguageSwitch, ThemeToggle } from "./Switchers"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

/**
 * Pages where the header may sit transparently over a dark photo hero.
 * Empty on purpose: the header is always solid so navigation stays visible and accessible.
 */
const OVERLAY_ROUTES: string[] = []

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])
  return scrolled
}

function HeaderSearch({ className, overlay = false, id = "header-search" }: { className?: string; overlay?: boolean; id?: string }) {
  const { t, lang } = useT()
  const { navigate } = useNavigate()
  const [currency] = useCurrency()
  const [q, setQ] = useState("")
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    // `cur`: the currency on screen, for prices typed without a sign (the server parses the text)
    const query = q.trim() ? `/listings?q=${encodeURIComponent(q.trim())}&cur=${currency}` : "/listings"
    navigate(localizedHref(query, lang))
  }
  return (
    <form role="search" onSubmit={onSubmit} className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">{t.header.search}</label>
      <Sparkles
        className={cn("pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 transition-colors", overlay ? "text-white/80" : "text-brand-bright")}
        aria-hidden="true"
      />
      <input
        id={id}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.header.searchPlaceholder}
        className={cn(
          "h-10 w-full rounded-md border pr-11 pl-10 text-sm transition-colors outline-none",
          overlay
            ? "border-white/25 bg-white/10 text-white backdrop-blur-md placeholder:text-white/70 hover:border-white/45 focus:border-white focus:bg-white/15"
            : "border-line bg-surface text-ink placeholder:text-muted-ink/80 hover:border-iris-ink/40 focus:border-iris-ink focus:bg-background",
        )}
      />
      <button
        type="submit"
        aria-label={t.header.search}
        className={cn(
          "absolute top-1/2 right-1 grid size-8 -translate-y-1/2 place-items-center rounded-[3px] transition-[background-color,color] duration-200",
          overlay ? "bg-white text-night hover:bg-white/85" : "bg-iris text-white hover:bg-iris-soft",
        )}
      >
        <Search className="size-4" aria-hidden="true" />
      </button>
    </form>
  )
}

function FavoritesLink({ className }: { className?: string }) {
  const { favorites } = useFavorites()
  const { t } = useT()
  return (
    <Link href="/favorites" className={cn("icon-btn relative", className)} aria-label={`${t.nav.favorites} (${favorites.length})`}>
      <Heart className="size-5" aria-hidden="true" />
      <AnimatePresence>
        {favorites.length > 0 && (
          <motion.span
            key={favorites.length}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-bright px-1 text-[0.68rem] font-bold text-ink"
            aria-hidden="true"
          >
            {favorites.length}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}

/** The header with the real query string (for the active "Buy" / "Rent" item). Must be inside <Suspense>. */
export function HeaderWithSearch() {
  const search = useSearchParams().toString()
  return <Header search={search} />
}

/**
 * `search` is passed in rather than read with useSearchParams, so the layout can prerender this header
 * statically as the <Suspense> fallback (full markup for search engines) and swap in HeaderWithSearch.
 */
export function Header({ search = "" }: { search?: string }) {
  const { t } = useT()
  const settings = useSettings()
  // Paths are compared without the locale prefix: /hy/listings -> /listings
  const pathname = "/" + usePathname().split("/").slice(2).join("/")
  const scrolled = useScrolled()
  const [open, setOpen] = useState(false)

  /** Active nav item. NavLink ignores the query string, so "Buy" and "Rent" (both /listings) are told apart by ?deal=. */
  const isCurrent = (to: string) => {
    const [path, query] = to.split("?")
    if (path !== pathname) return false
    if (!query) return true
    const want = new URLSearchParams(query)
    const have = new URLSearchParams(search)
    return [...want.entries()].every(([k, v]) => have.get(k) === v)
  }
  const overlay = OVERLAY_ROUTES.includes(pathname) && !scrolled

  const navItems = [
    { to: "/listings?deal=sale", label: t.nav.buy },
    { to: "/listings?deal=rent", label: t.nav.rent },
    { to: "/submit", label: t.nav.sell, wide: true },
    { to: "/contact", label: t.nav.contact },
  ]

  const navCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative px-1 py-2 text-[0.95rem] font-medium whitespace-nowrap transition-colors",
      "after:absolute after:inset-x-1 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand-bright after:transition-transform after:duration-300 hover:after:scale-x-100",
      overlay ? "text-white/90 hover:text-white" : "text-ink/80 hover:text-ink",
      isActive && "after:scale-x-100",
    )

  return (
    <>
      <a href="#main" className="sr-only z-[60] rounded-md bg-iris px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        {t.nav.skipToContent}
      </a>
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color,color] duration-300",
          overlay
            ? "border-white/15 bg-transparent text-white [&_.icon-btn]:text-white [&_.icon-btn:hover]:bg-white/15 [&_.icon-btn:hover]:text-white"
            : "border-line bg-background/92 text-ink backdrop-blur-md",
          scrolled && "shadow-[0_8px_30px_-16px_rgba(22,21,43,0.25)]",
        )}
      >
        <div className={cn("container-page flex items-center gap-4 transition-[height] duration-300 ease-out lg:gap-10", scrolled ? "h-16" : "h-20")}>
          <Logo tone={overlay ? "light" : undefined} />

          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => {
              const current = isCurrent(item.to)
              return (
                <Link key={item.to} href={item.to} aria-current={current ? "page" : undefined} className={cn(navCls({ isActive: current }), item.wide && "hidden 2xl:block")}>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <HeaderSearch overlay={overlay} className="ml-auto hidden w-full max-w-sm md:block" />

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <div className={cn("hidden items-center lg:flex", overlay && "[&_button]:text-white [&_button:hover]:bg-white/15 [&_button[data-state=open]]:bg-white/15")}>
              <LanguageSwitch />
              <CurrencySwitch />
              <ThemeToggle />
            </div>
            <FavoritesLink />
            <a
              href={settings.phoneHref}
              className={cn(
                "btn ml-1 hidden h-10 px-4 xl:inline-flex",
                overlay ? "bg-white text-night hover:bg-white/90" : "bg-iris text-white hover:bg-iris-soft",
              )}
            >
              <Phone className="size-4" aria-hidden="true" />
              {settings.phone}
            </a>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="icon-btn lg:hidden" aria-label={t.nav.menu}>
                <Menu className="size-5" aria-hidden="true" />
              </SheetTrigger>
              <SheetContent
                side="right"
                // data-[side] prefix: the base sheet sets its width with data-[side=right]:w-3/4, which beats plain w-*
                className="gap-0 p-0 text-ink data-[side=right]:w-[88vw] data-[side=right]:max-w-sm"
                // Don't focus the search box on open: on phones that pops up the keyboard over the menu
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <SheetTitle className="sr-only">{t.nav.menu}</SheetTitle>
                <div className="border-b border-line px-5 py-3.5">
                  <Logo className="[&_svg]:h-10" />
                </div>
                {/* min-h-0 lets this column scroll inside the full-height sheet on short screens */}
                <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                  <HeaderSearch id="mobile-search" className="md:hidden" />
                  <nav aria-label="Mobile" className="flex flex-col">
                    {[{ to: "/", label: t.nav.home }, ...navItems, { to: "/favorites", label: t.nav.favorites }].map((item) => (
                      <Link
                        key={item.to}
                        href={item.to}
                        onClick={() => setOpen(false)}
                        aria-current={isCurrent(item.to) ? "page" : undefined}
                        className="group/m flex items-center justify-between border-b border-line py-3 font-heading text-[1.05rem] text-ink transition-colors hover:text-iris-ink aria-[current=page]:text-iris-ink"
                      >
                        <span className="transition-transform duration-200 group-hover/m:translate-x-1">{item.label}</span>
                        <span aria-hidden="true" className="text-sm opacity-0 transition-opacity duration-200 group-hover/m:opacity-100">→</span>
                      </Link>
                    ))}
                  </nav>
                  <InlineSwitches />
                  <a href={settings.phoneHref} className="btn-primary h-11 w-full shrink-0">
                    <Phone className="size-4" aria-hidden="true" />
                    {settings.phone}
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}
