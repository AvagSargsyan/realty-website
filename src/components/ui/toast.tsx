"use client"

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { CheckCircle2 } from "lucide-react"

type ToastApi = { show: (message: string) => void }
const ToastContext = createContext<ToastApi | null>(null)

/** Minimal toast: one short message at a time, announced to screen readers. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const [key, setKey] = useState(0)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((m: string) => {
    window.clearTimeout(timer.current)
    setMessage(m)
    setKey((k) => k + 1)
    timer.current = window.setTimeout(() => setMessage(null), 2600)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 lg:bottom-8">
        <AnimatePresence>
          {message && (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2.5 rounded-md bg-night px-4 py-3 text-sm font-medium text-white shadow-lg"
            >
              <CheckCircle2 className="size-4 text-brand-bright" aria-hidden="true" />
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>")
  return ctx
}
