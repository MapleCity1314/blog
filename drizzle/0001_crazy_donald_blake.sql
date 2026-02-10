ALTER TABLE "friend_requests" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD COLUMN "desc" text;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD COLUMN "token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD COLUMN "expires_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD COLUMN "used_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "friends" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "friends" ADD COLUMN "desc" text;--> statement-breakpoint
ALTER TABLE "friends" ADD COLUMN "color" text;--> statement-breakpoint
CREATE UNIQUE INDEX "friend_requests_token_unique" ON "friend_requests" USING btree ("token");