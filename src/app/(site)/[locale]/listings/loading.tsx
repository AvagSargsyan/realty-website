import { ListingsSkeleton } from '@/components/ui/skeletons'

// Shown at once when someone opens the listings page, while the server renders the results.
// Filter changes on the page itself keep the current results (dimmed) instead.
export default function Loading() {
  return <ListingsSkeleton />
}
