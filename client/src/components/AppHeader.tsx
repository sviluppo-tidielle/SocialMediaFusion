import { useState } from 'react';
import { User } from '@shared/schema';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { X, Search, Bell, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface AppHeaderProps {
  user: Omit<User, 'password'>;
  notifications: number;
}

export default function AppHeader({ user, notifications }: AppHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { logout } = useAuth();

  const handleSearch = () => {
    setIsSearchOpen(true);
  };

  const handleNotifications = () => {
    setIsNotificationsOpen(true);
  };

  const handleMessages = () => {
    // Implement message handling
    console.log('Messages clicked');
  };
  
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-blue-100 px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <h1 className="text-2xl font-semibold text-primary">
        SocialFusion
      </h1>
      
      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <button 
          className="text-blue-500 hover:text-blue-700 transition-colors" 
          onClick={handleSearch}
          aria-label="Search"
        >
          <Search className="h-6 w-6" />
        </button>
        <button 
          className="text-blue-500 hover:text-blue-700 transition-colors relative" 
          onClick={handleNotifications}
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>
        <button 
          className="text-blue-500 hover:text-blue-700 transition-colors" 
          onClick={handleMessages}
          aria-label="Messages"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
        <div className="relative">
          <button 
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-500"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-label="User menu"
          >
            <img 
              src={user?.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80"} 
              alt="Your profile picture"
              className="w-full h-full object-cover"
            />
          </button>
          
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-blue-100">
              <button
                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search users, posts, videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <button 
              className="text-blue-500"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mt-4">
            {/* Search results would go here */}
            <p className="text-sm text-blue-400">Start typing to search...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-600">Notifications</h2>
            <button 
              className="text-blue-500"
              onClick={() => setIsNotificationsOpen(false)}
              aria-label="Close notifications"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Sample notifications */}
            <div className="flex items-start gap-3 p-3 border-b border-blue-100">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="User avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm"><span className="font-medium text-blue-600">Sofia</span> liked your post.</p>
                <p className="text-xs text-blue-400">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border-b border-blue-100">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="User avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm"><span className="font-medium text-blue-600">Marco</span> commented on your photo.</p>
                <p className="text-xs text-blue-400">4 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border-b border-blue-100">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="User avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm"><span className="font-medium text-blue-600">Antonio</span> started following you.</p>
                <p className="text-xs text-blue-400">Yesterday</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
