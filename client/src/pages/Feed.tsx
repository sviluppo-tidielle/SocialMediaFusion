import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { PostWithUser } from '@shared/schema';
import { useTab } from '@/hooks/use-tab';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Radio, 
  Lock, 
  User, 
  LayoutDashboard, 
  Settings, 
  Bell, 
  Calendar, 
  Bookmark, 
  HelpCircle,
  X,
  Users,
  Home,
  BellRing,
  Video,
  MessageSquare,
  FileText,
  Mail,
  PlusCircle,
  Search,
  Clock,
  Compass
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import EditPostModal from '@/components/mobile/EditPostModal';
import LiveStreamModal from '@/components/mobile/LiveStreamModal';
import PostOptionsMenu from '@/components/PostOptionsMenu';
import ShareModal from '@/components/ShareModal';

// Mock current user id until auth is implemented
const CURRENT_USER_ID = 1;

// Componente per la visualizzazione dettagliata di un post
function PostDetailView({ post, onClose }: { post: PostWithUser, onClose: () => void }) {
  const { toast } = useToast();
  const formatTimestamp = (date: Date | null) => {
    if (!date) return 'Unknown date';
    
    return new Date(date).toLocaleString('it-IT', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center">
          <img 
            src={post.user.profilePicture || `https://ui-avatars.com/api/?name=${post.user.username}`} 
            alt={`${post.user.username}'s avatar`} 
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <div>
            <h3 className="font-medium">{post.user.fullName}</h3>
            <p className="text-xs text-slate-500">{formatTimestamp(post.createdAt)}</p>
          </div>
        </div>
        <DialogClose asChild>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogClose>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-h-[70vh] bg-slate-100">
          <img 
            src={post.mediaUrl} 
            alt="Post image" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {post.caption && (
          <div className="p-4 border-b">
            <p className="text-sm">{post.caption}</p>
          </div>
        )}
        
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Heart className={`h-5 w-5 ${post.isLiked ? 'text-primary fill-primary' : 'text-slate-600'}`} />
              <span className="text-sm">{post.likeCount || 0} Mi piace</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-5 w-5 text-slate-600" />
              <span className="text-sm">{post.commentCount || 0} Commenti</span>
            </div>
          </div>
          <Send className="h-5 w-5 text-slate-600" />
        </div>
        
        <div className="p-4">
          <h4 className="font-medium mb-2">Commenti</h4>
          <p className="text-sm text-slate-500">Commenti in arrivo presto!</p>
        </div>
      </div>
    </div>
  );
}

// Componente per la barra di contatti a sinistra
function ContactsSidebar() {
  const dummyContacts = [
    { id: 1, name: "Marco Rossi", online: true },
    { id: 2, name: "Giulia Bianchi", online: true },
    { id: 3, name: "Luca Verdi", online: false },
    { id: 4, name: "Sofia Russo", online: true },
    { id: 5, name: "Alessandro Romano", online: false },
  ];

  return (
    <div className="w-full h-full bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-bold text-lg mb-4">Contatti</h3>
      <div className="space-y-2">
        {dummyContacts.map((contact) => (
          <div key={contact.id} className="flex items-center p-2 hover:bg-slate-50 rounded-md cursor-pointer">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <User className="h-4 w-4" />
              </div>
              {contact.online && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <span className="ml-2 text-sm">{contact.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente per la barra di applicazioni a destra
function AppsSidebar() {
  const appItems = [
    { id: 1, name: "Dashboard", icon: LayoutDashboard },
    { id: 2, name: "Notifiche", icon: Bell },
    { id: 3, name: "Eventi", icon: Calendar },
    { id: 4, name: "Salvati", icon: Bookmark },
    { id: 5, name: "Impostazioni", icon: Settings },
  ];

  return (
    <div className="w-full h-full bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-bold text-lg mb-4">App e Utilità</h3>
      <div className="space-y-3">
        {appItems.map((app) => {
          const IconComponent = app.icon;
          return (
            <div key={app.id} className="flex items-center p-2 hover:bg-slate-50 rounded-md cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                <IconComponent className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm">{app.name}</span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6">
        <h4 className="font-medium text-sm mb-3">Notizie Recenti</h4>
        <div className="space-y-3">
          <div className="p-2 bg-slate-50 rounded-md">
            <p className="text-xs font-medium">Nuova funzionalità streaming video in arrivo!</p>
            <p className="text-xs text-slate-500 mt-1">2 ore fa</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-md">
            <p className="text-xs font-medium">Scopri come utilizzare i nuovi filtri per le foto</p>
            <p className="text-xs text-slate-500 mt-1">1 giorno fa</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Feed() {
  const { setActiveTab } = useTab();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLiveStreamModalOpen, setIsLiveStreamModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [postDetailOpen, setPostDetailOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithUser | null>(null);
  
  // Set the active tab when this component mounts
  useEffect(() => {
    setActiveTab('feed');
  }, [setActiveTab]);
  
  // Fetch feed posts
  const { data: posts, isLoading, error } = useQuery<PostWithUser[]>({
    queryKey: [`/api/feed/posts?userId=${CURRENT_USER_ID}`]
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
  
  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await apiRequest('DELETE', `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/feed/posts?userId=${CURRENT_USER_ID}`] });
      toast({
        title: "Post eliminato",
        description: "Il tuo post è stato eliminato con successo",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del post",
        variant: "destructive",
      });
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
    setSelectedPostId(postId);
    setShareModalOpen(true);
  };
  
  const handleOptionsMenu = (postId: number) => {
    setSelectedPostId(postId);
  };
  
  const confirmDeletePost = () => {
    if (selectedPostId) {
      deleteMutation.mutate(selectedPostId);
      setDeleteDialogOpen(false);
    }
  };
  
  const openPostDetail = (post: PostWithUser) => {
    setSelectedPost(post);
    setPostDetailOpen(true);
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
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-4 px-0 md:px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Sidebar per contatti (visibile solo su desktop) */}
          <div className="hidden md:block md:col-span-3 lg:col-span-2 sticky top-4 self-start">
            <ContactsSidebar />
          </div>
          
          {/* Feed centrale */}
          <div className="col-span-1 md:col-span-6 lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="post-feed overflow-y-auto pb-16" id="feedContent">
                {posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <PostItem 
                      key={post.id} 
                      post={post} 
                      onLike={handleLikePost}
                      onComment={handleCommentPost}
                      onShare={handleSharePost}
                      onOptions={handleOptionsMenu}
                      onEdit={() => {
                        setSelectedPostId(post.id);
                        setEditModalOpen(true);
                      }}
                      onDelete={() => {
                        setSelectedPostId(post.id);
                        setDeleteDialogOpen(true);
                      }}
                      onClick={() => openPostDetail(post)}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-slate-500">Non ci sono ancora post. Segui altri utenti per vedere i loro contenuti.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar per app e utilità (visibile solo su desktop) */}
          <div className="hidden md:block md:col-span-3 lg:col-span-2 sticky top-4 self-start">
            <AppsSidebar />
          </div>
        </div>
      </div>

      {/* Live streaming button */}
      <div className="fixed bottom-32 right-4 z-10">
        <Button 
          className="rounded-full w-14 h-14 shadow-lg bg-red-600 hover:bg-red-700"
          onClick={() => setIsLiveStreamModalOpen(true)}
          aria-label="Inizia una diretta"
        >
          <Radio className="h-6 w-6 text-white" />
        </Button>
      </div>
      
      {/* Live stream modal */}
      <LiveStreamModal
        isOpen={isLiveStreamModalOpen}
        onClose={() => setIsLiveStreamModalOpen(false)}
      />
      
      {/* Edit post modal */}
      {selectedPostId && (
        <EditPostModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          postId={selectedPostId}
          initialCaption={posts?.find(p => p.id === selectedPostId)?.caption || ''}
          mediaUrl={posts?.find(p => p.id === selectedPostId)?.mediaUrl}
          mediaType={posts?.find(p => p.id === selectedPostId)?.mediaType}
          isPublic={posts?.find(p => p.id === selectedPostId)?.isPublic ?? true}
        />
      )}
      
      {/* Confirmation dialog for post deletion */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questo post?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Il post verrà rimosso permanentemente dalla piattaforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePost}
              className="bg-red-600 hover:bg-red-700"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Share modal */}
      {selectedPostId && (
        <ShareModal
          postId={selectedPostId}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
      
      {/* Post detail dialog */}
      <Dialog open={postDetailOpen} onOpenChange={setPostDetailOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          {selectedPost && (
            <PostDetailView 
              post={selectedPost} 
              onClose={() => setPostDetailOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PostItemProps {
  post: PostWithUser;
  onLike: (postId: number, isLiked: boolean) => void;
  onComment: (postId: number) => void;
  onShare: (postId: number) => void;
  onOptions: (postId: number) => void;
  onEdit: (postId: number) => void;
  onDelete: (postId: number) => void;
  onClick: () => void;
}

function PostItem({ post, onLike, onComment, onShare, onOptions, onEdit, onDelete, onClick }: PostItemProps) {
  const { toast } = useToast();
  const formatTimestamp = (date: Date | null) => {
    if (!date) return 'Unknown date';
    
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
    <article className="border-b border-slate-200 pb-3 mb-3 hover:bg-slate-50 transition-colors">
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
          <div className="flex items-center">
            <h3 className="font-medium text-sm">{post.user.fullName}</h3>
            {post.isPublic === false && (
              <div className="ml-2 text-xs text-slate-500 flex items-center">
                <Lock className="h-3 w-3 mr-1" />
                <span>Privato</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500">{formatTimestamp(post.createdAt)}</p>
        </div>
        <PostOptionsMenu
          postId={post.id}
          isOwner={post.userId === CURRENT_USER_ID}
          onEdit={() => post.userId === CURRENT_USER_ID && onEdit(post.id)}
          onDelete={() => post.userId === CURRENT_USER_ID && onDelete(post.id)}
          onShare={() => onShare(post.id)}
          onCopyLink={(id) => {
            navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
            toast({
              title: "Link copiato",
              description: "Il link del post è stato copiato negli appunti",
            });
          }}
        />
      </div>
      
      {/* Post Content */}
      <div className="mb-2 cursor-pointer" onClick={onClick}>
        <div className="w-full aspect-square bg-slate-100">
          <img 
            src={post.mediaUrl} 
            alt="Post image" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Caption sotto l'immagine */}
        {post.caption && (
          <p className="px-4 mt-2 mb-1 text-sm">{post.caption}</p>
        )}
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
            <span className="text-sm">{post.likeCount || 0}</span>
          </button>
          <button 
            className="flex items-center gap-1" 
            onClick={() => onComment(post.id)}
            aria-label="Comment on post"
          >
            <MessageCircle className="h-5 w-5 text-slate-600" />
            <span className="text-sm">{post.commentCount || 0}</span>
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