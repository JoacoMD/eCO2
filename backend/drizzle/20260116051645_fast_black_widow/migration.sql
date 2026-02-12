CREATE TABLE "companies" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"industry" text NOT NULL,
	"address" text NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY,
	"project_id" serial,
	"title" text NOT NULL,
	"is_completed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");