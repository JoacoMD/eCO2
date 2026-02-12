CREATE TABLE "tokens" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"project_id" serial,
	"description" text NOT NULL,
	"image" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");