ALTER TABLE "Cached_Data" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "Cached_Data" ALTER COLUMN "created_at" SET DEFAULT now();