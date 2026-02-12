CREATE TYPE "auth_message_status" AS ENUM('pending', 'used', 'expired');--> statement-breakpoint
CREATE TABLE "auth_messages" (
	"id" serial PRIMARY KEY,
	"address" text NOT NULL UNIQUE,
	"status" "auth_message_status" DEFAULT 'pending'::"auth_message_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
