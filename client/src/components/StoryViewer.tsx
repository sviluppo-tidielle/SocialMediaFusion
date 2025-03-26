import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Story } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';

interface StoryViewerProps {
  storyId: number;
  userId: number;
  username: string;
  onClose: () => void;
}

export default function StoryViewer({ storyId, userId, username, onClose }: StoryViewerProps) {
  const [progressValue, setProgressValue] = useState(0);
  const [storyReply, setStoryReply] = useState('');
  const progressInterval = useRef<number | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch story data
  const { data: story, isLoading } = useQuery<Story>({
    queryKey: [`/api/stories/${storyId}`],
  });
  
  // Mark story as viewed
  const viewStoryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/stories/${storyId}/view`, { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed/stories'] });
    }
  });
  
  // Start the progress bar when story is loaded
  useEffect(() => {
    if (story && !isLoading) {
      // Mark the story as viewed
      viewStoryMutation.mutate();
      
      // Start progress bar
      progressInterval.current = window.setInterval(() => {
        setProgressValue((prev) => {
          const newValue = prev + 0.5;
          if (newValue >= 100) {
            clearInterval(progressInterval.current!);
            // Close the story viewer after completion
            setTimeout(() => onClose(), 300);
            return 100;
          }
          return newValue;
        });
      }, 50); // 10 seconds total duration (50ms * 200 steps)
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [story, isLoading, onClose, viewStoryMutation]);
  
  const handleSendReply = () => {
    if (storyReply.trim()) {
      // Implement send reply functionality
      console.log('Sending reply:', storyReply);
      setStoryReply('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendReply();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-30 flex flex-col">
      {/* Story Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        {/* Progress bar */}
        <div className="h-1 bg-white bg-opacity-30 mb-3 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progressValue}%` }}
          ></div>
        </div>
        
        {/* User info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80" 
                  alt={`${username}'s avatar`} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{username}</p>
              <p className="text-white text-xs opacity-80">
                {isLoading ? (
                  <Skeleton className="h-3 w-10 bg-white/20" />
                ) : (
                  new Date(story!.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                )}
              </p>
            </div>
          </div>
          
          <button className="text-white" onClick={onClose} aria-label="Close story">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Story Content */}
      <div className="h-full flex items-center justify-center">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <img 
            src={story?.mediaUrl || "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=1200&q=80"} 
            alt="Story content" 
            className="object-contain h-full"
          />
        )}
      </div>
      
      {/* Story Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent z-10">
        <div className="flex items-center">
          <Input
            type="text"
            placeholder={`Rispondi a ${username}...`}
            value={storyReply}
            onChange={(e) => setStoryReply(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-white/20 text-white placeholder:text-white/80 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button 
            className="text-white ml-2"
            onClick={handleSendReply}
            disabled={!storyReply.trim()}
            aria-label="Send reply"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
