import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { UserWithProfile } from '@shared/schema';
import { useTab } from '@/hooks/use-tab';
import { Heart, Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Mock current user id until auth is implemented
const CURRENT_USER_ID = 1;

export default function Discover() {
  const { setActiveTab } = useTab();
  const queryClient = useQueryClient();
  
  // Set the active tab when this component mounts
  useEffect(() => {
    setActiveTab('discover');
  }, [setActiveTab]);
  
  // Fetch suggested users
  const { data: suggestedUsers, isLoading: isLoadingSuggested } = useQuery<UserWithProfile[]>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/suggested`],
  });
  
  // Follow/unfollow user mutation
  const followMutation = useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: number, isFollowing: boolean }) => {
      const endpoint = isFollowing ? `/api/users/${userId}/unfollow` : `/api/users/${userId}/follow`;
      return await apiRequest('POST', endpoint, { followerId: CURRENT_USER_ID });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${CURRENT_USER_ID}/suggested`] });
    }
  });
  
  const handleFollowUser = (userId: number, isFollowing: boolean) => {
    followMutation.mutate({ userId, isFollowing });
  };
  
  const handleViewMoreUsers = () => {
    // Implement view more users
    console.log('View more users');
  };
  
  const handleOpenTrendingContent = (contentId: number, contentType: string) => {
    // Implement open trending content
    console.log('Open trending content', contentId, contentType);
  };
  
  const handleViewMoreTrending = () => {
    // Implement view more trending content
    console.log('View more trending');
  };
  
  // Sample trending content - in a real app, this would come from an API
  const trendingContent = [
    { id: 1, type: 'post', imageUrl: 'https://images.unsplash.com/photo-1536697246787-1f7ae568d89a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', likes: 5200 },
    { id: 2, type: 'video', imageUrl: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', views: 18000 },
    { id: 3, type: 'post', imageUrl: 'https://images.unsplash.com/photo-1534803045430-a2aae162490b?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', likes: 3700 },
    { id: 4, type: 'post', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', likes: 8400 },
    { id: 5, type: 'video', imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', views: 12000 },
    { id: 6, type: 'post', imageUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80', likes: 6900 },
  ];

  return (
    <div className="p-4 overflow-y-auto" id="discoverContent">
      <h2 className="text-lg font-semibold mb-4">Persone che potresti conoscere</h2>
      
      <div className="suggested-users mb-6">
        {isLoadingSuggested ? (
          <SuggestedUsersSkeleton />
        ) : (
          <>
            {suggestedUsers && suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                    <img 
                      src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}`} 
                      alt={`${user.username}'s avatar`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{user.fullName}</h3>
                    <p className="text-sm text-slate-500">
                      {user.followerCount} {user.followerCount === 1 ? 'follower' : 'followers'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={user.isFollowing ? "outline" : "default"}
                  className={user.isFollowing ? "border-slate-200" : "bg-blue-600 hover:bg-blue-700"}
                  size="sm"
                  onClick={() => handleFollowUser(user.id, user.isFollowing || false)}
                >
                  {user.isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              </div>
            ))}
            
            {/* If no suggested users, show sample */}
            {(!suggestedUsers || suggestedUsers.length === 0) && (
              <>
                <SuggestedUserItem 
                  name="Giacomo Verdi"
                  imageUrl="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80"
                  subtitle="4 amici in comune"
                  onFollow={() => console.log('Follow user')}
                />
                <SuggestedUserItem 
                  name="Elena Ferrari"
                  imageUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80"
                  subtitle="7 amici in comune"
                  onFollow={() => console.log('Follow user')}
                />
                <SuggestedUserItem 
                  name="Luca Romano"
                  imageUrl="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80"
                  subtitle="2 amici in comune"
                  onFollow={() => console.log('Follow user')}
                />
              </>
            )}
          </>
        )}
        
        <button 
          className="text-blue-600 font-medium text-center w-full py-2"
          onClick={handleViewMoreUsers}
        >
          View All
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-4">Discover Trending Content</h2>
      
      <div className="trending-content grid grid-cols-3 gap-1">
        {trendingContent.map((content) => (
          <div 
            key={content.id}
            className="aspect-square bg-slate-100 relative overflow-hidden cursor-pointer" 
            onClick={() => handleOpenTrendingContent(content.id, content.type)}
          >
            <img 
              src={content.imageUrl} 
              alt="Trending content" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 rounded p-1">
              {content.type === 'video' ? (
                <>
                  <Play className="h-3 w-3 text-white inline-block mr-1" />
                  <span className="text-white text-xs">
                    {formatCount(content.views || 0)}
                  </span>
                </>
              ) : (
                <>
                  <Heart className="h-3 w-3 text-white inline-block mr-1" />
                  <span className="text-white text-xs">
                    {formatCount(content.likes || 0)}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className="text-blue-600 font-medium text-center w-full py-4 mt-2"
        onClick={handleViewMoreTrending}
      >
        See More Content
      </button>
    </div>
  );
}

interface SuggestedUserItemProps {
  name: string;
  imageUrl: string;
  subtitle: string;
  onFollow: () => void;
}

function SuggestedUserItem({ name, imageUrl, subtitle, onFollow }: SuggestedUserItemProps) {
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
          <img 
            src={imageUrl} 
            alt={`${name}'s avatar`} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <Button 
        className="bg-blue-600 hover:bg-blue-700"
        size="sm"
        onClick={onFollow}
      >
        Follow
      </Button>
    </div>
  );
}

function SuggestedUsersSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div className="flex items-center">
            <Skeleton className="w-12 h-12 rounded-full mr-3" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      ))}
    </>
  );
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}
