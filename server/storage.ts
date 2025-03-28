import {
  users, posts, stories, storyViews, videos, comments,
  follows, likes, notifications,
  type User, type InsertUser, type Post, type InsertPost,
  type Story, type InsertStory, type StoryView, type InsertStoryView,
  type Video, type InsertVideo, type Comment, type InsertComment,
  type Follow, type InsertFollow, type Like, type InsertLike,
  type Notification, type InsertNotification,
  type UserWithProfile, type PostWithUser, type VideoWithUser, type StoryWithUser,
  type UpdateUserProfile
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // Sessione per l'autenticazione
  sessionStore: session.Store;
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: number, profileData: UpdateUserProfile): Promise<User>;
  getUserWithProfile(id: number, currentUserId?: number): Promise<UserWithProfile | undefined>;
  searchUsers(query: string, limit?: number): Promise<UserWithProfile[]>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  getFeedPosts(userId: number): Promise<PostWithUser[]>;
  likePost(userId: number, postId: number): Promise<void>;
  unlikePost(userId: number, postId: number): Promise<void>;
  isPostLiked(userId: number, postId: number): Promise<boolean>;
  
  // Story operations
  createStory(story: InsertStory): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  getStoriesByUserId(userId: number): Promise<Story[]>;
  getFeedStories(userId: number): Promise<StoryWithUser[]>;
  viewStory(userId: number, storyId: number): Promise<void>;
  isStoryViewed(userId: number, storyId: number): Promise<boolean>;
  
  // Video operations
  createVideo(video: InsertVideo): Promise<Video>;
  getVideo(id: number): Promise<Video | undefined>;
  getVideosByUserId(userId: number): Promise<Video[]>;
  getVideosForFeed(userId: number): Promise<VideoWithUser[]>;
  likeVideo(userId: number, videoId: number): Promise<void>;
  unlikeVideo(userId: number, videoId: number): Promise<void>;
  isVideoLiked(userId: number, videoId: number): Promise<boolean>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByContentId(contentId: number, contentType: string): Promise<Comment[]>;
  
  // Follow operations
  followUser(followerId: number, followingId: number): Promise<void>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  getSuggestedUsers(userId: number, limit?: number): Promise<UserWithProfile[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private postsMap: Map<number, Post>;
  private storiesMap: Map<number, Story>;
  private storyViewsMap: Map<number, StoryView>;
  private videosMap: Map<number, Video>;
  private commentsMap: Map<number, Comment>;
  private followsMap: Map<number, Follow>;
  private likesMap: Map<number, Like>;
  private notificationsMap: Map<number, Notification>;
  
  private userId: number;
  private postId: number;
  private storyId: number;
  private storyViewId: number;
  private videoId: number;
  private commentId: number;
  private followId: number;
  private likeId: number;
  private notificationId: number;
  
  public sessionStore: session.Store;

  constructor() {
    this.usersMap = new Map();
    this.postsMap = new Map();
    this.storiesMap = new Map();
    this.storyViewsMap = new Map();
    this.videosMap = new Map();
    this.commentsMap = new Map();
    this.followsMap = new Map();
    this.likesMap = new Map();
    this.notificationsMap = new Map();
    
    this.userId = 1;
    this.postId = 1;
    this.storyId = 1;
    this.storyViewId = 1;
    this.videoId = 1;
    this.commentId = 1;
    this.followId = 1;
    this.likeId = 1;
    this.notificationId = 1;
    
    // Inizializza il sessionStore
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 ore in millisecondi
    });
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  // Initialize with sample users for development
  private async initializeSampleData() {
    // Create sample users
    await this.createUser({
      username: "alessandrobianchi",
      password: "password123",
      fullName: "Alessandro Bianchi",
      email: "alessandro@example.com",
      bio: "Fotografia, viaggi e tecnologia 📱 | Milano, Italia 🇮🇹",
      profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=160&h=160&q=80",
      website: "www.alessandrobianchi.com"
    });
    
    await this.createUser({
      username: "sofia",
      password: "password123",
      fullName: "Sofia Bianchi",
      email: "sofia@example.com",
      bio: "Food lover | Travel enthusiast",
      profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
    });
    
    await this.createUser({
      username: "marco",
      password: "password123",
      fullName: "Marco Rossi",
      email: "marco@example.com",
      bio: "Photographer | Rome",
      profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
    });
    
    await this.createUser({
      username: "laura",
      password: "password123",
      fullName: "Laura Verdi",
      email: "laura@example.com",
      bio: "Artist | Venice",
      profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
    });
    
    await this.createUser({
      username: "antonio",
      password: "password123",
      fullName: "Antonio Esposito",
      email: "antonio@example.com",
      bio: "Developer | Naples",
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
    });
    
    await this.createUser({
      username: "chiara",
      password: "password123",
      fullName: "Chiara Neri",
      email: "chiara@example.com",
      bio: "Fashion Designer | Milan",
      profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, followerCount: 0, followingCount: 0, postCount: 0 };
    this.usersMap.set(id, user);
    return user;
  }
  
  async updateUserProfile(userId: number, profileData: UpdateUserProfile): Promise<User> {
    const existingUser = await this.getUser(userId);
    if (!existingUser) {
      throw new Error("Utente non trovato");
    }
    
    // Aggiorna solo i campi forniti, mantiene i dati esistenti per gli altri campi
    const updatedUser: User = {
      ...existingUser,
      bio: profileData.bio ?? existingUser.bio,
      website: profileData.website ?? existingUser.website,
      location: profileData.location ?? existingUser.location,
      occupation: profileData.occupation ?? existingUser.occupation,
      education: profileData.education ?? existingUser.education,
      birthdate: profileData.birthdate ?? existingUser.birthdate,
      interests: profileData.interests ?? existingUser.interests,
      skills: profileData.skills ?? existingUser.skills,
      languages: profileData.languages ?? existingUser.languages,
      connectionPreferences: profileData.connectionPreferences ?? existingUser.connectionPreferences
    };
    
    // Salva l'utente aggiornato
    this.usersMap.set(userId, updatedUser);
    
    return updatedUser;
  }
  
  async getUserWithProfile(id: number, currentUserId?: number): Promise<UserWithProfile | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    let isFollowing = false;
    if (currentUserId) {
      isFollowing = await this.isFollowing(currentUserId, id);
    }
    
    return { ...user, isFollowing };
  }
  
  async searchUsers(query: string, limit: number = 10): Promise<UserWithProfile[]> {
    const users = Array.from(this.usersMap.values())
      .filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) || 
        user.fullName.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);
    
    return users.map(user => ({
      ...user,
      isFollowing: false
    }));
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const id = this.postId++;
    const newPost: Post = {
      ...post,
      id,
      createdAt: new Date(),
      likeCount: 0,
      commentCount: 0
    };
    this.postsMap.set(id, newPost);
    
    // Update user post count
    const user = await this.getUser(post.userId);
    if (user) {
      this.usersMap.set(user.id, {
        ...user,
        postCount: user.postCount + 1
      });
    }
    
    return newPost;
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.postsMap.get(id);
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return Array.from(this.postsMap.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getFeedPosts(userId: number): Promise<PostWithUser[]> {
    // Get users followed by userId
    const following = await this.getFollowing(userId);
    const followingIds = following.map(user => user.id);
    
    // Get posts from users followed + own posts
    const feedPosts = Array.from(this.postsMap.values())
      .filter(post => followingIds.includes(post.userId) || post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Add user information to each post
    const postsWithUsers: PostWithUser[] = [];
    for (const post of feedPosts) {
      const user = await this.getUser(post.userId);
      if (user) {
        const isLiked = await this.isPostLiked(userId, post.id);
        const { password, ...userWithoutPassword } = user;
        postsWithUsers.push({
          ...post,
          user: userWithoutPassword,
          isLiked
        });
      }
    }
    
    return postsWithUsers;
  }

  async likePost(userId: number, postId: number): Promise<void> {
    // Check if already liked
    const alreadyLiked = await this.isPostLiked(userId, postId);
    if (alreadyLiked) return;
    
    const post = await this.getPost(postId);
    if (!post) throw new Error("Post not found");
    
    // Create like record
    const id = this.likeId++;
    const like: Like = {
      id,
      userId,
      contentId: postId,
      contentType: 'post',
      createdAt: new Date()
    };
    this.likesMap.set(id, like);
    
    // Update post like count
    this.postsMap.set(postId, {
      ...post,
      likeCount: post.likeCount + 1
    });
    
    // Create notification for post owner
    if (userId !== post.userId) {
      await this.createNotification({
        userId: post.userId,
        type: 'like',
        actorId: userId,
        contentId: postId,
        contentType: 'post'
      });
    }
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    // Find like record
    const like = Array.from(this.likesMap.values()).find(
      like => like.userId === userId && like.contentId === postId && like.contentType === 'post'
    );
    
    if (!like) return;
    
    // Remove like record
    this.likesMap.delete(like.id);
    
    // Update post like count
    const post = await this.getPost(postId);
    if (post) {
      this.postsMap.set(postId, {
        ...post,
        likeCount: Math.max(0, post.likeCount - 1)
      });
    }
  }

  async isPostLiked(userId: number, postId: number): Promise<boolean> {
    return Array.from(this.likesMap.values()).some(
      like => like.userId === userId && like.contentId === postId && like.contentType === 'post'
    );
  }

  // Story operations
  async createStory(story: InsertStory): Promise<Story> {
    const id = this.storyId++;
    const newStory: Story = {
      ...story,
      id,
      createdAt: new Date(),
      viewCount: 0
    };
    this.storiesMap.set(id, newStory);
    return newStory;
  }

  async getStory(id: number): Promise<Story | undefined> {
    return this.storiesMap.get(id);
  }

  async getStoriesByUserId(userId: number): Promise<Story[]> {
    const now = new Date();
    return Array.from(this.storiesMap.values())
      .filter(story => story.userId === userId && story.expiresAt > now)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getFeedStories(userId: number): Promise<StoryWithUser[]> {
    // Get users followed by userId
    const following = await this.getFollowing(userId);
    const followingIds = following.map(user => user.id);
    
    const now = new Date();
    
    // Get stories from users followed + own stories that haven't expired
    const feedStories = Array.from(this.storiesMap.values())
      .filter(story => 
        (followingIds.includes(story.userId) || story.userId === userId) && 
        story.expiresAt > now
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Add user information and viewed status to each story
    const storiesWithUsers: StoryWithUser[] = [];
    for (const story of feedStories) {
      const user = await this.getUser(story.userId);
      if (user) {
        const isViewed = await this.isStoryViewed(userId, story.id);
        const { password, ...userWithoutPassword } = user;
        storiesWithUsers.push({
          ...story,
          user: userWithoutPassword,
          isViewed
        });
      }
    }
    
    return storiesWithUsers;
  }

  async viewStory(userId: number, storyId: number): Promise<void> {
    // Check if already viewed
    const alreadyViewed = await this.isStoryViewed(userId, storyId);
    if (alreadyViewed) return;
    
    const story = await this.getStory(storyId);
    if (!story) throw new Error("Story not found");
    
    // Create story view record
    const id = this.storyViewId++;
    const storyView: StoryView = {
      id,
      userId,
      storyId,
      viewedAt: new Date()
    };
    this.storyViewsMap.set(id, storyView);
    
    // Update story view count
    this.storiesMap.set(storyId, {
      ...story,
      viewCount: story.viewCount + 1
    });
  }

  async isStoryViewed(userId: number, storyId: number): Promise<boolean> {
    return Array.from(this.storyViewsMap.values()).some(
      view => view.userId === userId && view.storyId === storyId
    );
  }

  // Video operations
  async createVideo(video: InsertVideo): Promise<Video> {
    const id = this.videoId++;
    const newVideo: Video = {
      ...video,
      id,
      createdAt: new Date(),
      likeCount: 0,
      commentCount: 0,
      shareCount: 0
    };
    this.videosMap.set(id, newVideo);
    
    // Update user post count (videos count as posts)
    const user = await this.getUser(video.userId);
    if (user) {
      this.usersMap.set(user.id, {
        ...user,
        postCount: user.postCount + 1
      });
    }
    
    return newVideo;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videosMap.get(id);
  }

  async getVideosByUserId(userId: number): Promise<Video[]> {
    return Array.from(this.videosMap.values())
      .filter(video => video.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getVideosForFeed(userId: number): Promise<VideoWithUser[]> {
    // Get users followed by userId
    const following = await this.getFollowing(userId);
    const followingIds = following.map(user => user.id);
    
    // Get videos from users followed + own videos
    const feedVideos = Array.from(this.videosMap.values())
      .filter(video => followingIds.includes(video.userId) || video.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Add user information to each video
    const videosWithUsers: VideoWithUser[] = [];
    for (const video of feedVideos) {
      const user = await this.getUser(video.userId);
      if (user) {
        const isLiked = await this.isVideoLiked(userId, video.id);
        const { password, ...userWithoutPassword } = user;
        videosWithUsers.push({
          ...video,
          user: userWithoutPassword,
          isLiked
        });
      }
    }
    
    return videosWithUsers;
  }

  async likeVideo(userId: number, videoId: number): Promise<void> {
    // Check if already liked
    const alreadyLiked = await this.isVideoLiked(userId, videoId);
    if (alreadyLiked) return;
    
    const video = await this.getVideo(videoId);
    if (!video) throw new Error("Video not found");
    
    // Create like record
    const id = this.likeId++;
    const like: Like = {
      id,
      userId,
      contentId: videoId,
      contentType: 'video',
      createdAt: new Date()
    };
    this.likesMap.set(id, like);
    
    // Update video like count
    this.videosMap.set(videoId, {
      ...video,
      likeCount: video.likeCount + 1
    });
    
    // Create notification for video owner
    if (userId !== video.userId) {
      await this.createNotification({
        userId: video.userId,
        type: 'like',
        actorId: userId,
        contentId: videoId,
        contentType: 'video'
      });
    }
  }

  async unlikeVideo(userId: number, videoId: number): Promise<void> {
    // Find like record
    const like = Array.from(this.likesMap.values()).find(
      like => like.userId === userId && like.contentId === videoId && like.contentType === 'video'
    );
    
    if (!like) return;
    
    // Remove like record
    this.likesMap.delete(like.id);
    
    // Update video like count
    const video = await this.getVideo(videoId);
    if (video) {
      this.videosMap.set(videoId, {
        ...video,
        likeCount: Math.max(0, video.likeCount - 1)
      });
    }
  }

  async isVideoLiked(userId: number, videoId: number): Promise<boolean> {
    return Array.from(this.likesMap.values()).some(
      like => like.userId === userId && like.contentId === videoId && like.contentType === 'video'
    );
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const newComment: Comment = {
      ...comment,
      id,
      createdAt: new Date()
    };
    this.commentsMap.set(id, newComment);
    
    // Update comment count on the content
    if (comment.contentType === 'post') {
      const post = await this.getPost(comment.contentId);
      if (post) {
        this.postsMap.set(post.id, {
          ...post,
          commentCount: post.commentCount + 1
        });
      }
    } else if (comment.contentType === 'video') {
      const video = await this.getVideo(comment.contentId);
      if (video) {
        this.videosMap.set(video.id, {
          ...video,
          commentCount: video.commentCount + 1
        });
      }
    }
    
    // Create notification for content owner
    const contentOwnerId = comment.contentType === 'post' 
      ? (await this.getPost(comment.contentId))?.userId 
      : (await this.getVideo(comment.contentId))?.userId;
    
    if (contentOwnerId && contentOwnerId !== comment.userId) {
      await this.createNotification({
        userId: contentOwnerId,
        type: 'comment',
        actorId: comment.userId,
        contentId: comment.contentId,
        contentType: comment.contentType
      });
    }
    
    return newComment;
  }

  async getCommentsByContentId(contentId: number, contentType: string): Promise<Comment[]> {
    return Array.from(this.commentsMap.values())
      .filter(comment => comment.contentId === contentId && comment.contentType === contentType)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Follow operations
  async followUser(followerId: number, followingId: number): Promise<void> {
    // Check if already following
    const alreadyFollowing = await this.isFollowing(followerId, followingId);
    if (alreadyFollowing) return;
    
    // Create follow record
    const id = this.followId++;
    const follow: Follow = {
      id,
      followerId,
      followingId,
      createdAt: new Date()
    };
    this.followsMap.set(id, follow);
    
    // Update follower/following counts
    const follower = await this.getUser(followerId);
    const following = await this.getUser(followingId);
    
    if (follower) {
      this.usersMap.set(followerId, {
        ...follower,
        followingCount: follower.followingCount + 1
      });
    }
    
    if (following) {
      this.usersMap.set(followingId, {
        ...following,
        followerCount: following.followerCount + 1
      });
    }
    
    // Create notification
    await this.createNotification({
      userId: followingId,
      type: 'follow',
      actorId: followerId,
      contentType: 'user'
    });
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    // Find follow record
    const follow = Array.from(this.followsMap.values()).find(
      follow => follow.followerId === followerId && follow.followingId === followingId
    );
    
    if (!follow) return;
    
    // Remove follow record
    this.followsMap.delete(follow.id);
    
    // Update follower/following counts
    const follower = await this.getUser(followerId);
    const following = await this.getUser(followingId);
    
    if (follower) {
      this.usersMap.set(followerId, {
        ...follower,
        followingCount: Math.max(0, follower.followingCount - 1)
      });
    }
    
    if (following) {
      this.usersMap.set(followingId, {
        ...following,
        followerCount: Math.max(0, following.followerCount - 1)
      });
    }
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    return Array.from(this.followsMap.values()).some(
      follow => follow.followerId === followerId && follow.followingId === followingId
    );
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followerIds = Array.from(this.followsMap.values())
      .filter(follow => follow.followingId === userId)
      .map(follow => follow.followerId);
    
    const followers: User[] = [];
    for (const id of followerIds) {
      const user = await this.getUser(id);
      if (user) followers.push(user);
    }
    
    return followers;
  }

  async getFollowing(userId: number): Promise<User[]> {
    const followingIds = Array.from(this.followsMap.values())
      .filter(follow => follow.followerId === userId)
      .map(follow => follow.followingId);
    
    const following: User[] = [];
    for (const id of followingIds) {
      const user = await this.getUser(id);
      if (user) following.push(user);
    }
    
    return following;
  }

  async getSuggestedUsers(userId: number, limit: number = 5): Promise<UserWithProfile[]> {
    // Ottiene informazioni sull'utente corrente
    const currentUser = await this.getUser(userId);
    if (!currentUser) return [];
    
    // Ottiene gli utenti già seguiti
    const following = await this.getFollowing(userId);
    const followingIds = following.map(user => user.id);
    
    // Ottiene tutti gli utenti che non sono già seguiti (escludendo se stesso)
    const potentialSuggestions = Array.from(this.usersMap.values())
      .filter(user => user.id !== userId && !followingIds.includes(user.id));
    
    // Funzione per calcolare un punteggio di affinità tra utenti
    const calculateAffinityScore = (user: User): number => {
      let score = 0;
      
      // Punteggio per località corrispondente
      if (currentUser.location && user.location && 
          currentUser.location.toLowerCase() === user.location.toLowerCase()) {
        score += 5;
      }
      
      // Punteggio per stesso ambito educativo
      if (currentUser.education && user.education && 
          currentUser.education.toLowerCase() === user.education.toLowerCase()) {
        score += 4;
      }
      
      // Punteggio per stessa occupazione/professione
      if (currentUser.occupation && user.occupation && 
          currentUser.occupation.toLowerCase() === user.occupation.toLowerCase()) {
        score += 3;
      }
      
      // Punteggio per interessi comuni
      if (currentUser.interests && user.interests) {
        const commonInterests = currentUser.interests.filter(interest => 
          user.interests?.includes(interest)
        );
        score += commonInterests.length * 2;
      }
      
      // Punteggio per abilità comuni
      if (currentUser.skills && user.skills) {
        const commonSkills = currentUser.skills.filter(skill => 
          user.skills?.includes(skill)
        );
        score += commonSkills.length;
      }
      
      // Punteggio per lingue comuni
      if (currentUser.languages && user.languages) {
        const commonLanguages = currentUser.languages.filter(language => 
          user.languages?.includes(language)
        );
        score += commonLanguages.length;
      }
      
      // Se l'utente ha specificato preferenze di connessione, considerale
      if (currentUser.connectionPreferences && currentUser.connectionPreferences.length > 0) {
        if (currentUser.connectionPreferences.includes('location') && 
            currentUser.location === user.location) {
          score += 3;
        }
        
        if (currentUser.connectionPreferences.includes('education') && 
            currentUser.education === user.education) {
          score += 3;
        }
        
        if (currentUser.connectionPreferences.includes('professional') && 
            currentUser.occupation === user.occupation) {
          score += 3;
        }
        
        if (currentUser.connectionPreferences.includes('interests') && 
            currentUser.interests && user.interests) {
          const hasCommonInterests = currentUser.interests.some(interest => 
            user.interests?.includes(interest)
          );
          if (hasCommonInterests) score += 3;
        }
      }
      
      return score;
    };
    
    // Calcola il punteggio per ciascun utente e ordina in base al punteggio
    const scoredSuggestions = potentialSuggestions.map(user => ({
      user,
      score: calculateAffinityScore(user)
    }));
    
    // Ordina per punteggio (dal più alto al più basso)
    scoredSuggestions.sort((a, b) => b.score - a.score);
    
    // Seleziona i top N utenti
    const suggestedUsers = scoredSuggestions
      .slice(0, limit)
      .map(item => ({
        ...item.user,
        isFollowing: false
      }));
    
    return suggestedUsers;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const newNotification: Notification = {
      ...notification,
      id,
      read: false,
      createdAt: new Date()
    };
    this.notificationsMap.set(id, newNotification);
    return newNotification;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notificationsMap.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    const notification = this.notificationsMap.get(notificationId);
    if (notification) {
      this.notificationsMap.set(notificationId, {
        ...notification,
        read: true
      });
    }
  }
}

// Implementazione del DatabaseStorage che utilizza Drizzle ORM per PostgreSQL
import { db } from './db';
import { eq, and, or, like, desc, asc, sql, not, isNull } from 'drizzle-orm';
import connectPg from 'connect-pg-simple';

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Inizializza il session store PostgreSQL
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUserProfile(userId: number, profileData: UpdateUserProfile): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(profileData)
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error("Utente non trovato");
    }
    
    return updatedUser;
  }

  async getUserWithProfile(id: number, currentUserId?: number): Promise<UserWithProfile | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (!user) return undefined;
    
    let isFollowing = false;
    if (currentUserId) {
      isFollowing = await this.isFollowing(currentUserId, id);
    }
    
    return { ...user, isFollowing };
  }

  async searchUsers(query: string, limit: number = 10): Promise<UserWithProfile[]> {
    const foundUsers = await db
      .select()
      .from(users)
      .where(
        or(
          like(users.username, `%${query}%`),
          like(users.fullName, `%${query}%`)
        )
      )
      .limit(limit);
    
    return foundUsers.map(user => ({
      ...user,
      isFollowing: false
    }));
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    
    // Update user post count
    await db
      .update(users)
      .set({ postCount: sql`${users.postCount} + 1` })
      .where(eq(users.id, post.userId));
    
    return newPost;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async getFeedPosts(userId: number): Promise<PostWithUser[]> {
    // Get followed users IDs
    const followedUsers = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    
    const followingIds = followedUsers.map(f => f.followingId);
    
    // Include own posts and followed users' posts
    const feedPosts = await db
      .select()
      .from(posts)
      .where(
        or(
          eq(posts.userId, userId),
          userId ? sql`${posts.userId} IN (${followingIds.length > 0 ? followingIds.join(',') : 0})` : sql`FALSE`
        )
      )
      .orderBy(desc(posts.createdAt));
    
    // Add user info and like status
    const postsWithUsers: PostWithUser[] = [];
    
    for (const post of feedPosts) {
      const [postUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, post.userId));
      
      if (postUser) {
        const isLiked = await this.isPostLiked(userId, post.id);
        const { password, ...userWithoutPassword } = postUser;
        
        postsWithUsers.push({
          ...post,
          user: userWithoutPassword,
          isLiked
        });
      }
    }
    
    return postsWithUsers;
  }

  async likePost(userId: number, postId: number): Promise<void> {
    // Check if already liked
    const alreadyLiked = await this.isPostLiked(userId, postId);
    if (alreadyLiked) return;
    
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!post) throw new Error("Post not found");
    
    // Create like record
    await db.insert(likes).values({
      userId,
      contentId: postId,
      contentType: 'post'
    });
    
    // Update post like count
    await db
      .update(posts)
      .set({ likeCount: sql`${posts.likeCount} + 1` })
      .where(eq(posts.id, postId));
    
    // Create notification
    if (userId !== post.userId) {
      await this.createNotification({
        userId: post.userId,
        type: 'like',
        actorId: userId,
        contentId: postId,
        contentType: 'post'
      });
    }
  }

  async unlikePost(userId: number, postId: number): Promise<void> {
    // Delete like record
    const deletedCount = await db
      .delete(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.contentId, postId),
          eq(likes.contentType, 'post')
        )
      );
    
    if (deletedCount) {
      // Update post like count
      await db
        .update(posts)
        .set({ likeCount: sql`GREATEST(0, ${posts.likeCount} - 1)` })
        .where(eq(posts.id, postId));
    }
  }

  async isPostLiked(userId: number, postId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.contentId, postId),
          eq(likes.contentType, 'post')
        )
      );
    
    return !!like;
  }

  // Story operations
  async createStory(story: InsertStory): Promise<Story> {
    const [newStory] = await db.insert(stories).values(story).returning();
    return newStory;
  }

  async getStory(id: number): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story;
  }

  async getStoriesByUserId(userId: number): Promise<Story[]> {
    const now = new Date();
    return db
      .select()
      .from(stories)
      .where(
        and(
          eq(stories.userId, userId),
          sql`${stories.expiresAt} > NOW()`
        )
      )
      .orderBy(desc(stories.createdAt));
  }

  async getFeedStories(userId: number): Promise<StoryWithUser[]> {
    // Get followed users
    const followedUsers = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    
    const followingIds = followedUsers.map(f => f.followingId);
    
    // Get active stories from followed users and self
    const feedStories = await db
      .select()
      .from(stories)
      .where(
        and(
          or(
            eq(stories.userId, userId),
            userId ? sql`${stories.userId} IN (${followingIds.length > 0 ? followingIds.join(',') : 0})` : sql`FALSE`
          ),
          sql`${stories.expiresAt} > NOW()`
        )
      )
      .orderBy(desc(stories.createdAt));
    
    // Add user info and viewed status
    const storiesWithUsers: StoryWithUser[] = [];
    
    for (const story of feedStories) {
      const [storyUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, story.userId));
      
      if (storyUser) {
        const isViewed = await this.isStoryViewed(userId, story.id);
        const { password, ...userWithoutPassword } = storyUser;
        
        storiesWithUsers.push({
          ...story,
          user: userWithoutPassword,
          isViewed
        });
      }
    }
    
    return storiesWithUsers;
  }

  async viewStory(userId: number, storyId: number): Promise<void> {
    // Check if already viewed
    const alreadyViewed = await this.isStoryViewed(userId, storyId);
    if (alreadyViewed) return;
    
    // Create view record
    await db.insert(storyViews).values({
      userId,
      storyId
    });
    
    // Update story view count
    await db
      .update(stories)
      .set({ viewCount: sql`${stories.viewCount} + 1` })
      .where(eq(stories.id, storyId));
  }

  async isStoryViewed(userId: number, storyId: number): Promise<boolean> {
    const [view] = await db
      .select()
      .from(storyViews)
      .where(
        and(
          eq(storyViews.userId, userId),
          eq(storyViews.storyId, storyId)
        )
      );
    
    return !!view;
  }

  // Video operations
  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    
    // Update user post count
    await db
      .update(users)
      .set({ postCount: sql`${users.postCount} + 1` })
      .where(eq(users.id, video.userId));
    
    return newVideo;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async getVideosByUserId(userId: number): Promise<Video[]> {
    return db
      .select()
      .from(videos)
      .where(eq(videos.userId, userId))
      .orderBy(desc(videos.createdAt));
  }

  async getVideosForFeed(userId: number): Promise<VideoWithUser[]> {
    // Get followed users
    const followedUsers = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    
    const followingIds = followedUsers.map(f => f.followingId);
    
    // Get videos from followed users and self
    const feedVideos = await db
      .select()
      .from(videos)
      .where(
        or(
          eq(videos.userId, userId),
          userId ? sql`${videos.userId} IN (${followingIds.length > 0 ? followingIds.join(',') : 0})` : sql`FALSE`
        )
      )
      .orderBy(desc(videos.createdAt));
    
    // Add user info and like status
    const videosWithUsers: VideoWithUser[] = [];
    
    for (const video of feedVideos) {
      const [videoUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, video.userId));
      
      if (videoUser) {
        const isLiked = await this.isVideoLiked(userId, video.id);
        const { password, ...userWithoutPassword } = videoUser;
        
        videosWithUsers.push({
          ...video,
          user: userWithoutPassword,
          isLiked
        });
      }
    }
    
    return videosWithUsers;
  }

  async likeVideo(userId: number, videoId: number): Promise<void> {
    // Check if already liked
    const alreadyLiked = await this.isVideoLiked(userId, videoId);
    if (alreadyLiked) return;
    
    const [video] = await db.select().from(videos).where(eq(videos.id, videoId));
    if (!video) throw new Error("Video not found");
    
    // Create like record
    await db.insert(likes).values({
      userId,
      contentId: videoId,
      contentType: 'video'
    });
    
    // Update video like count
    await db
      .update(videos)
      .set({ likeCount: sql`${videos.likeCount} + 1` })
      .where(eq(videos.id, videoId));
    
    // Create notification
    if (userId !== video.userId) {
      await this.createNotification({
        userId: video.userId,
        type: 'like',
        actorId: userId,
        contentId: videoId,
        contentType: 'video'
      });
    }
  }

  async unlikeVideo(userId: number, videoId: number): Promise<void> {
    // Delete like record
    const deletedCount = await db
      .delete(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.contentId, videoId),
          eq(likes.contentType, 'video')
        )
      );
    
    if (deletedCount) {
      // Update video like count
      await db
        .update(videos)
        .set({ likeCount: sql`GREATEST(0, ${videos.likeCount} - 1)` })
        .where(eq(videos.id, videoId));
    }
  }

  async isVideoLiked(userId: number, videoId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.contentId, videoId),
          eq(likes.contentType, 'video')
        )
      );
    
    return !!like;
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    
    // Update comment count on content
    if (comment.contentType === 'post') {
      await db
        .update(posts)
        .set({ commentCount: sql`${posts.commentCount} + 1` })
        .where(eq(posts.id, comment.contentId));
        
      // Get post owner for notification
      const [post] = await db
        .select({ userId: posts.userId })
        .from(posts)
        .where(eq(posts.id, comment.contentId));
      
      // Create notification for post owner
      if (post && post.userId !== comment.userId) {
        await this.createNotification({
          userId: post.userId,
          type: 'comment',
          actorId: comment.userId,
          contentId: comment.contentId,
          contentType: 'post'
        });
      }
    } else if (comment.contentType === 'video') {
      await db
        .update(videos)
        .set({ commentCount: sql`${videos.commentCount} + 1` })
        .where(eq(videos.id, comment.contentId));
        
      // Get video owner for notification
      const [video] = await db
        .select({ userId: videos.userId })
        .from(videos)
        .where(eq(videos.id, comment.contentId));
      
      // Create notification for video owner
      if (video && video.userId !== comment.userId) {
        await this.createNotification({
          userId: video.userId,
          type: 'comment',
          actorId: comment.userId,
          contentId: comment.contentId,
          contentType: 'video'
        });
      }
    }
    
    return newComment;
  }

  async getCommentsByContentId(contentId: number, contentType: string): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.contentId, contentId),
          eq(comments.contentType, contentType)
        )
      )
      .orderBy(asc(comments.createdAt));
  }

  // Follow operations
  async followUser(followerId: number, followingId: number): Promise<void> {
    // Check if already following
    const alreadyFollowing = await this.isFollowing(followerId, followingId);
    if (alreadyFollowing) return;
    
    // Create follow record
    await db.insert(follows).values({
      followerId,
      followingId
    });
    
    // Update follower count for followed user
    await db
      .update(users)
      .set({ followerCount: sql`${users.followerCount} + 1` })
      .where(eq(users.id, followingId));
    
    // Update following count for follower
    await db
      .update(users)
      .set({ followingCount: sql`${users.followingCount} + 1` })
      .where(eq(users.id, followerId));
    
    // Create notification
    await this.createNotification({
      userId: followingId,
      type: 'follow',
      actorId: followerId,
      contentType: 'user'
    });
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    // Delete follow record
    const deletedCount = await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
    
    if (deletedCount) {
      // Update follower count for followed user
      await db
        .update(users)
        .set({ followerCount: sql`GREATEST(0, ${users.followerCount} - 1)` })
        .where(eq(users.id, followingId));
      
      // Update following count for follower
      await db
        .update(users)
        .set({ followingCount: sql`GREATEST(0, ${users.followingCount} - 1)` })
        .where(eq(users.id, followerId));
    }
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
    
    return !!follow;
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followers = await db
      .select({ user: users })
      .from(users)
      .innerJoin(follows, eq(users.id, follows.followerId))
      .where(eq(follows.followingId, userId));
    
    return followers.map(f => f.user);
  }

  async getFollowing(userId: number): Promise<User[]> {
    const following = await db
      .select({ user: users })
      .from(users)
      .innerJoin(follows, eq(users.id, follows.followingId))
      .where(eq(follows.followerId, userId));
    
    return following.map(f => f.user);
  }

  async getSuggestedUsers(userId: number, limit: number = 5): Promise<UserWithProfile[]> {
    // Ottiene informazioni sull'utente corrente
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
    if (!currentUser) return [];
    
    // Ottiene gli utenti già seguiti
    const followedUsers = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    
    const followingIds = followedUsers.map(f => f.followingId);
    
    // Ottiene tutti gli utenti che non sono già seguiti (escludendo se stesso)
    const potentialSuggestions = await db
      .select()
      .from(users)
      .where(
        and(
          not(eq(users.id, userId)),
          !followingIds.length ? sql`TRUE` : sql`${users.id} NOT IN (${followingIds.join(',')})`
        )
      );
    
    // Funzione per calcolare un punteggio di affinità tra utenti
    const calculateAffinityScore = (user: User): number => {
      let score = 0;
      
      // Punteggio per località corrispondente
      if (currentUser.location && user.location && 
          currentUser.location.toLowerCase() === user.location.toLowerCase()) {
        score += 5;
      }
      
      // Punteggio per stesso ambito educativo
      if (currentUser.education && user.education && 
          currentUser.education.toLowerCase() === user.education.toLowerCase()) {
        score += 4;
      }
      
      // Punteggio per stessa occupazione/professione
      if (currentUser.occupation && user.occupation && 
          currentUser.occupation.toLowerCase() === user.occupation.toLowerCase()) {
        score += 3;
      }
      
      // Punteggio per interessi comuni
      if (currentUser.interests && user.interests) {
        const commonInterests = currentUser.interests.filter(interest => 
          user.interests?.includes(interest)
        );
        score += commonInterests.length * 2;
      }
      
      // Punteggio per abilità comuni
      if (currentUser.skills && user.skills) {
        const commonSkills = currentUser.skills.filter(skill => 
          user.skills?.includes(skill)
        );
        score += commonSkills.length;
      }
      
      // Punteggio per lingue comuni
      if (currentUser.languages && user.languages) {
        const commonLanguages = currentUser.languages.filter(language => 
          user.languages?.includes(language)
        );
        score += commonLanguages.length;
      }
      
      // Se l'utente ha specificato preferenze di connessione, considerale
      if (currentUser.connectionPreferences && currentUser.connectionPreferences.length > 0) {
        if (currentUser.connectionPreferences.includes('location') && 
            currentUser.location === user.location) {
          score += 3;
        }
        
        if (currentUser.connectionPreferences.includes('education') && 
            currentUser.education === user.education) {
          score += 3;
        }
        
        if (currentUser.connectionPreferences.includes('professional') && 
            currentUser.occupation === user.occupation) {
          score += 3;
        }
        
        if (currentUser.connectionPreferences.includes('interests') && 
            currentUser.interests && user.interests) {
          const hasCommonInterests = currentUser.interests.some(interest => 
            user.interests?.includes(interest)
          );
          if (hasCommonInterests) score += 3;
        }
      }
      
      return score;
    };
    
    // Calcola il punteggio per ciascun utente e ordina in base al punteggio
    const scoredSuggestions = potentialSuggestions.map(user => ({
      user,
      score: calculateAffinityScore(user)
    }));
    
    // Ordina per punteggio (dal più alto al più basso)
    scoredSuggestions.sort((a, b) => b.score - a.score);
    
    // Seleziona i top N utenti
    const suggestedUsers = scoredSuggestions
      .slice(0, limit)
      .map(item => ({
        ...item.user,
        isFollowing: false
      }));
    
    return suggestedUsers;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values({ ...notification, read: false })
      .returning();
    
    return newNotification;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
  }
}

// Esporta l'istanza di storage (database)
export const storage = new DatabaseStorage();
