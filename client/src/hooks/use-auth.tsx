import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@shared/schema';
import { useLocation } from 'wouter';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  isAuthenticated: boolean;
  login: (userData: Omit<User, 'password'>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [, navigate] = useLocation();
  
  // Load user from localStorage on initial mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);
  
  const login = (userData: Omit<User, 'password'>) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };
  
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    navigate('/auth');
  };
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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