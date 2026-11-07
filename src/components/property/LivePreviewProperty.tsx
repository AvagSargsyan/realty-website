"use client"

import { useLivePreview } from "@payloadcms/live-preview-react"

import type { Property } from "@/payload-types"
import { toListing } from "@/lib/to-listing"
import { PropertyView } from "./PropertyView"

/**
 * The property page inside the admin's Live Preview panel: re-renders with the form's values as the
 * editor types (Payload sends them with postMessage), before anything is saved.
 */
export function LivePreviewProperty({ initial }: { initial: Property }) {
  const { data } = useLivePreview<Property>({
    initialData: initial,
    serverURL: typeof window === "undefined" ? "" : window.location.origin,
    depth: 1, // populate photos and district, like the public page
  })
  return <PropertyView listing={toListing(data)} similar={[]} similarTotal={0} />
}
