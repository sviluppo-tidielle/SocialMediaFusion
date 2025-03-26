import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User, insertUserSchema } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { FaGoogle, FaFacebook, FaLinkedin, FaTwitter, FaMicrosoft, FaApple } from 'react-icons/fa';

// Extended schema with client-side validation
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  username: z.string().min(1, "Username è richiesto"),
  password: z.string().min(1, "Password è richiesta"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

export default function Auth() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('login');

  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      bio: '',
      website: '',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=160&h=160&q=80'
    },
  });

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: Omit<RegisterFormValues, 'confirmPassword'>) => {
      const { confirmPassword, ...userDataToSubmit } = userData as any;
      return await apiRequest('POST', '/api/auth/register', userDataToSubmit);
    },
    onSuccess: (data: Omit<User, 'password'>) => {
      toast({
        title: 'Registrazione completata!',
        description: 'Il tuo account è stato creato con successo.',
      });
      
      // Store user in local storage
      localStorage.setItem('currentUser', JSON.stringify(data));
      
      // Redirect to feed
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: 'Errore durante la registrazione',
        description: String(error),
        variant: 'destructive',
      });
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormValues) => {
      return await apiRequest('POST', '/api/auth/login', credentials);
    },
    onSuccess: (data: Omit<User, 'password'>) => {
      toast({
        title: 'Login effettuato!',
        description: 'Bentornato ' + data.fullName,
      });
      
      // Store user in local storage
      localStorage.setItem('currentUser', JSON.stringify(data));
      
      // Redirect to feed
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: 'Errore durante il login',
        description: String(error),
        variant: 'destructive',
      });
    }
  });

  // Handle register form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...userDataToSubmit } = data;
    registerMutation.mutate(userDataToSubmit);
  };

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Handle OAuth login
  const handleOAuthLogin = (provider: string) => {
    toast({
      title: `Accesso con ${provider}`,
      description: `Tentativo di accesso con ${provider}...`,
    });
    
    // In futuro, qui verrebbe implementata la vera autenticazione con OAuth
    console.log(`Login with ${provider}`);
  };

  // Component for social login buttons
  const SocialLoginButtons = () => (
    <div className="mt-6">
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">oppure continua con</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-2">
        <Button 
          type="button" 
          variant="outline" 
          className="flex justify-center items-center h-10 bg-white hover:bg-slate-50"
          onClick={() => handleOAuthLogin('Google')}
        >
          <FaGoogle className="h-5 w-5 text-red-500" />
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="flex justify-center items-center h-10 bg-white hover:bg-slate-50"
          onClick={() => handleOAuthLogin('Facebook')}
        >
          <FaFacebook className="h-5 w-5 text-blue-600" />
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="flex justify-center items-center h-10 bg-white hover:bg-slate-50"
          onClick={() => handleOAuthLogin('Apple')}
        >
          <FaApple className="h-5 w-5" />
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="flex justify-center items-center h-10 bg-white hover:bg-slate-50"
          onClick={() => handleOAuthLogin('Microsoft')}
        >
          <FaMicrosoft className="h-5 w-5 text-blue-500" />
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Button 
          type="button" 
          variant="outline" 
          className="flex justify-center items-center h-10 bg-white hover:bg-slate-50"
          onClick={() => handleOAuthLogin('X')}
        >
          <FaTwitter className="h-5 w-5" />
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="flex justify-center items-center h-10 bg-white hover:bg-slate-50"
          onClick={() => handleOAuthLogin('LinkedIn')}
        >
          <FaLinkedin className="h-5 w-5 text-blue-700" />
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="flex justify-center items-center h-10 bg-white hover:bg-slate-50"
          onClick={() => handleOAuthLogin('Instagram')}
        >
          <FaTwitter className="h-5 w-5 text-pink-600" />
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="flex justify-center items-center h-10 bg-white hover:bg-slate-50"
          onClick={() => handleOAuthLogin('TikTok')}
        >
          <FaTwitter className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        {/* App Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">SocialFusion</h1>
          <p className="text-slate-500 mt-2">La tua piattaforma social tutto-in-uno</p>
        </div>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Accedi</TabsTrigger>
            <TabsTrigger value="register">Registrati</TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Accedi al tuo account</h2>
              
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Il tuo username" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="La tua password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? 'Accesso in corso...' : 'Accedi'}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-500">
                  Non hai un account?{' '}
                  <button 
                    className="text-primary font-medium"
                    onClick={() => setActiveTab('register')}
                  >
                    Registrati
                  </button>
                </p>
              </div>
              
              <SocialLoginButtons />
            </div>
          </TabsContent>
          
          {/* Register Tab */}
          <TabsContent value="register">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Crea un nuovo account</h2>
              
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Il tuo nome e cognome" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Scegli un username" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="La tua email" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Scegli una password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conferma password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Conferma la tua password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? 'Registrazione in corso...' : 'Registrati'}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-500">
                  Hai già un account?{' '}
                  <button 
                    className="text-primary font-medium"
                    onClick={() => setActiveTab('login')}
                  >
                    Accedi
                  </button>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}