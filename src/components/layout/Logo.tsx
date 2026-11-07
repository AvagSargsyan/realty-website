"use client"

import { Link } from "@/i18n/client"
import { cn } from "@/lib/utils"

/**
 * Avenue Real Estate Agency logo, redrawn as a vector from the original
 * (avenuerealty.am/storage/general/logo-dark.png, 101×56 px).
 * Geometry follows the original pixel grid, so the viewBox is 0 0 101 56.
 */
export const LOGO_ORANGE = "#EA8435"
export const LOGO_DARK = "#263238"

export function AvenueLogoSvg({
  className,
  tone = "dark",
  title = "Avenue Real Estate Agency",
}: {
  className?: string
  /** "dark" for light backgrounds, "light" for dark backgrounds, "auto" follows the site theme */
  tone?: "dark" | "light" | "auto"
  title?: string
}) {
  // "auto" uses CSS (the `dark` class set before paint) rather than JS state, so the server-rendered
  // logo is already the right colour and never flips after hydration.
  const ink = tone === "auto" ? "currentColor" : tone === "dark" ? LOGO_DARK : "#FFFFFF"
  const svgClass = cn(tone === "auto" && "text-[#263238] dark:text-white", className)
  return (
    <svg viewBox="0 0 101 56" role="img" aria-label={title} className={svgClass} xmlns="http://www.w3.org/2000/svg">
      <title>{title}</title>
      {/* Roof */}
      <g fill={LOGO_ORANGE}>
        <polygon points="33,0 44,12 22,12" />
        <polygon points="37,0 59,0 77,22 56,22" />
      </g>
      {/* AVENUE */}
      <g fill={ink}>
        {/* A */}
        <polygon points="6,28 9.6,28 3.6,45 0,45" />
        <polygon points="7.4,28 11,28 17,45 13.4,45" />
        <rect x="2.6" y="38" width="11.8" height="2.2" />
        {/* V */}
        <polygon points="17,28 20.6,28 25.1,40.8 30.4,28 34,28 27,45 23,45" />
        {/* E */}
        <polygon points="35,28 48,28 48,31 40,31 40,35 47,35 47,37.6 40,37.6 40,42 48,42 48,45 35,45" />
        {/* N */}
        <polygon points="51,28 55.3,28 63,39.8 63,28 66,28 66,45 62,45 54,33.4 54,45 51,45" />
        {/* U */}
        <path d="M70 28h4v11.2c0 1.9 1.2 2.9 3 2.9s3-1 3-2.9V28h4v11.4c0 3.9-2.6 5.6-7 5.6s-7-1.7-7-5.6Z" />
        {/* E */}
        <polygon points="87,28 100,28 100,31 92,31 92,35 99,35 99,37.6 92,37.6 92,42 100,42 100,45 87,45" />
      </g>
      {/* real estate agency */}
      <text
        x="0.2"
        y="53.8"
        textLength="99.6"
        lengthAdjust="spacing"
        fill={ink}
        style={{ fontFamily: "'Inter Variable', Inter, Arial, Helvetica, sans-serif", fontSize: "6.6px", fontWeight: 600 }}
      >
        real estate agency
      </text>
    </svg>
  )
}

/** Header/footer logo link. Static: no hover movement. */
export function Logo({ className, tone }: { className?: string; tone?: "dark" | "light" }) {
  const finalTone = tone ?? "auto"
  return (
    <Link href="/"className={cn("inline-flex shrink-0 items-center", className)} aria-label="Avenue Real Estate Agency: home">
      <AvenueLogoSvg tone={finalTone} className="h-12 w-auto" title="Avenue Real Estate Agency" />
    </Link>
  )
}
