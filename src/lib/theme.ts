/**
 * Theme constants shared by the server layout and the browser code (components/providers/preferences.ts).
 * Kept out of that 'use client' module on purpose: a server component that imports a value from a
 * client module gets a client reference, not the value. That silently dropped the theme-color meta tag.
 */

export const THEME_STORAGE_KEY = 'avenue.theme'

/** Browser UI colour (phone address bar) for each theme */
export const THEME_COLORS = { light: '#ffffff', dark: '#0a161b' }

/** Runs first thing in <body>, before the first paint, so a dark-mode visitor never sees a white flash. */
export const THEME_SCRIPT = `try{var t=JSON.parse(localStorage.getItem("${THEME_STORAGE_KEY}")||'"system"');var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.classList.add("dark");document.querySelector('meta[name="theme-color"]')?.setAttribute("content","${THEME_COLORS.dark}")}}catch(e){}`
