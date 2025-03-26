import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertPostSchema,
  insertStorySchema,
  insertVideoSchema,
  insertCommentSchema,
  insertLikeSchema,
  insertFollowSchema,
  insertStoryViewSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler middleware
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ error: validationError.message });
    }
    
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  };

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username is taken
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }
      
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const credentials = z.object({
        username: z.string(),
        password: z.string()
      }).parse(req.body);
      
      const user = await storage.getUserByUsername(credentials.username);
      
      if (!user || user.password !== credentials.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId as string) : undefined;
      
      const user = await storage.getUserWithProfile(userId, currentUserId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/users/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const users = await storage.searchUsers(query);
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      
      res.json(usersWithoutPasswords);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/users/:id/posts", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const posts = await storage.getPostsByUserId(userId);
      res.json(posts);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/users/:id/videos", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const videos = await storage.getVideosByUserId(userId);
      res.json(videos);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/users/:id/followers", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const followers = await storage.getFollowers(userId);
      
      // Remove passwords from response
      const followersWithoutPasswords = followers.map(({ password, ...user }) => user);
      
      res.json(followersWithoutPasswords);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/users/:id/following", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const following = await storage.getFollowing(userId);
      
      // Remove passwords from response
      const followingWithoutPasswords = following.map(({ password, ...user }) => user);
      
      res.json(followingWithoutPasswords);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/users/:id/suggested", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const suggestedUsers = await storage.getSuggestedUsers(userId, limit);
      
      // Remove passwords from response
      const suggestedWithoutPasswords = suggestedUsers.map(({ password, ...user }) => user);
      
      res.json(suggestedWithoutPasswords);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Post routes
  app.post("/api/posts", async (req: Request, res: Response) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      res.json(post);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/feed/posts", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Valid userId is required" });
      }
      
      const posts = await storage.getFeedPosts(userId);
      res.json(posts);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.post("/api/posts/:id/like", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const { userId } = z.object({ userId: z.number() }).parse(req.body);
      
      await storage.likePost(userId, postId);
      res.status(200).json({ success: true });
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.post("/api/posts/:id/unlike", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const { userId } = z.object({ userId: z.number() }).parse(req.body);
      
      await storage.unlikePost(userId, postId);
      res.status(200).json({ success: true });
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/posts/:id/comments", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByContentId(postId, 'post');
      res.json(comments);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.post("/api/posts/:id/comments", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        contentId: postId,
        contentType: 'post'
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Video routes
  app.post("/api/videos", async (req: Request, res: Response) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(videoData);
      res.status(201).json(video);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/videos/:id", async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      
      res.json(video);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/feed/videos", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Valid userId is required" });
      }
      
      const videos = await storage.getVideosForFeed(userId);
      res.json(videos);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.post("/api/videos/:id/like", async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      const { userId } = z.object({ userId: z.number() }).parse(req.body);
      
      await storage.likeVideo(userId, videoId);
      res.status(200).json({ success: true });
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.post("/api/videos/:id/unlike", async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      const { userId } = z.object({ userId: z.number() }).parse(req.body);
      
      await storage.unlikeVideo(userId, videoId);
      res.status(200).json({ success: true });
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/videos/:id/comments", async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      const comments = await storage.getCommentsByContentId(videoId, 'video');
      res.json(comments);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.post("/api/videos/:id/comments", async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        contentId: videoId,
        contentType: 'video'
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Story routes
  app.post("/api/stories", async (req: Request, res: Response) => {
    try {
      const storyData = insertStorySchema.parse(req.body);
      const story = await storage.createStory(storyData);
      res.status(201).json(story);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/stories/:id", async (req: Request, res: Response) => {
    try {
      const storyId = parseInt(req.params.id);
      const story = await storage.getStory(storyId);
      
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      
      res.json(story);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/users/:id/stories", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const stories = await storage.getStoriesByUserId(userId);
      res.json(stories);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.get("/api/feed/stories", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Valid userId is required" });
      }
      
      const stories = await storage.getFeedStories(userId);
      res.json(stories);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.post("/api/stories/:id/view", async (req: Request, res: Response) => {
    try {
      const storyId = parseInt(req.params.id);
      const { userId } = z.object({ userId: z.number() }).parse(req.body);
      
      await storage.viewStory(userId, storyId);
      res.status(200).json({ success: true });
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Follow routes
  app.post("/api/users/:id/follow", async (req: Request, res: Response) => {
    try {
      const followingId = parseInt(req.params.id);
      const { followerId } = z.object({ followerId: z.number() }).parse(req.body);
      
      await storage.followUser(followerId, followingId);
      res.status(200).json({ success: true });
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.post("/api/users/:id/unfollow", async (req: Request, res: Response) => {
    try {
      const followingId = parseInt(req.params.id);
      const { followerId } = z.object({ followerId: z.number() }).parse(req.body);
      
      await storage.unfollowUser(followerId, followingId);
      res.status(200).json({ success: true });
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Valid userId is required" });
      }
      
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.post("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.status(200).json({ success: true });
    } catch (err) {
      handleZodError(err, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
