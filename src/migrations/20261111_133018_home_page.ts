import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_page_exclusive_source" AS ENUM('exclusive', 'new', 'rent', 'sale', 'penthouse', 'newConstruction', 'manual');
  CREATE TYPE "public"."enum_home_page_row1_source" AS ENUM('exclusive', 'new', 'rent', 'sale', 'penthouse', 'newConstruction', 'manual');
  CREATE TYPE "public"."enum_home_page_row2_source" AS ENUM('exclusive', 'new', 'rent', 'sale', 'penthouse', 'newConstruction', 'manual');
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_photo_tall_id" integer,
  	"hero_photo_top_id" integer,
  	"hero_photo_bottom_id" integer,
  	"exclusive_source" "enum_home_page_exclusive_source" DEFAULT 'exclusive' NOT NULL,
  	"row1_source" "enum_home_page_row1_source" DEFAULT 'new' NOT NULL,
  	"row2_source" "enum_home_page_row2_source" DEFAULT 'rent' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_locales" (
  	"hero_eyebrow" varchar,
  	"hero_title" varchar,
  	"hero_intro" varchar,
  	"popular_title" varchar,
  	"exclusive_eyebrow" varchar,
  	"exclusive_title" varchar,
  	"exclusive_intro" varchar,
  	"row1_title" varchar,
  	"row2_title" varchar,
  	"services_title" varchar,
  	"services_buy_title" varchar,
  	"services_buy_body" varchar,
  	"services_buy_cta" varchar,
  	"services_sell_title" varchar,
  	"services_sell_body" varchar,
  	"services_sell_cta" varchar,
  	"services_rent_title" varchar,
  	"services_rent_body" varchar,
  	"services_rent_cta" varchar,
  	"cta_title" varchar,
  	"cta_body" varchar,
  	"cta_primary" varchar,
  	"cta_secondary" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "home_page_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"properties_id" integer
  );
  
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_photo_tall_id_media_id_fk" FOREIGN KEY ("hero_photo_tall_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_photo_top_id_media_id_fk" FOREIGN KEY ("hero_photo_top_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_photo_bottom_id_media_id_fk" FOREIGN KEY ("hero_photo_bottom_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_locales" ADD CONSTRAINT "home_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_page_hero_hero_photo_tall_idx" ON "home_page" USING btree ("hero_photo_tall_id");
  CREATE INDEX "home_page_hero_hero_photo_top_idx" ON "home_page" USING btree ("hero_photo_top_id");
  CREATE INDEX "home_page_hero_hero_photo_bottom_idx" ON "home_page" USING btree ("hero_photo_bottom_id");
  CREATE UNIQUE INDEX "home_page_locales_locale_parent_id_unique" ON "home_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_locales_parent_id_idx" ON "home_page_locales" USING btree ("_parent_id");
  CREATE INDEX "home_page_rels_order_idx" ON "home_page_rels" USING btree ("order");
  CREATE INDEX "home_page_rels_parent_idx" ON "home_page_rels" USING btree ("parent_id");
  CREATE INDEX "home_page_rels_path_idx" ON "home_page_rels" USING btree ("path");
  CREATE INDEX "home_page_rels_properties_id_idx" ON "home_page_rels" USING btree ("properties_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_page" CASCADE;
  DROP TABLE "home_page_locales" CASCADE;
  DROP TABLE "home_page_rels" CASCADE;
  DROP TYPE "public"."enum_home_page_exclusive_source";
  DROP TYPE "public"."enum_home_page_row1_source";
  DROP TYPE "public"."enum_home_page_row2_source";`)
}
