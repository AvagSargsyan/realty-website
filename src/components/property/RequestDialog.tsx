"use client"

import { useState, type ReactNode } from "react"
import { Dialog } from "radix-ui"
import { X } from "lucide-react"
import { useT } from "@/i18n/client"
import { ContactForm } from "@/components/forms/ContactForm"

/** "Send a request" dialog for a property; saved as a Lead linked to the listing. The form is re-created each time it opens. */
export function RequestDialog({ title, code, trigger }: { title: string; code: number; trigger: ReactNode }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[80] max-h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-line bg-background p-6 shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-heading text-2xl font-extrabold text-ink">{t.request.title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-ink">{t.request.about(title)}</Dialog.Description>
            </div>
            <Dialog.Close className="icon-btn -mt-1 -mr-2 shrink-0" aria-label={t.form.close}>
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          {open && (
            <ContactForm
              kind="request"
              propertyCode={code}
              defaultMessage={t.request.defaultMessage}
              withEmail={false}
              onDone={() => setOpen(false)}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
