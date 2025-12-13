CREATE TABLE IF NOT EXISTS "Cached_Data" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp NOT NULL,
	"eol" timestamp NOT NULL,
	"start_utc" timestamp NOT NULL,
	"end_utc" timestamp NOT NULL,
	"start_az" real NOT NULL,
	"end_az" real NOT NULL,
	"start_elev" real NOT NULL,
	"end_elev" real NOT NULL,
	"lat" real NOT NULL,
	"lon" real NOT NULL,
	"elev" real NOT NULL,
	"sat_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Satellite" (
	"sat_id" integer PRIMARY KEY NOT NULL,
	"sat_name" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Cached_Data" ADD CONSTRAINT "Cached_Data_sat_id_Satellite_sat_id_fk" FOREIGN KEY ("sat_id") REFERENCES "public"."Satellite"("sat_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
