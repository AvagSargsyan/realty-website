import { config } from 'dotenv'

// Same files as Next.js: .env.local (your machine) first, then .env. Already-set variables win (e.g. CI).
config({ path: ['.env.local', '.env'] })
