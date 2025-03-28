import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, Image, Pencil
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number | null;
  initialCaption?: string | null;
  mediaUrl?: string;
  mediaType?: string;
}

export default function EditPostModal({
  isOpen,
  onClose,
  postId,
  initialCaption = '',
  mediaUrl = '',
  mediaType = 'image'
}: EditPostModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      caption: initialCaption || ''
    }
  });

  // Reset form when initialCaption changes
  useEffect(() => {
    reset({ caption: initialCaption || '' });
  }, [initialCaption, reset]);

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async (data: { caption: string }) => {
      if (!postId) throw new Error('ID del post non valido');
      
      const response = await apiRequest('PUT', `/api/posts/${postId}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Post aggiornato!',
        description: 'Il tuo post è stato modificato con successo.',
      });
      
      // Reset form and close modal
      reset();
      onClose();
      
      // Invalidate queries to refresh feed
      queryClient.invalidateQueries({ queryKey: ['/api/feed/posts'] });
    },
    onError: (error) => {
      toast({
        title: 'Errore durante l\'aggiornamento del post',
        description: String(error),
        variant: 'destructive',
      });
    }
  });

  const onSubmit = async (data: { caption: string }) => {
    updatePostMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Modifica Post
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            {mediaUrl && (
              <div className="w-full aspect-video bg-slate-100 overflow-hidden rounded-md">
                {mediaType === 'image' ? (
                  <img 
                    src={mediaUrl} 
                    alt="Media del post" 
                    className="w-full h-full object-cover"
                  />
                ) : mediaType === 'video' ? (
                  <video 
                    src={mediaUrl} 
                    controls 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <audio src={mediaUrl} controls />
                  </div>
                )}
              </div>
            )}
            
            <div>
              <Textarea
                {...register('caption')}
                placeholder="Descrivi il tuo post..."
                className="resize-none"
                rows={5}
              />
              {errors.caption && (
                <p className="text-sm text-red-500 mt-1">{errors.caption.message}</p>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">Annulla</Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={updatePostMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {updatePostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aggiornamento...
                </>
              ) : (
                'Salva modifiche'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}