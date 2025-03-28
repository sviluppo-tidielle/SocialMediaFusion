import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, Image, X, Camera, Video, Mic, 
  Upload, Music, Smile, MapPin, Tag, Sparkles 
} from 'lucide-react';
import MediaCaptureModern, { MediaFile } from './MediaCaptureModern';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
              <Tabs defaultValue="photo" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="photo" className="flex flex-col py-3">
                    <Camera className="h-5 w-5 mb-1" />
                    <span className="text-xs">Foto</span>
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex flex-col py-3">
                    <Video className="h-5 w-5 mb-1" />
                    <span className="text-xs">Video</span>
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="flex flex-col py-3">
                    <Image className="h-5 w-5 mb-1" />
                    <span className="text-xs">Galleria</span>
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="flex flex-col py-3">
                    <Music className="h-5 w-5 mb-1" />
                    <span className="text-xs">Audio</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="photo" className="mt-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg text-center shadow-sm border border-blue-200">
                    <div className="bg-white rounded-full p-4 inline-flex mb-4 shadow-md">
                      <Camera className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Scatta una foto</h3>
                    <p className="text-sm text-slate-600 mb-4">Immortala un momento da condividere con i tuoi amici</p>
                    <Button
                      type="button"
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={() => {
                        setCaptureType(['photo', 'gallery']);
                        setShowMediaCapture(true);
                      }}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Apri fotocamera
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="video" className="mt-4">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-8 rounded-lg text-center shadow-sm border border-red-200">
                    <div className="bg-white rounded-full p-4 inline-flex mb-4 shadow-md">
                      <Video className="h-10 w-10 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Registra un video</h3>
                    <p className="text-sm text-slate-600 mb-4">Cattura e condividi momenti in movimento</p>
                    <Button
                      type="button"
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => {
                        setCaptureType(['video', 'gallery']);
                        setShowMediaCapture(true);
                      }}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Registra video
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="gallery" className="mt-4">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-8 rounded-lg text-center shadow-sm border border-purple-200">
                    <div className="bg-white rounded-full p-4 inline-flex mb-4 shadow-md">
                      <Image className="h-10 w-10 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Scegli dalla galleria</h3>
                    <p className="text-sm text-slate-600 mb-4">Seleziona foto o video già presenti sul tuo dispositivo</p>
                    <Button
                      type="button"
                      className="bg-purple-500 hover:bg-purple-600"
                      onClick={() => {
                        setCaptureType(['gallery']);
                        setShowMediaCapture(true);
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Apri galleria
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="audio" className="mt-4">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-8 rounded-lg text-center shadow-sm border border-green-200">
                    <div className="bg-white rounded-full p-4 inline-flex mb-4 shadow-md">
                      <Mic className="h-10 w-10 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Registra audio</h3>
                    <p className="text-sm text-slate-600 mb-4">Condividi pensieri, musica o registrazioni audio</p>
                    <Button
                      type="button"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => {
                        setCaptureType(['audio']);
                        setShowMediaCapture(true);
                      }}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Registra audio
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-b from-slate-50 to-slate-100 p-4 rounded-lg shadow-sm">
                  <div className="relative">
                    {media.file.type.startsWith('image/') ? (
                      <img 
                        src={media.preview} 
                        alt="Preview" 
                        className="w-full h-64 object-contain rounded-md"
                      />
                    ) : media.file.type.startsWith('video/') ? (
                      <video 
                        src={media.preview} 
                        controls 
                        className="w-full h-64 rounded-md"
                      />
                    ) : (
                      <div className="w-full h-32 bg-slate-100 rounded-md flex flex-col items-center justify-center p-4">
                        <Mic className="h-12 w-12 text-green-500 mb-2" />
                        <audio src={media.preview} controls className="w-full" />
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 rounded-full shadow-lg"
                      onClick={removeMedia}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center mb-2">
                    <Smile className="h-5 w-5 text-amber-500 mr-2" />
                    <h3 className="text-sm font-medium">Aggiungi didascalia</h3>
                  </div>
                  <Textarea
                    placeholder="Scrivi qualcosa sul tuo post..."
                    className="resize-none h-20 border-slate-200 focus:border-blue-300"
                    {...register('caption')}
                  />
                  <div className="flex mt-2 text-xs text-slate-500 space-x-3">
                    <button type="button" className="flex items-center">
                      <Smile className="h-4 w-4 mr-1 text-amber-400" />
                      <span>Emoji</span>
                    </button>
                    <button type="button" className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-red-400" />
                      <span>Posizione</span>
                    </button>
                    <button type="button" className="flex items-center">
                      <Tag className="h-4 w-4 mr-1 text-blue-400" />
                      <span>Tag</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex justify-between mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-slate-300">
                  Annulla
                </Button>
              </DialogClose>
              
              <Button 
                type="submit" 
                disabled={isSubmitting || uploadMediaMutation.isPending || createPostMutation.isPending || !media}
                className={!media ? "opacity-50" : "bg-gradient-to-r from-blue-500 to-blue-600"}
              >
                {(isSubmitting || uploadMediaMutation.isPending || createPostMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Pubblicando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Pubblica
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {showMediaCapture && (
        <MediaCaptureModern
          onCapture={handleMediaCapture}
          onClose={() => setShowMediaCapture(false)}
          allowedTypes={captureType}
        />
      )}
    </>
  );
};

export default CreatePostModal;