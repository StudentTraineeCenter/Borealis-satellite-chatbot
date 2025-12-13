ALTER TABLE "Message_v2" ADD COLUMN "sat_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Message_v2" ADD CONSTRAINT "Message_v2_sat_id_Satellite_sat_id_fk" FOREIGN KEY ("sat_id") REFERENCES "public"."Satellite"("sat_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
