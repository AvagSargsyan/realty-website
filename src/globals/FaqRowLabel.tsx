'use client'

import { useRowLabel } from '@payloadcms/ui'

/** Shows each FAQ row by its question in the admin, instead of "Question 01". */
export function FaqRowLabel() {
  const { data, rowNumber } = useRowLabel<{ question?: string }>()
  return <span>{data?.question?.trim() || `#${(rowNumber ?? 0) + 1}`}</span>
}
