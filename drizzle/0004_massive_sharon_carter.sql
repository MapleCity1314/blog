CREATE TYPE "public"."ai_invite_code_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."ai_usage_entry_type" AS ENUM('model_tokens', 'tool_usage', 'admin_adjustment');--> statement-breakpoint
CREATE TABLE "ai_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"invite_code_id" uuid NOT NULL,
	"role" text NOT NULL,
	"model_alias" text,
	"provider_model" text,
	"ui_message" jsonb NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"tool_units" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_chat_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_code_id" uuid NOT NULL,
	"session_token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_invite_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code_hash" text NOT NULL,
	"label" text,
	"status" "ai_invite_code_status" DEFAULT 'active' NOT NULL,
	"token_quota" integer DEFAULT 0 NOT NULL,
	"tokens_consumed" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"last_used_at" timestamp with time zone,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "ai_usage_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_code_id" uuid NOT NULL,
	"session_id" uuid,
	"chat_id" uuid,
	"message_id" uuid,
	"entry_type" "ai_usage_entry_type" NOT NULL,
	"token_delta" integer NOT NULL,
	"tool_units" integer DEFAULT 0 NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"model_alias" text,
	"provider_model" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_session_id_ai_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_invite_code_id_ai_invite_codes_id_fk" FOREIGN KEY ("invite_code_id") REFERENCES "public"."ai_invite_codes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_invite_code_id_ai_invite_codes_id_fk" FOREIGN KEY ("invite_code_id") REFERENCES "public"."ai_invite_codes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_invite_codes" ADD CONSTRAINT "ai_invite_codes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_invite_codes" ADD CONSTRAINT "ai_invite_codes_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_ledger" ADD CONSTRAINT "ai_usage_ledger_invite_code_id_ai_invite_codes_id_fk" FOREIGN KEY ("invite_code_id") REFERENCES "public"."ai_invite_codes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_ledger" ADD CONSTRAINT "ai_usage_ledger_session_id_ai_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_chat_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_ledger" ADD CONSTRAINT "ai_usage_ledger_message_id_ai_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."ai_chat_messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_chat_messages_chat_created_idx" ON "ai_chat_messages" USING btree ("chat_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_chat_messages_session_created_idx" ON "ai_chat_messages" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_chat_messages_invite_created_idx" ON "ai_chat_messages" USING btree ("invite_code_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_chat_sessions_session_token_hash_unique" ON "ai_chat_sessions" USING btree ("session_token_hash");--> statement-breakpoint
CREATE INDEX "ai_chat_sessions_invite_expires_idx" ON "ai_chat_sessions" USING btree ("invite_code_id","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_invite_codes_code_hash_unique" ON "ai_invite_codes" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "ai_invite_codes_status_updated_idx" ON "ai_invite_codes" USING btree ("status","updated_at");--> statement-breakpoint
CREATE INDEX "ai_usage_ledger_invite_created_idx" ON "ai_usage_ledger" USING btree ("invite_code_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_usage_ledger_session_created_idx" ON "ai_usage_ledger" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_usage_ledger_message_idx" ON "ai_usage_ledger" USING btree ("message_id");
