import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { VideoWithUser } from '@shared/schema';
import { useTab } from '@/hooks/use-tab';
import { Heart, MessageCircle, Share2, Pause, Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ReactPlayer from 'react-player';

// Mock current user id until auth is implemented
const CURRENT_USER_ID = 1;

export default function Videos() {
  const { setActiveTab } = useTab();
  const queryClient = useQueryClient();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  // Set the active tab when this component mounts
  useEffect(() => {
    setActiveTab('videos');
  }, [setActiveTab]);
  
  // Fetch videos for feed
  const { data: videos, isLoading, error } = useQuery<VideoWithUser[]>({
    queryKey: [`/api/feed/videos?userId=${CURRENT_USER_ID}`],
  });
  
  // Like/unlike video mutations
  const likeMutation = useMutation({
    mutationFn: async ({ videoId, isLiked }: { videoId: number, isLiked: boolean }) => {
      const endpoint = isLiked ? `/api/videos/${videoId}/unlike` : `/api/videos/${videoId}/like`;
      return await apiRequest('POST', endpoint, { userId: CURRENT_USER_ID });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/feed/videos?userId=${CURRENT_USER_ID}`] });
    }
  });
  
  // Set up intersection observer to detect active video
  useEffect(() => {
    if (!videoContainerRef.current || !videos || videos.length === 0) return;
    
    const options = {
      root: videoContainerRef.current,
      rootMargin: '0px',
      threshold: 0.8,
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          setActiveVideoIndex(index);
          setIsPlaying(true);
        }
      });
    }, options);
    
    const videoItems = document.querySelectorAll('.video-item');
    videoItems.forEach((item) => {
      observer.observe(item);
    });
    
    return () => {
      videoItems.forEach((item) => {
        observer.unobserve(item);
      });
    };
  }, [videos]);
  
  const handleLikeVideo = (videoId: number, isLiked: boolean) => {
    likeMutation.mutate({ videoId, isLiked });
  };
  
  const handleCommentVideo = (videoId: number) => {
    // Implement comment functionality
    console.log('Comment on video', videoId);
  };
  
  const handleShareVideo = (videoId: number) => {
    // Implement share functionality
    console.log('Share video', videoId);
  };
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  if (isLoading) {
    return <VideoFeedSkeleton />;
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading videos. Please try again.</p>
      </div>
    );
  }
  
  // If no videos, show sample videos
  const displayVideos = videos && videos.length > 0 ? videos : [
    {
      id: 1,
      userId: 5,
      caption: 'Nuova coreografia! 💃 #dance #viral',
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=1200&q=80',
      createdAt: new Date(),
      likeCount: 145000,
      commentCount: 2300,
      shareCount: 500,
      user: {
        id: 5,
        username: 'lucia.dance',
        fullName: 'Lucia Bianchi',
        email: 'lucia@example.com',
        profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80',
        followerCount: 250000,
        followingCount: 150,
        postCount: 45
      },
      isLiked: false
    },
    {
      id: 2,
      userId: 2,
      caption: 'Ricetta veloce per la pasta 🍝 #food #cooking',
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=1200&q=80',
      createdAt: new Date(),
      likeCount: 87000,
      commentCount: 1100,
      shareCount: 300,
      user: {
        id: 2,
        username: 'marco.chef',
        fullName: 'Marco Rossi',
        email: 'marco@example.com',
        profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80',
        followerCount: 120000,
        followingCount: 200,
        postCount: 32
      },
      isLiked: false
    }
  ];

  return (
    <div 
      ref={videoContainerRef}
      className="video-container h-[calc(100vh-12rem)] overflow-y-scroll snap-y snap-mandatory"
      id="videosContent"
    >
      {displayVideos.map((video, index) => (
        <VideoItem 
          key={video.id} 
          video={video} 
          index={index}
          isActive={index === activeVideoIndex}
          isPlaying={isPlaying && index === activeVideoIndex}
          onPlayPause={togglePlayPause}
          onLike={handleLikeVideo}
          onComment={handleCommentVideo}
          onShare={handleShareVideo}
        />
      ))}
    </div>
  );
}

interface VideoItemProps {
  video: VideoWithUser;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  onLike: (videoId: number, isLiked: boolean) => void;
  onComment: (videoId: number) => void;
  onShare: (videoId: number) => void;
}

function VideoItem({ video, index, isActive, isPlaying, onPlayPause, onLike, onComment, onShare }: VideoItemProps) {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };
  
  return (
    <div 
      className="video-item snap-start w-full h-[calc(100vh-12rem)] relative bg-black flex items-center justify-center"
      data-index={index}
    >
      {/* Video Player */}
      <div className="absolute inset-0 bg-black">
        <ReactPlayer
          url={video.videoUrl}
          width="100%"
          height="100%"
          playing={isPlaying}
          loop
          muted
          playsinline
          onClick={onPlayPause}
          style={{ objectFit: 'cover' }}
          fallback={
            <img 
              src={video.thumbnailUrl} 
              alt="Video thumbnail" 
              className="w-full h-full object-cover"
            />
          }
        />
      </div>
      
      {/* Video Controls Overlay */}
      <div className="absolute inset-0 flex flex-col" onClick={onPlayPause}>
        {/* Top info */}
        <div className="flex-1"></div>
        
        {/* Bottom controls */}
        <div className="p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-start mb-4">
            <div className="flex-1">
              <p className="text-white font-medium">@{video.user.username}</p>
              <p className="text-white text-sm">{video.caption}</p>
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
            <button 
              className="text-white flex flex-col items-center" 
              onClick={(e) => {
                e.stopPropagation();
                onLike(video.id, video.isLiked || false);
              }}
              aria-label={video.isLiked ? "Unlike video" : "Like video"}
            >
              <Heart className={`h-7 w-7 ${video.isLiked ? 'fill-white' : ''}`} />
              <span className="text-xs mt-1">{formatCount(video.likeCount)}</span>
            </button>
            <button 
              className="text-white flex flex-col items-center" 
              onClick={(e) => {
                e.stopPropagation();
                onComment(video.id);
              }}
              aria-label="Comment on video"
            >
              <MessageCircle className="h-7 w-7" />
              <span className="text-xs mt-1">{formatCount(video.commentCount)}</span>
            </button>
            <button 
              className="text-white flex flex-col items-center" 
              onClick={(e) => {
                e.stopPropagation();
                onShare(video.id);
              }}
              aria-label="Share video"
            >
              <Share2 className="h-7 w-7" />
              <span className="text-xs mt-1">Share</span>
            </button>
          </div>

          {/* User profile */}
          <div className="absolute right-4 bottom-4">
            <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
              <img 
                src={video.user.profilePicture || `https://ui-avatars.com/api/?name=${video.user.username}`} 
                alt="Creator avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Play/Pause button overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-16 h-16 bg-white bg-opacity-25 rounded-full flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
          {isPlaying ? (
            <Pause className="h-8 w-8 text-white" />
          ) : (
            <Play className="h-8 w-8 text-white" />
          )}
        </div>
      </div>
    </div>
  );
}

function VideoFeedSkeleton() {
  return (
    <div className="h-[calc(100vh-12rem)] overflow-hidden">
      <div className="w-full h-full relative bg-black">
        <Skeleton className="w-full h-full" />
        
        {/* Bottom controls skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-start mb-4">
            <div className="flex-1">
              <Skeleton className="h-5 w-32 bg-white/20 mb-2" />
              <Skeleton className="h-4 w-48 bg-white/20" />
            </div>
          </div>
          
          {/* Right side actions skeleton */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
            <Skeleton className="h-14 w-10 bg-white/20" />
            <Skeleton className="h-14 w-10 bg-white/20" />
            <Skeleton className="h-14 w-10 bg-white/20" />
          </div>

          {/* User profile skeleton */}
          <div className="absolute right-4 bottom-4">
            <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
