import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" ADD COLUMN "ip_hash" varchar;
  CREATE INDEX "leads_ip_hash_idx" ON "leads" USING btree ("ip_hash");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "leads_ip_hash_idx";
  ALTER TABLE "leads" DROP COLUMN "ip_hash";`)
}
