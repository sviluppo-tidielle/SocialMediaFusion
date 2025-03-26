import { createContext, ReactNode, useContext } from 'react';
import { User } from '@shared/schema';
import { useLocation } from 'wouter';
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
}

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  fullName: string;
  email: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useUserQuery() {
  return useQuery<Omit<User, 'password'> | null>({
    queryKey: ['/api/user'],
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false,
    refetchOnReconnect: true,
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: 'include',
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error(`Errore nel caricamento dell'utente: ${res.status}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error('Errore nel caricamento dell\'utente:', error);
        return null;
      }
    }
  });
}

function useLoginMutation(queryClient: QueryClient) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  return useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Errore di accesso');
      }
      return await res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/user'], userData);
      toast({
        title: 'Accesso effettuato',
        description: `Benvenuto, ${userData.fullName || userData.username}!`,
      });
      navigate('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore di accesso',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

function useRegisterMutation(queryClient: QueryClient) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest('POST', '/api/auth/register', userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Errore di registrazione');
      }
      return await res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/user'], userData);
      toast({
        title: 'Registrazione completata',
        description: `Benvenuto, ${userData.fullName || userData.username}!`,
      });
      navigate('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore di registrazione',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

function useLogoutMutation(queryClient: QueryClient) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: 'Disconnessione effettuata',
        description: 'Hai effettuato il logout con successo.',
      });
      navigate('/auth');
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore durante il logout',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUserQuery();
  const loginMutation = useLoginMutation(queryClient);
  const logoutMutation = useLogoutMutation(queryClient);
  const registerMutation = useRegisterMutation(queryClient);
  
  const isAuthenticated = !!user;
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAuthenticated, 
        loginMutation, 
        logoutMutation, 
        registerMutation 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}