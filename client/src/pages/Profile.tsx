import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User, Post, Video } from '@shared/schema';
import { useTab } from '@/hooks/use-tab';
import { Grid, Play, Bookmark, UserSquare, Link, PenSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// Mock current user id until auth is implemented
const CURRENT_USER_ID = 1;

export default function Profile() {
  const { setActiveTab } = useTab();
  const queryClient = useQueryClient();
  const [activeProfileTab, setActiveProfileTab] = useState('posts');
  
  // Set the active tab when this component mounts
  useEffect(() => {
    setActiveTab('profile');
  }, [setActiveTab]);
  
  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery<Omit<User, 'password'>>({
    queryKey: [`/api/users/${CURRENT_USER_ID}`],
  });
  
  // Fetch user posts
  const { data: posts, isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/posts`],
  });
  
  // Fetch user videos
  const { data: videos, isLoading: isLoadingVideos } = useQuery<Video[]>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/videos`],
  });
  
  const handleEditProfile = () => {
    // Implement edit profile functionality
    console.log('Edit profile');
  };
  
  const handleOpenPost = (postId: number) => {
    // Implement open post functionality
    console.log('Open post', postId);
  };
  
  // Sample user posts for when the API isn't returning data
  const sampleUserPosts = [
    { id: 1, mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', mediaType: 'image' },
    { id: 2, mediaUrl: 'https://images.unsplash.com/photo-1530653333484-8dbe28571a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', mediaType: 'image' },
    { id: 3, mediaUrl: 'https://images.unsplash.com/photo-1560438718-eb61ede255eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', mediaType: 'video' },
    { id: 4, mediaUrl: 'https://images.unsplash.com/photo-1526080652727-5b77f74eacd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', mediaType: 'image' },
    { id: 5, mediaUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', mediaType: 'image' },
    { id: 6, mediaUrl: 'https://images.unsplash.com/photo-1518600570419-890caca7f342?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', mediaType: 'image' },
    { id: 7, mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', mediaType: 'video' },
    { id: 8, mediaUrl: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', mediaType: 'image' },
    { id: 9, mediaUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', mediaType: 'image' },
  ];
  
  const displayPosts = posts && posts.length > 0 ? posts : sampleUserPosts;

  return (
    <div className="user-profile overflow-y-auto" id="profileContent">
      {/* Profile Header */}
      <div className="p-4 border-b border-slate-200">
        {isLoadingUser ? (
          <ProfileHeaderSkeleton />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
                <img 
                  src={user?.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=160&h=160&q=80"} 
                  alt="Your profile picture" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 ml-4">
                <div className="flex justify-around">
                  <div className="text-center">
                    <p className="font-semibold">{user?.postCount || 0}</p>
                    <p className="text-sm text-slate-500">Post</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{user?.followerCount || 0}</p>
                    <p className="text-sm text-slate-500">Follower</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{user?.followingCount || 0}</p>
                    <p className="text-sm text-slate-500">Seguiti</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h2 className="font-semibold text-lg">{user?.fullName || 'Loading...'}</h2>
              <p className="text-sm text-slate-500 mb-2">{user?.bio || ''}</p>
              {user?.website && (
                <p className="text-sm font-medium text-blue-600 flex items-center">
                  <Link className="h-4 w-4 mr-1" />
                  {user.website}
                </p>
              )}
            </div>
            
            <Button 
              variant="outline"
              className="w-full border-slate-200"
              onClick={handleEditProfile}
            >
              <PenSquare className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </>
        )}
      </div>
      
      {/* Profile Tabs */}
      <Tabs defaultValue="posts" onValueChange={setActiveProfileTab}>
        <TabsList className="w-full rounded-none border-b border-slate-200">
          <TabsTrigger value="posts" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <Grid className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <Play className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <Bookmark className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger value="tagged" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <UserSquare className="h-5 w-5" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-0">
          {isLoadingPosts ? (
            <ProfileGridSkeleton />
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {displayPosts.map((post) => (
                <div 
                  key={post.id}
                  className="aspect-square bg-slate-100 relative cursor-pointer" 
                  onClick={() => handleOpenPost(post.id)}
                >
                  <img 
                    src={post.mediaUrl} 
                    alt="Post" 
                    className="w-full h-full object-cover"
                  />
                  {post.mediaType === 'video' && (
                    <div className="absolute top-2 right-2">
                      <Play className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="videos" className="mt-0">
          {isLoadingVideos ? (
            <ProfileGridSkeleton />
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {videos && videos.length > 0 ? (
                videos.map((video) => (
                  <div 
                    key={video.id}
                    className="aspect-square bg-slate-100 relative cursor-pointer" 
                    onClick={() => handleOpenPost(video.id)}
                  >
                    <img 
                      src={video.thumbnailUrl || video.videoUrl} 
                      alt="Video" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Play className="h-5 w-5 text-white" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-8 text-center">
                  <p className="text-slate-500">No videos yet</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="saved" className="mt-0">
          <div className="p-8 text-center">
            <p className="text-slate-500">No saved posts yet</p>
          </div>
        </TabsContent>
        
        <TabsContent value="tagged" className="mt-0">
          <div className="p-8 text-center">
            <p className="text-slate-500">No tagged posts yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        
        <div className="flex-1 ml-4">
          <div className="flex justify-around">
            <div className="text-center">
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
              <Skeleton className="h-4 w-10 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
              <Skeleton className="h-4 w-10 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
              <Skeleton className="h-4 w-10 mx-auto" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      
      <Skeleton className="h-10 w-full" />
    </>
  );
}

function ProfileGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <Skeleton key={i} className="aspect-square" />
      ))}
    </div>
  );
}
