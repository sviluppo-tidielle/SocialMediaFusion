import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { StoryWithUser } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface StoriesCarouselProps {
  currentUserId: number;
  onStoryClick: (story: { id: number; userId: number; username: string }) => void;
}

export default function StoriesCarousel({ currentUserId, onStoryClick }: StoriesCarouselProps) {
  const { data: stories, isLoading } = useQuery<StoryWithUser[]>({
    queryKey: [`/api/feed/stories?userId=${currentUserId}`],
  });

  const handleCreateStory = () => {
    // This will be implemented in the CreateContentModal component
    console.log('Create story');
  };

  const handleViewStory = (story: StoryWithUser) => {
    onStoryClick({
      id: story.id,
      userId: story.userId,
      username: story.user.username,
    });
  };

  if (isLoading) {
    return <StoriesCarouselSkeleton />;
  }

  return (
    <div className="stories-container px-2 py-3 overflow-x-auto flex items-center bg-white border-b border-gray-200">
      {/* Current user story creation */}
      <div className="flex flex-col items-center mr-3 w-16" onClick={handleCreateStory}>
        <div className="relative w-14 h-14 mb-1">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80"
              alt="Your avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <Plus className="h-3 w-3 text-white" />
          </div>
        </div>
        <span className="text-xs text-slate-600">Your Story</span>
      </div>

      {/* Other user stories */}
      {stories && stories.map((story) => (
        <div 
          key={story.id} 
          className="flex flex-col items-center mr-3 w-16 cursor-pointer" 
          onClick={() => handleViewStory(story)}
        >
          <div 
            className={`w-14 h-14 rounded-full overflow-hidden mb-1 ${story.isViewed ? 'border-2 border-gray-200' : 'story-avatar'}`}
            style={{
              borderImage: story.isViewed ? 'none' : 'linear-gradient(45deg, #FF3366, #33CCFF) 1',
              borderStyle: 'solid',
              borderWidth: '2px'
            }}
          >
            <img 
              src={story.user.profilePicture || `https://ui-avatars.com/api/?name=${story.user.username}`} 
              alt={`${story.user.username}'s avatar`} 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xs text-slate-600 truncate w-full text-center">
            {story.user.username.split(' ')[0]}
          </span>
        </div>
      ))}

      {/* If no stories yet, show sample stories */}
      {(!stories || stories.length === 0) && (
        <>
          <StoryItem 
            username="Sofia" 
            imageUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80"
            viewed={false}
            onClick={() => console.log('View story')}
          />
          <StoryItem 
            username="Marco" 
            imageUrl="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80"
            viewed={false}
            onClick={() => console.log('View story')}
          />
          <StoryItem 
            username="Laura" 
            imageUrl="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80"
            viewed={true}
            onClick={() => console.log('View story')}
          />
          <StoryItem 
            username="Antonio" 
            imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80"
            viewed={false}
            onClick={() => console.log('View story')}
          />
          <StoryItem 
            username="Chiara" 
            imageUrl="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80"
            viewed={false}
            onClick={() => console.log('View story')}
          />
        </>
      )}
    </div>
  );
}

interface StoryItemProps {
  username: string;
  imageUrl: string;
  viewed: boolean;
  onClick: () => void;
}

function StoryItem({ username, imageUrl, viewed, onClick }: StoryItemProps) {
  return (
    <div className="flex flex-col items-center mr-3 w-16 cursor-pointer" onClick={onClick}>
      <div 
        className={`w-14 h-14 rounded-full overflow-hidden mb-1 ${viewed ? 'border-2 border-gray-200' : 'story-avatar'}`}
        style={{
          borderImage: viewed ? 'none' : 'linear-gradient(45deg, #FF3366, #33CCFF) 1',
          borderStyle: 'solid',
          borderWidth: '2px'
        }}
      >
        <img src={imageUrl} alt={`${username}'s avatar`} className="w-full h-full object-cover" />
      </div>
      <span className="text-xs text-slate-600 truncate w-full text-center">{username}</span>
    </div>
  );
}

function StoriesCarouselSkeleton() {
  return (
    <div className="stories-container px-2 py-3 overflow-x-auto flex items-center bg-white border-b border-gray-200">
      {/* Current user skeleton */}
      <div className="flex flex-col items-center mr-3 w-16">
        <Skeleton className="w-14 h-14 rounded-full mb-1" />
        <Skeleton className="h-3 w-12" />
      </div>
      
      {/* Other user skeletons */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-col items-center mr-3 w-16">
          <Skeleton className="w-14 h-14 rounded-full mb-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
