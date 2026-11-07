/** Form checks from the demo, shared by the browser (instant feedback) and the server (the real check). */
export const isPhone = (v: string) => /^\+?[\d\s()-]{8,}$/.test(v.trim()) && v.replace(/\D/g, "").length >= 8
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
