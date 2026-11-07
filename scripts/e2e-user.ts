/**
 * Creates or removes the e2e test admin user (tests/helpers/seedUser.ts) for manual checks.
 *   pnpm payload run scripts/e2e-user.ts          -> create
 *   E2E_USER=remove pnpm payload run scripts/e2e-user.ts -> remove
 */
import { cleanupTestUser, seedTestUser } from '../tests/helpers/seedUser'

if (process.env.E2E_USER === 'remove') await cleanupTestUser()
else await seedTestUser()
console.log(`e2e user ${process.env.E2E_USER === 'remove' ? 'removed' : 'ready'}`)
process.exit(0)
