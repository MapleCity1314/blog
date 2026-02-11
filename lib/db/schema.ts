import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userStatus = pgEnum("user_status", ["active", "disabled"]);
export const postStatus = pgEnum("post_status", [
  "draft",
  "published",
  "archived",
]);
export const commentStatus = pgEnum("comment_status", [
  "visible",
  "hidden",
  "deleted",
]);
export const friendRequestStatus = pgEnum("friend_request_status", [
  "pending",
  "approved",
  "rejected",
]);
export const friendStatus = pgEnum("friend_status", ["active", "inactive"]);
export const resourceStatus = pgEnum("resource_status", [
  "draft",
  "published",
  "archived",
]);
export const engagementVoteAction = pgEnum("engagement_vote_action", [
  "like",
  "dislike",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull(),
    displayName: text("display_name"),
    email: text("email"),
    passwordHash: text("password_hash"),
    status: userStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    usernameUnique: uniqueIndex("users_username_unique").on(table.username),
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  })
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    content: text("content").notNull(),
    status: postStatus("status").notNull().default("draft"),
    coverImage: text("cover_image"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    authorId: uuid("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => ({
    slugUnique: uniqueIndex("posts_slug_unique").on(table.slug),
    statusPublishedIndex: index("posts_status_published_at_idx").on(
      table.status,
      table.publishedAt
    ),
  })
);

export const postMetrics = pgTable(
  "post_metrics",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    viewCount: integer("view_count").notNull().default(0),
    likeCount: integer("like_count").notNull().default(0),
    dislikeCount: integer("dislike_count").notNull().default(0),
    shareCount: integer("share_count").notNull().default(0),
    commentCount: integer("comment_count").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId] }),
  })
);

export const postEngagementVotes = pgTable(
  "post_engagement_votes",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    voterHash: text("voter_hash").notNull(),
    action: engagementVoteAction("action").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.voterHash] }),
    postActionIndex: index("post_engagement_votes_post_action_idx").on(
      table.postId,
      table.action
    ),
  })
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, {
      onDelete: "cascade",
    }),
    author: text("author"),
    content: text("content").notNull(),
    status: commentStatus("status").notNull().default("visible"),
    likeCount: integer("like_count").notNull().default(0),
    dislikeCount: integer("dislike_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    postParentIndex: index("comments_post_parent_idx").on(
      table.postId,
      table.parentId
    ),
  })
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    nameUnique: uniqueIndex("tags_name_unique").on(table.name),
    slugUnique: uniqueIndex("tags_slug_unique").on(table.slug),
  })
);

export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
    postTagIndex: index("post_tags_post_tag_idx").on(table.postId, table.tagId),
  })
);

export const friendRequests = pgTable(
  "friend_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    url: text("url"),
    avatar: text("avatar"),
    role: text("role"),
    desc: text("desc"),
    color: text("color"),
    email: text("email"),
    message: text("message"),
    status: friendRequestStatus("status").notNull().default("pending"),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  },
  (table) => ({
    statusCreatedIndex: index("friend_requests_status_created_idx").on(
      table.status,
      table.createdAt
    ),
    tokenUnique: uniqueIndex("friend_requests_token_unique").on(table.token),
  })
);

export const friends = pgTable("friends", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  avatar: text("avatar"),
  role: text("role"),
  desc: text("desc"),
  color: text("color"),
  bio: text("bio"),
  status: friendStatus("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const resources = pgTable(
  "resources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    url: text("url").notNull(),
    status: resourceStatus("status").notNull().default("draft"),
    category: text("category"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    statusCreatedIndex: index("resources_status_created_idx").on(
      table.status,
      table.createdAt
    ),
  })
);

export const about = pgTable("about", {
  id: uuid("id").defaultRandom().primaryKey(),
  profile: jsonb("profile").notNull(),
  heroIntro: jsonb("hero_intro").notNull(),
  heroMeta: jsonb("hero_meta").notNull(),
  partner: jsonb("partner").notNull(),
  skills: jsonb("skills").notNull(),
  experiences: jsonb("experiences").notNull(),
  blog: jsonb("blog").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedBy: uuid("updated_by").references(() => users.id),
});
