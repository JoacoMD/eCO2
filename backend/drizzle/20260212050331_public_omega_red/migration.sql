CREATE TYPE "auth_message_status" AS ENUM('pending', 'used', 'expired');--> statement-breakpoint
CREATE TABLE "auth_messages" (
	"id" uuid PRIMARY KEY,
	"address" text NOT NULL UNIQUE,
	"status" "auth_message_status" DEFAULT 'pending'::"auth_message_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY,
	"name" text UNIQUE,
	"industry" text,
	"website" text,
	"address" text NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY,
	"project_id" serial,
	"title" text,
	"url" text,
	"is_completed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY,
	"name" text UNIQUE,
	"description" text,
	"image" text,
	"website" text,
	"address" text NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" serial PRIMARY KEY,
	"name" text,
	"project_id" serial,
	"description" text,
	"image" text
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY,
	"from" text NOT NULL,
	"hash" text NOT NULL,
	"block_number" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"event" text NOT NULL,
	"data" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");