import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { PostWithUser } from '@shared/schema';
import { useTab } from '@/hooks/use-tab';
import { Heart, MessageCircle, Send, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock current user id until auth is implemented
const CURRENT_USER_ID = 1;

export default function Feed() {
  const { setActiveTab } = useTab();
  const queryClient = useQueryClient();
  
  // Set the active tab when this component mounts
  useEffect(() => {
    setActiveTab('feed');
  }, [setActiveTab]);
  
  // Fetch feed posts
  const { data: posts, isLoading, error } = useQuery<PostWithUser[]>({
    queryKey: [`/api/feed/posts?userId=${CURRENT_USER_ID}`],
  });
  
  // Like/unlike post mutations
  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: number, isLiked: boolean }) => {
      const endpoint = isLiked ? `/api/posts/${postId}/unlike` : `/api/posts/${postId}/like`;
      return await apiRequest('POST', endpoint, { userId: CURRENT_USER_ID });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/feed/posts?userId=${CURRENT_USER_ID}`] });
    }
  });
  
  const handleLikePost = (postId: number, isLiked: boolean) => {
    likeMutation.mutate({ postId, isLiked });
  };
  
  const handleCommentPost = (postId: number) => {
    // Implement comment functionality
    console.log('Comment on post', postId);
  };
  
  const handleSharePost = (postId: number) => {
    // Implement share functionality
    console.log('Share post', postId);
  };
  
  const handlePostOptions = (postId: number) => {
    // Implement options menu (delete, edit, etc.)
    console.log('Post options', postId);
  };
  
  if (isLoading) {
    return <PostFeedSkeleton />;
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading feed. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="post-feed overflow-y-auto" id="feedContent">
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <PostItem 
            key={post.id} 
            post={post} 
            onLike={handleLikePost}
            onComment={handleCommentPost}
            onShare={handleSharePost}
            onOptions={handlePostOptions}
          />
        ))
      ) : (
        <div className="p-8 text-center">
          <p className="text-slate-500">No posts yet. Follow more users to see their content.</p>
        </div>
      )}
    </div>
  );
}

interface PostItemProps {
  post: PostWithUser;
  onLike: (postId: number, isLiked: boolean) => void;
  onComment: (postId: number) => void;
  onShare: (postId: number) => void;
  onOptions: (postId: number) => void;
}

function PostItem({ post, onLike, onComment, onShare, onOptions }: PostItemProps) {
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };
  
  return (
    <article className="border-b border-slate-200 pb-3 mb-3">
      {/* Post Header */}
      <div className="flex items-center px-4 py-2">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          <img 
            src={post.user.profilePicture || `https://ui-avatars.com/api/?name=${post.user.username}`} 
            alt={`${post.user.username}'s avatar`} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm">{post.user.fullName}</h3>
          <p className="text-xs text-slate-500">{formatTimestamp(post.createdAt)}</p>
        </div>
        <button 
          className="text-slate-500" 
          onClick={() => onOptions(post.id)}
          aria-label="Post options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      
      {/* Post Content */}
      <div className="mb-2">
        {post.caption && (
          <p className="px-4 mb-2 text-sm">{post.caption}</p>
        )}
        <div className="w-full aspect-square bg-slate-100">
          <img 
            src={post.mediaUrl} 
            alt="Post image" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="flex items-center gap-1" 
            onClick={() => onLike(post.id, post.isLiked || false)}
            aria-label={post.isLiked ? "Unlike post" : "Like post"}
          >
            <Heart className={`h-5 w-5 ${post.isLiked ? 'text-primary fill-primary' : 'text-slate-600'}`} />
            <span className="text-sm">{post.likeCount}</span>
          </button>
          <button 
            className="flex items-center gap-1" 
            onClick={() => onComment(post.id)}
            aria-label="Comment on post"
          >
            <MessageCircle className="h-5 w-5 text-slate-600" />
            <span className="text-sm">{post.commentCount}</span>
          </button>
        </div>
        <button 
          onClick={() => onShare(post.id)}
          aria-label="Share post"
        >
          <Send className="h-5 w-5 text-slate-600" />
        </button>
      </div>
    </article>
  );
}

function PostFeedSkeleton() {
  // Create an array of 3 skeleton posts
  return (
    <div className="post-feed overflow-y-auto">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border-b border-slate-200 pb-3 mb-3">
          {/* Post Header Skeleton */}
          <div className="flex items-center px-4 py-2">
            <Skeleton className="w-10 h-10 rounded-full mr-3" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          
          {/* Post Content Skeleton */}
          <div className="mb-2">
            <Skeleton className="h-4 w-3/4 mx-4 mb-2" />
            <Skeleton className="w-full aspect-square" />
          </div>
          
          {/* Post Actions Skeleton */}
          <div className="px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}
