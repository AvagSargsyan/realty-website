'use client'

import { AvenueLogoSvg } from '@/components/layout/Logo'

/**
 * Admin branding (payload.config.ts → admin.components.graphics).
 * Logo: the login and "create account" screens. Its letters use currentColor, set in custom.scss
 * to the admin's text colour, so it follows the admin's light/dark theme.
 */
export function AdminLogo() {
  return (
    <div className="avenue-admin-logo">
      <AvenueLogoSvg tone="auto" title="Avenue Real Estate Agency" />
    </div>
  )
}

/** Icon: the small mark in the admin's top-left corner (same design as the site favicon). */
export function AdminIcon() {
  return (
    <svg className="avenue-admin-icon" viewBox="0 0 32 32" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#263238" />
      <g fill="#EA8435" transform="translate(3.2 9.5) scale(0.33)">
        <polygon points="33,0 44,12 22,12" />
        <polygon points="37,0 59,0 77,22 56,22" />
      </g>
    </svg>
  )
}
