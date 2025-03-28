import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Image, X, Camera, Video, Mic } from 'lucide-react';
import MediaCapture, { MediaFile } from './MediaCapture';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  caption: string;
}

const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const [media, setMedia] = useState<MediaFile | null>(null);
  const [showMediaCapture, setShowMediaCapture] = useState(false);
  const [captureType, setCaptureType] = useState<Array<'photo' | 'video' | 'audio' | 'gallery'>>(['photo', 'video', 'audio', 'gallery']);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      caption: '',
    },
  });
  
  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async (formData: FormData & { caption?: string }) => {
      const response = await fetch('/api/uploads/post', {
        method: 'POST',
        body: formData as unknown as BodyInit,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante il caricamento del media');
      }
      
      return await response.json();
    }
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: { caption: string, mediaUrl: string, mediaType: string }) => {
      const response = await apiRequest('POST', '/api/posts', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Post creato!',
        description: 'Il tuo post è stato pubblicato con successo.',
      });
      
      // Reset form and close modal
      reset();
      setMedia(null);
      onClose();
      
      // Invalidate queries to refresh feed
      queryClient.invalidateQueries({ queryKey: ['/api/feed/posts'] });
    },
    onError: (error) => {
      toast({
        title: 'Errore durante la creazione del post',
        description: String(error),
        variant: 'destructive',
      });
    }
  });
  
  const onSubmit = async (data: { caption: string }) => {
    if (!media) {
      toast({
        title: 'Media richiesto',
        description: "Seleziona un'immagine, video o audio per creare un post.",
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // First upload the media
      const formData = new FormData();
      formData.append('file', media.file);
      
      // Il FormData non ha un campo caption ma lo estendiamo per TypeScript
      const formDataWithCaption = formData as FormData & { caption?: string };
      
      const uploadResult = await uploadMediaMutation.mutateAsync(formDataWithCaption);
      
      // Then create the post with the media URL
      await createPostMutation.mutateAsync({
        caption: data.caption,
        mediaUrl: uploadResult.fileUrl,
        mediaType: uploadResult.mediaType
      });
    } catch (error) {
      console.error('Errore durante il processo di creazione del post:', error);
    }
  };
  
  const handleMediaCapture = (capturedMedia: MediaFile) => {
    setMedia(capturedMedia);
    setShowMediaCapture(false);
  };
  
  const removeMedia = () => {
    setMedia(null);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crea un nuovo post</DialogTitle>
            <DialogDescription>
              Condividi un'immagine, un video o un audio con la tua rete
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!media ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 p-2 border-blue-400 hover:bg-blue-50"
                  onClick={() => {
                    setCaptureType(['photo', 'gallery']);
                    setShowMediaCapture(true);
                  }}
                >
                  <Camera className="h-8 w-8 mb-2 text-blue-500" />
                  <span className="text-xs">Foto</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 p-2 border-red-400 hover:bg-red-50"
                  onClick={() => {
                    setCaptureType(['video', 'gallery']);
                    setShowMediaCapture(true);
                  }}
                >
                  <Video className="h-8 w-8 mb-2 text-red-500" />
                  <span className="text-xs">Video</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 p-2 border-purple-400 hover:bg-purple-50"
                  onClick={() => {
                    setCaptureType(['gallery']);
                    setShowMediaCapture(true);
                  }}
                >
                  <Image className="h-8 w-8 mb-2 text-purple-500" />
                  <span className="text-xs">Galleria</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 p-2 border-green-400 hover:bg-green-50"
                  onClick={() => {
                    setCaptureType(['audio']);
                    setShowMediaCapture(true);
                  }}
                >
                  <Mic className="h-8 w-8 mb-2 text-green-500" />
                  <span className="text-xs">Audio</span>
                </Button>
              </div>
            ) : (
              <div className="relative">
                {media.file.type.startsWith('image/') ? (
                  <img 
                    src={media.preview} 
                    alt="Preview" 
                    className="w-full h-64 object-contain bg-slate-100 rounded-md"
                  />
                ) : media.file.type.startsWith('video/') ? (
                  <video 
                    src={media.preview} 
                    controls 
                    className="w-full h-64 bg-slate-100 rounded-md"
                  />
                ) : (
                  <div className="w-full h-32 bg-slate-100 rounded-md flex items-center justify-center">
                    <Mic className="h-12 w-12 text-slate-400" />
                    <audio src={media.preview} controls className="mt-2" />
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={removeMedia}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <Textarea
              placeholder="Scrivi una didascalia..."
              className="resize-none h-24"
              {...register('caption')}
            />
            
            <DialogFooter className="flex justify-between">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Annulla
                </Button>
              </DialogClose>
              
              <Button 
                type="submit" 
                disabled={isSubmitting || uploadMediaMutation.isPending || createPostMutation.isPending || !media}
              >
                {(isSubmitting || uploadMediaMutation.isPending || createPostMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Pubblicando...
                  </>
                ) : (
                  'Pubblica'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {showMediaCapture && (
        <MediaCapture
          onCapture={handleMediaCapture}
          onClose={() => setShowMediaCapture(false)}
          allowedTypes={captureType}
        />
      )}
    </>
  );
};

export default CreatePostModal;