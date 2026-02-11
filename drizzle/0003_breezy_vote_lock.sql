DO $$ BEGIN
 CREATE TYPE "public"."engagement_vote_action" AS ENUM('like', 'dislike');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_engagement_votes" (
	"post_id" uuid NOT NULL,
	"voter_hash" text NOT NULL,
	"action" "engagement_vote_action" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_engagement_votes_post_id_voter_hash_pk" PRIMARY KEY("post_id","voter_hash")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_engagement_votes" ADD CONSTRAINT "post_engagement_votes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_engagement_votes_post_action_idx" ON "post_engagement_votes" USING btree ("post_id","action");
