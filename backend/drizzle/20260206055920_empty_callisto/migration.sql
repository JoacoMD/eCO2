ALTER TABLE "companies" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "auth_messages" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "auth_messages_id_seq";--> statement-breakpoint
ALTER TABLE "auth_messages" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "companies_id_seq";--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "industry" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "milestones_id_seq";--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "project_id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "milestones_project_id_seq";--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "project_id" SET DATA TYPE uuid USING "project_id"::uuid;--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "projects_id_seq";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "project_id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "tokens_project_id_seq";--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "project_id" SET DATA TYPE uuid USING "project_id"::uuid;--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "image" DROP NOT NULL;