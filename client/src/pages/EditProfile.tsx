import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { UpdateUserProfile, User } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, User as UserIcon, Upload, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import ProfileImageSelector from '@/components/mobile/ProfileImageSelector';
import { cn } from '@/lib/utils';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function EditProfile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  
  // Get user ID from auth
  const userId = authUser?.id || 1;
  
  // State for form fields - Basic info
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  
  // State for social media fields
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [xUrl, setXUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  
  // State for recommendation fields
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [birthdate, setBirthdate] = useState('');
  
  // State for arrays
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [connectionPreferences, setConnectionPreferences] = useState<string[]>([]);
  
  // State for input fields for arrays
  const [newInterest, setNewInterest] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  
  // Fetch user data
  const { data: user, isLoading } = useQuery<Omit<User, 'password'>>({
    queryKey: [`/api/users/${userId}`],
  });
  
  // Initialize form fields when user data is available
  useEffect(() => {
    if (user) {
      // Initialize form with basic user data
      setFullName(user.fullName || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setWebsite(user.website || '');
      setEmail(user.email || '');
      setProfilePicture(user.profilePicture || '');
      
      // Initialize social media fields
      setFacebookUrl(user.facebookUrl || '');
      setInstagramUrl(user.instagramUrl || '');
      setXUrl(user.xUrl || '');
      setLinkedinUrl(user.linkedinUrl || '');
      setWhatsappNumber(user.whatsappNumber || '');
      setTiktokUrl(user.tiktokUrl || '');
      
      // Initialize recommendation data
      setLocation(user.location || '');
      setOccupation(user.occupation || '');
      setEducation(user.education || '');
      setBirthdate(user.birthdate || '');
      
      // Initialize arrays
      setInterests(user.interests || []);
      setSkills(user.skills || []);
      setLanguages(user.languages || []);
      setConnectionPreferences(user.connectionPreferences || []);
    }
  }, [user]);
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: UpdateUserProfile) => {
      const response = await apiRequest('PUT', `/api/users/${userId}/profile`, profileData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Profilo aggiornato!',
        description: 'Le tue informazioni sono state aggiornate con successo.',
      });
      
      // Invalidate cache to refresh profile
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
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
  
  // Add item to array
  const addItem = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, item: string, setItem: React.Dispatch<React.SetStateAction<string>>) => {
    if (item.trim() === '') return;
    if (array.includes(item.trim())) {
      toast({
        title: 'Elemento già presente',
        description: 'Questo elemento è già stato aggiunto.',
        variant: 'destructive'
      });
      return;
    }
    setArray([...array, item.trim()]);
    setItem('');
  };
  
  // Remove item from array
  const removeItem = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setArray(array.filter(i => i !== item));
  };
  
  // Toggle connection preference
  const toggleConnectionPreference = (preference: string) => {
    if (connectionPreferences.includes(preference)) {
      setConnectionPreferences(connectionPreferences.filter(p => p !== preference));
    } else {
      setConnectionPreferences([...connectionPreferences, preference]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profileData: UpdateUserProfile = {
      bio,
      website,
      profilePicture,
      location,
      occupation,
      education,
      birthdate,
      interests,
      skills,
      languages,
      connectionPreferences,
      facebookUrl,
      instagramUrl,
      xUrl,
      linkedinUrl,
      whatsappNumber,
      tiktokUrl
    };
    
    updateProfileMutation.mutate(profileData);
  };
  
  // Upload profile image mutation
  const uploadProfileImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/uploads/profile', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante il caricamento dell\'immagine');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Immagine aggiornata!',
        description: 'La tua immagine del profilo è stata caricata con successo.',
      });
      
      setProfilePicture(data.fileUrl);
      
      // Invalidate cache to refresh profile
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error) => {
      toast({
        title: 'Errore durante il caricamento',
        description: String(error),
        variant: 'destructive',
      });
    }
  });
  
  const handleProfileImageSelected = (imageFile: File, preview: string) => {
    // Crea un FormData e aggiungi il file
    const formData = new FormData();
    formData.append('file', imageFile);
    
    // Esegui la mutation di upload
    uploadProfileImageMutation.mutate(formData);
    
    // Mostra l'anteprima in attesa dell'upload completato
    setProfilePicture(preview);
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
          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture */}
            <ProfileImageSelector 
              currentImage={profilePicture} 
              onImageSelected={handleProfileImageSelected} 
            />
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Informazioni base</TabsTrigger>
                <TabsTrigger value="advanced">Raccomandazioni</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profilo personale</CardTitle>
                    <CardDescription>
                      Aggiorna le tue informazioni base per il tuo profilo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                        Nome completo
                      </label>
                      <Input 
                        id="fullName"
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Il tuo nome e cognome"
                        readOnly // Nome e username sono di sola lettura una volta creati
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
                        readOnly // Nome e username sono di sola lettura una volta creati
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
                        readOnly // Email è di sola lettura una volta creato
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium mb-1">
                        Bio
                      </label>
                      <Textarea 
                        id="bio"
                        value={bio || ''} 
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
                        value={website || ''} 
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="Il tuo sito web"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Profili social</CardTitle>
                    <CardDescription>
                      Aggiungi i tuoi profili sui social media per permettere agli utenti di contattarti
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="facebookUrl" className="block text-sm font-medium mb-1">
                        Facebook
                      </label>
                      <Input 
                        id="facebookUrl"
                        value={facebookUrl || ''} 
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        placeholder="URL del tuo profilo Facebook"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="instagramUrl" className="block text-sm font-medium mb-1">
                        Instagram
                      </label>
                      <Input 
                        id="instagramUrl"
                        value={instagramUrl || ''} 
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="URL del tuo profilo Instagram"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="xUrl" className="block text-sm font-medium mb-1">
                        X (ex Twitter)
                      </label>
                      <Input 
                        id="xUrl"
                        value={xUrl || ''} 
                        onChange={(e) => setXUrl(e.target.value)}
                        placeholder="URL del tuo profilo X"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="tiktokUrl" className="block text-sm font-medium mb-1">
                        TikTok
                      </label>
                      <Input 
                        id="tiktokUrl"
                        value={tiktokUrl || ''} 
                        onChange={(e) => setTiktokUrl(e.target.value)}
                        placeholder="URL del tuo profilo TikTok"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="linkedinUrl" className="block text-sm font-medium mb-1">
                        LinkedIn
                      </label>
                      <Input 
                        id="linkedinUrl"
                        value={linkedinUrl || ''} 
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="URL del tuo profilo LinkedIn"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="whatsappNumber" className="block text-sm font-medium mb-1">
                        Numero WhatsApp
                      </label>
                      <Input 
                        id="whatsappNumber"
                        value={whatsappNumber || ''} 
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="Il tuo numero WhatsApp (formato internazionale)"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="advanced" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informazioni personali</CardTitle>
                    <CardDescription>
                      Queste informazioni aiutano il nostro algoritmo a suggerirti connessioni migliori
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium mb-1">
                        Località
                      </label>
                      <Input 
                        id="location"
                        value={location || ''} 
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="La tua città o paese"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="occupation" className="block text-sm font-medium mb-1">
                        Professione
                      </label>
                      <Input 
                        id="occupation"
                        value={occupation || ''} 
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="La tua professione o lavoro"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="education" className="block text-sm font-medium mb-1">
                        Istruzione
                      </label>
                      <Input 
                        id="education"
                        value={education || ''} 
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="La tua scuola o università"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="birthdate" className="block text-sm font-medium mb-1">
                        Data di nascita
                      </label>
                      <Input 
                        id="birthdate"
                        value={birthdate || ''} 
                        onChange={(e) => setBirthdate(e.target.value)}
                        placeholder="La tua data di nascita"
                        type="date"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Interessi e competenze</CardTitle>
                    <CardDescription>
                      Aggiungi i tuoi interessi e competenze per migliorare i suggerimenti
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Interests */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Interessi
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {interests.map((interest) => (
                          <div 
                            key={interest}
                            className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {interest}
                            <button 
                              type="button"
                              onClick={() => removeItem(interests, setInterests, interest)}
                              className="ml-2 text-slate-500 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          placeholder="Aggiungi un interesse"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addItem(interests, setInterests, newInterest, setNewInterest);
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          onClick={() => addItem(interests, setInterests, newInterest, setNewInterest)}
                          size="icon"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Skills */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Competenze
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {skills.map((skill) => (
                          <div 
                            key={skill}
                            className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {skill}
                            <button 
                              type="button"
                              onClick={() => removeItem(skills, setSkills, skill)}
                              className="ml-2 text-slate-500 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Aggiungi una competenza"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addItem(skills, setSkills, newSkill, setNewSkill);
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          onClick={() => addItem(skills, setSkills, newSkill, setNewSkill)}
                          size="icon"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Languages */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Lingue
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {languages.map((language) => (
                          <div 
                            key={language}
                            className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {language}
                            <button 
                              type="button"
                              onClick={() => removeItem(languages, setLanguages, language)}
                              className="ml-2 text-slate-500 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          placeholder="Aggiungi una lingua"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addItem(languages, setLanguages, newLanguage, setNewLanguage);
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          onClick={() => addItem(languages, setLanguages, newLanguage, setNewLanguage)}
                          size="icon"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Preferenze per le connessioni</CardTitle>
                    <CardDescription>
                      Scegli su quali basi preferisci che ti vengano suggerite nuove connessioni
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={connectionPreferences.includes('location') ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => toggleConnectionPreference('location')}
                      >
                        Località
                      </Button>
                      <Button
                        type="button"
                        variant={connectionPreferences.includes('professional') ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => toggleConnectionPreference('professional')}
                      >
                        Professionale
                      </Button>
                      <Button
                        type="button"
                        variant={connectionPreferences.includes('education') ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => toggleConnectionPreference('education')}
                      >
                        Istruzione
                      </Button>
                      <Button
                        type="button"
                        variant={connectionPreferences.includes('interests') ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => toggleConnectionPreference('interests')}
                      >
                        Interessi
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        )}
      </main>
    </div>
  );
}