import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, User as UserIcon, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditProfile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userId = currentUser?.id || 1;
  
  // State for form fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  
  // Fetch user data
  const { data: user, isLoading } = useQuery<Omit<User, 'password'>>({
    queryKey: [`/api/users/${userId}`],
    onSuccess: (data) => {
      // Initialize form with user data
      setFullName(data.fullName || '');
      setUsername(data.username || '');
      setBio(data.bio || '');
      setWebsite(data.website || '');
      setEmail(data.email || '');
      setProfilePicture(data.profilePicture || '');
    }
  });
  
  // Mock update profile mutation (API endpoint not yet implemented)
  const updateProfileMutation = useMutation({
    mutationFn: async (userData: any) => {
      // In a real app, this would call an API endpoint like:
      // return await apiRequest('PATCH', `/api/users/${userId}`, userData);
      
      // For demo, we'll just simulate a successful update
      return new Promise<Omit<User, 'password'>>((resolve) => {
        setTimeout(() => {
          resolve({
            ...userData,
            id: userId,
            followerCount: user?.followerCount || 0,
            followingCount: user?.followingCount || 0,
            postCount: user?.postCount || 0
          });
        }, 1000);
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Profilo aggiornato!',
        description: 'Le tue informazioni sono state aggiornate con successo.',
      });
      
      // Update user in local storage
      localStorage.setItem('currentUser', JSON.stringify(data));
      
      // Invalidate cache to refresh profile
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      
      // Navigate back to profile
      navigate('/profile');
    },
    onError: (error) => {
      toast({
        title: 'Errore durante l\'aggiornamento',
        description: String(error),
        variant: 'destructive',
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProfileMutation.mutate({
      fullName,
      username,
      bio,
      website,
      email,
      profilePicture
    });
  };
  
  const handleImageUpload = () => {
    // In a real app, this would open a file picker and upload the image
    // For now, we'll just simulate a random profile picture change
    const demoImages = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=160&h=160&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=160&h=160&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=160&h=160&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=160&h=160&q=80'
    ];
    
    const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)];
    setProfilePicture(randomImage);
  };
  
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-light-gray px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="mr-4 text-slate-600" 
            onClick={() => navigate('/profile')}
            aria-label="Torna al profilo"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold">Modifica profilo</h1>
        </div>
        
        <Button 
          type="submit" 
          form="edit-profile-form"
          variant="ghost" 
          className="text-primary font-semibold"
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? 'Salvataggio...' : 'Salva'}
        </Button>
      </header>
      
      <main className="max-w-screen-md mx-auto p-4 pb-20">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <Skeleton className="w-24 h-24 rounded-full mb-4" />
              <Skeleton className="h-8 w-32" />
            </div>
            
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-24 w-full mb-4" />
          </div>
        ) : (
          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-primary">
                  <AvatarImage src={profilePicture} alt="Profile picture" />
                  <AvatarFallback>
                    <UserIcon className="h-12 w-12 text-slate-400" />
                  </AvatarFallback>
                </Avatar>
                
                <button 
                  type="button"
                  className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2"
                  onClick={handleImageUpload}
                  aria-label="Upload profile picture"
                >
                  <Upload className="h-4 w-4" />
                </button>
              </div>
              
              <button 
                type="button"
                className="mt-2 text-primary font-medium text-sm"
                onClick={handleImageUpload}
              >
                Cambia immagine profilo
              </button>
            </div>
            
            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                  Nome completo
                </label>
                <Input 
                  id="fullName"
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Il tuo nome e cognome"
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username
                </label>
                <Input 
                  id="username"
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Il tuo username"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input 
                  id="email"
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="La tua email"
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-1">
                  Bio
                </label>
                <Textarea 
                  id="bio"
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Scrivi qualcosa su di te"
                  className="resize-none h-24"
                />
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium mb-1">
                  Sito web
                </label>
                <Input 
                  id="website"
                  value={website} 
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="Il tuo sito web"
                />
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}