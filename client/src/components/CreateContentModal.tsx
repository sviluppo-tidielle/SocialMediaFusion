import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Image, Film, CircleUser, Paperclip, MapPin, Tag } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CreateContentModalProps {
  userId: number;
  onClose: () => void;
}

type ContentType = 'post' | 'story' | 'video';

export default function CreateContentModal({ userId, onClose }: CreateContentModalProps) {
  const [contentType, setContentType] = useState<ContentType>('post');
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/posts', {
        userId,
        caption,
        mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80',
        mediaType: 'image'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Post created!',
        description: 'Your post has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/feed/posts'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Failed to create post',
        description: String(error),
        variant: 'destructive',
      });
    }
  });
  
  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async () => {
      // Set expiry to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      return await apiRequest('POST', '/api/stories', {
        userId,
        mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=1200&q=80',
        mediaType: 'image',
        expiresAt
      });
    },
    onSuccess: () => {
      toast({
        title: 'Story created!',
        description: 'Your story has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/feed/stories'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Failed to create story',
        description: String(error),
        variant: 'destructive',
      });
    }
  });
  
  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/videos', {
        userId,
        caption,
        videoUrl: mediaUrl || 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Video created!',
        description: 'Your video has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/feed/videos'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Failed to create video',
        description: String(error),
        variant: 'destructive',
      });
    }
  });
  
  const handleUploadMedia = () => {
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      // In a real app, this would upload the file and get a URL back
      if (contentType === 'post') {
        setMediaUrl('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80');
      } else if (contentType === 'story') {
        setMediaUrl('https://images.unsplash.com/photo-1587614382346-4ec70e388b28?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=1200&q=80');
      } else {
        setMediaUrl('https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4');
      }
      setIsUploading(false);
    }, 1000);
  };
  
  const handleSubmit = () => {
    if (contentType === 'post') {
      createPostMutation.mutate();
    } else if (contentType === 'story') {
      createStoryMutation.mutate();
    } else if (contentType === 'video') {
      createVideoMutation.mutate();
    }
  };
  
  const isPending = createPostMutation.isPending || createStoryMutation.isPending || createVideoMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="border-b border-slate-200 p-4 flex items-center justify-between">
          <button className="text-slate-500" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Crea nuovo contenuto</h2>
          <Button 
            variant="ghost" 
            className="text-primary font-semibold"
            onClick={handleSubmit}
            disabled={isPending || isUploading}
          >
            {isPending ? 'Saving...' : 'Avanti'}
          </Button>
        </div>
        
        {/* Content Type Selection */}
        <Tabs defaultValue="post" className="w-full" onValueChange={(value) => setContentType(value as ContentType)}>
          <div className="px-4 pt-4 pb-2">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="post" className="py-2">
                <div className="flex flex-col items-center">
                  <Image className="h-5 w-5 mb-1 text-blue-500" />
                  <span className="text-xs">Post</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="story" className="py-2">
                <div className="flex flex-col items-center">
                  <CircleUser className="h-5 w-5 mb-1 text-primary" />
                  <span className="text-xs">Storia</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="video" className="py-2">
                <div className="flex flex-col items-center">
                  <Film className="h-5 w-5 mb-1 text-cyan-500" />
                  <span className="text-xs">Video</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="post" className="mt-0">
            {renderContentTab('post')}
          </TabsContent>
          
          <TabsContent value="story" className="mt-0">
            {renderContentTab('story')}
          </TabsContent>
          
          <TabsContent value="video" className="mt-0">
            {renderContentTab('video')}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
  
  function renderContentTab(type: ContentType) {
    return (
      <div className="flex flex-col">
        {/* Upload Area */}
        <div 
          className={`p-4 flex flex-col items-center justify-center h-52 bg-slate-50 ${mediaUrl ? 'relative' : ''}`}
          onClick={mediaUrl ? undefined : handleUploadMedia}
        >
          {mediaUrl ? (
            <>
              {type === 'video' ? (
                <video 
                  src={mediaUrl} 
                  className="w-full h-full object-cover" 
                  controls
                />
              ) : (
                <img 
                  src={mediaUrl} 
                  alt="Uploaded media" 
                  className="w-full h-full object-cover" 
                />
              )}
              <button 
                className="absolute top-3 right-3 bg-slate-800/70 text-white rounded-full p-1"
                onClick={() => setMediaUrl('')}
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Paperclip className="h-10 w-10 text-slate-400 mb-3" />
              <p className="text-center mb-4 text-sm text-slate-500">
                {isUploading ? 'Uploading...' : 'Carica foto o video'}
              </p>
              <Button 
                className="bg-primary hover:bg-primary/90" 
                onClick={handleUploadMedia}
                disabled={isUploading}
              >
                Seleziona dal dispositivo
              </Button>
            </>
          )}
        </div>
        
        {/* Caption input - only for post and video */}
        {type !== 'story' && (
          <div className="p-4">
            <Textarea 
              placeholder="Scrivi una didascalia..." 
              className="w-full border border-slate-200 rounded-md p-3 h-24 resize-none"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            
            <div className="flex justify-between items-center mt-4">
              <button className="text-slate-600 flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                Aggiungi luogo
              </button>
              <button className="text-slate-600 flex items-center text-sm">
                <Tag className="h-4 w-4 mr-1" />
                Tagga persone
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
