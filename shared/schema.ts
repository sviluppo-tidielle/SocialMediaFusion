import { pgTable, text, serial, integer, timestamp, boolean, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  website: text("website"),
  location: text("location"), // Città o paese
  occupation: text("occupation"), // Professione
  education: text("education"), // Istituto di istruzione
  birthdate: text("birthdate"), // Data di nascita
  interests: jsonb("interests").$type<string[]>(), // Interessi come array di stringhe
  skills: jsonb("skills").$type<string[]>(), // Competenze come array di stringhe
  languages: jsonb("languages").$type<string[]>(), // Lingue parlate
  connectionPreferences: jsonb("connection_preferences").$type<string[]>(), // Preferenze per i tipi di connessioni
  facebookUrl: text("facebook_url"), // Link al profilo Facebook
  instagramUrl: text("instagram_url"), // Link al profilo Instagram
  xUrl: text("x_url"), // Link al profilo X (ex Twitter)
  linkedinUrl: text("linkedin_url"), // Link al profilo LinkedIn
  whatsappNumber: text("whatsapp_number"), // Numero WhatsApp
  tiktokUrl: text("tiktok_url"), // Link al profilo TikTok
  followerCount: integer("follower_count").default(0),
  followingCount: integer("following_count").default(0),
  postCount: integer("post_count").default(0),
});

// Posts Table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  caption: text("caption"),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(), // image, video
  isPublic: boolean("is_public").default(true), // true = pubblico, false = privato (solo per utenti connessi)
  createdAt: timestamp("created_at").defaultNow(),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
});

// Stories Table
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(), // image, video
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  viewCount: integer("view_count").default(0),
});

// Story Views
export const storyViews = pgTable("story_views", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  userId: integer("user_id").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

// Videos Table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  caption: text("caption"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  shareCount: integer("share_count").default(0),
});

// Comments Table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  contentType: text("content_type").notNull(), // 'post' or 'video'
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Follows Table
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  followingId: integer("following_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Likes Table
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  contentType: text("content_type").notNull(), // 'post' or 'video'
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications Table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // like, comment, follow, mention
  actorId: integer("actor_id").notNull(),
  contentId: integer("content_id"),
  contentType: text("content_type"), // post, video, story, user
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relazioni
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  videos: many(videos),
  stories: many(stories),
  comments: many(comments),
  likes: many(likes),
  followers: many(follows, { relationName: "followers" }),
  following: many(follows, { relationName: "following" }),
  notifications: many(notifications, { relationName: "userNotifications" }),
  actorNotifications: many(notifications, { relationName: "actorNotifications" }),
  storyViews: many(storyViews),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments, {
    relationName: "postComments"
  }),
  likes: many(likes, {
    relationName: "postLikes"
  }),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  comments: many(comments, {
    relationName: "videoComments"
  }),
  likes: many(likes, {
    relationName: "videoLikes"
  }),
}));

export const storiesRelations = relations(stories, ({ one, many }) => ({
  user: one(users, {
    fields: [stories.userId],
    references: [users.id],
  }),
  views: many(storyViews),
}));

export const storyViewsRelations = relations(storyViews, ({ one }) => ({
  story: one(stories, {
    fields: [storyViews.storyId],
    references: [stories.id],
  }),
  user: one(users, {
    fields: [storyViews.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "followers",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "userNotifications",
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: "actorNotifications",
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, followerCount: true, followingCount: true, postCount: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true, likeCount: true, commentCount: true });
export const insertStorySchema = createInsertSchema(stories).omit({ id: true, createdAt: true, viewCount: true });
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, createdAt: true, likeCount: true, commentCount: true, shareCount: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertFollowSchema = createInsertSchema(follows).omit({ id: true, createdAt: true });
export const insertLikeSchema = createInsertSchema(likes).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, read: true });
export const insertStoryViewSchema = createInsertSchema(storyViews).omit({ id: true, viewedAt: true });

// Aggiorno lo schema per l'aggiornamento profilo, omettendo i campi immutabili come username, password, ecc.
export const updateUserProfileSchema = createInsertSchema(users)
  .omit({
    id: true,
    username: true,
    password: true,
    email: true, 
    fullName: true,
    followerCount: true,
    followingCount: true,
    postCount: true
  })
  .extend({
    bio: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    occupation: z.string().nullable().optional(),
    education: z.string().nullable().optional(),
    birthdate: z.string().nullable().optional(),
    interests: z.array(z.string()).nullable().optional(),
    skills: z.array(z.string()).nullable().optional(),
    languages: z.array(z.string()).nullable().optional(),
    connectionPreferences: z.array(z.string()).nullable().optional(),
    facebookUrl: z.string().nullable().optional(),
    instagramUrl: z.string().nullable().optional(),
    xUrl: z.string().nullable().optional(),
    linkedinUrl: z.string().nullable().optional(),
    whatsappNumber: z.string().nullable().optional(),
    tiktokUrl: z.string().nullable().optional(),
  });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type StoryView = typeof storyViews.$inferSelect;
export type InsertStoryView = z.infer<typeof insertStoryViewSchema>;

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Extended types
export type UserWithProfile = User & {
  isFollowing?: boolean;
  isViewedStory?: boolean;
};

export type PostWithUser = Post & {
  user: Omit<User, 'password'>;
  isLiked?: boolean;
};

export type VideoWithUser = Video & {
  user: Omit<User, 'password'>;
  isLiked?: boolean;
};

export type StoryWithUser = Story & {
  user: Omit<User, 'password'>;
  isViewed?: boolean;
};
