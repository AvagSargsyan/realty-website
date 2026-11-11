import { PropertySkeleton } from '@/components/ui/skeletons'

// Shown at once when a listing page isn't cached yet (its first visit after a change).
export default function Loading() {
  return <PropertySkeleton />
}
