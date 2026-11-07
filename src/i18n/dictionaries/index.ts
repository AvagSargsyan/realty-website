import type { Lang } from '@/types'
import en, { type Dict } from './en'
import hy from './hy'
import ru from './ru'

/**
 * Interface text, ported unchanged from the demo. Some entries are functions (plurals, "Floor 3/9"),
 * so the dictionaries stay as TypeScript and are imported on both server and client instead of
 * being passed from server to client as JSON.
 */
export const DICTS: Record<Lang, Dict> = { en, hy, ru }
export type { Dict }
