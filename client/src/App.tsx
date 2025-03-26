import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Feed from "@/pages/Feed";
import Videos from "@/pages/Videos";
import Discover from "@/pages/Discover";
import Profile from "@/pages/Profile";
import AppHeader from "@/components/AppHeader";
import BottomNavigation from "@/components/BottomNavigation";
import StoriesCarousel from "@/components/StoriesCarousel";
import StoryViewer from "@/components/StoryViewer";
import CreateContentModal from "@/components/CreateContentModal";
import { TabProvider } from "@/hooks/use-tab";
import { User } from "@shared/schema";

// Mock user for now, will be replaced with auth system
const currentUser: Omit<User, 'password'> = {
  id: 1,
  username: "alessandrobianchi",
  fullName: "Alessandro Bianchi",
  email: "alessandro@example.com",
  bio: "Fotografia, viaggi e tecnologia 📱 | Milano, Italia 🇮🇹",
  profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=160&h=160&q=80",
  website: "www.alessandrobianchi.com",
  followerCount: 846,
  followingCount: 293,
  postCount: 152
};

function Router() {
  const [location] = useLocation();
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<{id: number, userId: number, username: string} | null>(null);
  const [notifications, setNotifications] = useState<number>(3);
  
  // Show stories carousel only on feed page
  const showStoriesCarousel = location === "/" || location === "";
  
  // Story viewer handlers
  const handleOpenStory = (story: {id: number, userId: number, username: string}) => {
    setCurrentStory(story);
    setIsStoryViewerOpen(true);
  };
  
  const handleCloseStory = () => {
    setIsStoryViewerOpen(false);
    setCurrentStory(null);
  };
  
  return (
    <TabProvider>
      <div className="max-w-screen-md mx-auto bg-white min-h-screen flex flex-col relative">
        <AppHeader user={currentUser} notifications={notifications} />
        
        {showStoriesCarousel && (
          <StoriesCarousel currentUserId={currentUser.id} onStoryClick={handleOpenStory} />
        )}
        
        <main className="flex-1 overflow-hidden">
          <Switch>
            <Route path="/" component={Feed} />
            <Route path="/videos" component={Videos} />
            <Route path="/discover" component={Discover} />
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </main>
        
        {/* Create content button */}
        <button 
          className="fixed bottom-24 right-4 z-10 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg"
          onClick={() => setIsCreateModalOpen(true)}
          aria-label="Create new content"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        <BottomNavigation />
        
        {isStoryViewerOpen && currentStory && (
          <StoryViewer 
            storyId={currentStory.id} 
            userId={currentStory.userId}
            username={currentStory.username}
            onClose={handleCloseStory} 
          />
        )}
        
        {isCreateModalOpen && (
          <CreateContentModal 
            userId={currentUser.id}
            onClose={() => setIsCreateModalOpen(false)} 
          />
        )}
      </div>
    </TabProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
