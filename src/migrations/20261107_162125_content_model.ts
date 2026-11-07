import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_properties_tags" AS ENUM('exclusive', 'new', 'newConstruction', 'penthouse');
  CREATE TYPE "public"."enum_properties_amenities" AS ENUM('heating', 'gas', 'hotWater', 'aircon', 'furniture', 'appliances', 'balcony', 'elevator', 'parking', 'internet', 'security', 'view', 'garden', 'pool', 'fireplace');
  CREATE TYPE "public"."enum_properties_status" AS ENUM('draft', 'published', 'sold', 'rented', 'archived');
  CREATE TYPE "public"."enum_properties_deal" AS ENUM('sale', 'rent');
  CREATE TYPE "public"."enum_properties_type" AS ENUM('apartment', 'house', 'commercial', 'land');
  CREATE TYPE "public"."enum_properties_building" AS ENUM('stone', 'panel', 'monolith');
  CREATE TYPE "public"."enum_properties_condition" AS ENUM('renovated', 'average', 'zero');
  CREATE TYPE "public"."enum_districts_region" AS ENUM('yerevan', 'kotayk');
  CREATE TYPE "public"."enum_agents_languages" AS ENUM('hy', 'en', 'ru');
  CREATE TYPE "public"."enum_leads_kind" AS ENUM('request', 'contact', 'submit', 'newsletter');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'inProgress', 'done');
  CREATE TYPE "public"."enum_leads_locale" AS ENUM('hy', 'en', 'ru');
  CREATE TABLE "properties_tags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_properties_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "properties_amenities" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_properties_amenities",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "properties" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" numeric,
  	"status" "enum_properties_status" DEFAULT 'draft' NOT NULL,
  	"agent_id" integer,
  	"deal" "enum_properties_deal" NOT NULL,
  	"type" "enum_properties_type" NOT NULL,
  	"district_id" integer NOT NULL,
  	"price_usd" numeric NOT NULL,
  	"old_price_usd" numeric,
  	"area" numeric NOT NULL,
  	"rooms" numeric,
  	"bedrooms" numeric,
  	"bathrooms" numeric,
  	"floor" numeric,
  	"floors" numeric,
  	"ceiling" numeric,
  	"building" "enum_properties_building",
  	"condition" "enum_properties_condition",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "properties_locales" (
  	"slug" varchar,
  	"title" varchar NOT NULL,
  	"street" varchar,
  	"description" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "properties_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "districts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"region" "enum_districts_region" DEFAULT 'yerevan' NOT NULL,
  	"key" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "districts_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "agents_languages" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_agents_languages",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "agents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"phone" varchar NOT NULL,
  	"whatsapp" varchar,
  	"email" varchar,
  	"user_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "agents_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_leads_kind" NOT NULL,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"name" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"message" varchar,
  	"property_id" integer,
  	"details" jsonb,
  	"locale" "enum_leads_locale",
  	"page_url" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar DEFAULT '+374 93 77 22 71' NOT NULL,
  	"whatsapp" varchar DEFAULT '37493772271' NOT NULL,
  	"email" varchar DEFAULT 'info@avenuerealty.am' NOT NULL,
  	"socials_facebook" varchar DEFAULT 'https://www.facebook.com/',
  	"socials_instagram" varchar DEFAULT 'https://www.instagram.com/avenuerealty.am/',
  	"socials_telegram" varchar DEFAULT 'https://t.me/',
  	"rates_amd" numeric DEFAULT 387 NOT NULL,
  	"rates_rub" numeric DEFAULT 81 NOT NULL,
  	"rates_updated_on" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"address" varchar NOT NULL,
  	"hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "properties_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "districts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "agents_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "leads_id" integer;
  ALTER TABLE "properties_tags" ADD CONSTRAINT "properties_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_amenities" ADD CONSTRAINT "properties_amenities_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_locales" ADD CONSTRAINT "properties_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "districts_locales" ADD CONSTRAINT "districts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "agents_languages" ADD CONSTRAINT "agents_languages_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "agents" ADD CONSTRAINT "agents_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "agents" ADD CONSTRAINT "agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "agents_locales" ADD CONSTRAINT "agents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "properties_tags_order_idx" ON "properties_tags" USING btree ("order");
  CREATE INDEX "properties_tags_parent_idx" ON "properties_tags" USING btree ("parent_id");
  CREATE INDEX "properties_amenities_order_idx" ON "properties_amenities" USING btree ("order");
  CREATE INDEX "properties_amenities_parent_idx" ON "properties_amenities" USING btree ("parent_id");
  CREATE UNIQUE INDEX "properties_code_idx" ON "properties" USING btree ("code");
  CREATE INDEX "properties_status_idx" ON "properties" USING btree ("status");
  CREATE INDEX "properties_agent_idx" ON "properties" USING btree ("agent_id");
  CREATE INDEX "properties_deal_idx" ON "properties" USING btree ("deal");
  CREATE INDEX "properties_type_idx" ON "properties" USING btree ("type");
  CREATE INDEX "properties_district_idx" ON "properties" USING btree ("district_id");
  CREATE INDEX "properties_price_usd_idx" ON "properties" USING btree ("price_usd");
  CREATE INDEX "properties_area_idx" ON "properties" USING btree ("area");
  CREATE INDEX "properties_rooms_idx" ON "properties" USING btree ("rooms");
  CREATE INDEX "properties_updated_at_idx" ON "properties" USING btree ("updated_at");
  CREATE INDEX "properties_created_at_idx" ON "properties" USING btree ("created_at");
  CREATE INDEX "properties_slug_idx" ON "properties_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "properties_locales_locale_parent_id_unique" ON "properties_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "properties_locales_parent_id_idx" ON "properties_locales" USING btree ("_parent_id");
  CREATE INDEX "properties_rels_order_idx" ON "properties_rels" USING btree ("order");
  CREATE INDEX "properties_rels_parent_idx" ON "properties_rels" USING btree ("parent_id");
  CREATE INDEX "properties_rels_path_idx" ON "properties_rels" USING btree ("path");
  CREATE INDEX "properties_rels_media_id_idx" ON "properties_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "districts_key_idx" ON "districts" USING btree ("key");
  CREATE INDEX "districts_updated_at_idx" ON "districts" USING btree ("updated_at");
  CREATE INDEX "districts_created_at_idx" ON "districts" USING btree ("created_at");
  CREATE UNIQUE INDEX "districts_locales_locale_parent_id_unique" ON "districts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "districts_locales_parent_id_idx" ON "districts_locales" USING btree ("_parent_id");
  CREATE INDEX "agents_languages_order_idx" ON "agents_languages" USING btree ("order");
  CREATE INDEX "agents_languages_parent_idx" ON "agents_languages" USING btree ("parent_id");
  CREATE INDEX "agents_photo_idx" ON "agents" USING btree ("photo_id");
  CREATE UNIQUE INDEX "agents_user_idx" ON "agents" USING btree ("user_id");
  CREATE INDEX "agents_updated_at_idx" ON "agents" USING btree ("updated_at");
  CREATE INDEX "agents_created_at_idx" ON "agents" USING btree ("created_at");
  CREATE UNIQUE INDEX "agents_locales_locale_parent_id_unique" ON "agents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "agents_locales_parent_id_idx" ON "agents_locales" USING btree ("_parent_id");
  CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");
  CREATE INDEX "leads_property_idx" ON "leads" USING btree ("property_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_districts_fk" FOREIGN KEY ("districts_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_agents_fk" FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_properties_id_idx" ON "payload_locked_documents_rels" USING btree ("properties_id");
  CREATE INDEX "payload_locked_documents_rels_districts_id_idx" ON "payload_locked_documents_rels" USING btree ("districts_id");
  CREATE INDEX "payload_locked_documents_rels_agents_id_idx" ON "payload_locked_documents_rels" USING btree ("agents_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties_amenities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "districts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "districts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "agents_languages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "agents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "agents_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "leads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "properties_tags" CASCADE;
  DROP TABLE "properties_amenities" CASCADE;
  DROP TABLE "properties" CASCADE;
  DROP TABLE "properties_locales" CASCADE;
  DROP TABLE "properties_rels" CASCADE;
  DROP TABLE "districts" CASCADE;
  DROP TABLE "districts_locales" CASCADE;
  DROP TABLE "agents_languages" CASCADE;
  DROP TABLE "agents" CASCADE;
  DROP TABLE "agents_locales" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_properties_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_districts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_agents_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_leads_fk";
  
  DROP INDEX "payload_locked_documents_rels_properties_id_idx";
  DROP INDEX "payload_locked_documents_rels_districts_id_idx";
  DROP INDEX "payload_locked_documents_rels_agents_id_idx";
  DROP INDEX "payload_locked_documents_rels_leads_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "properties_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "districts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "agents_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "leads_id";
  DROP TYPE "public"."enum_properties_tags";
  DROP TYPE "public"."enum_properties_amenities";
  DROP TYPE "public"."enum_properties_status";
  DROP TYPE "public"."enum_properties_deal";
  DROP TYPE "public"."enum_properties_type";
  DROP TYPE "public"."enum_properties_building";
  DROP TYPE "public"."enum_properties_condition";
  DROP TYPE "public"."enum_districts_region";
  DROP TYPE "public"."enum_agents_languages";
  DROP TYPE "public"."enum_leads_kind";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_leads_locale";`)
}
