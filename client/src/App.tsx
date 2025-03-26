import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Feed from "@/pages/Feed";
import Videos from "@/pages/Videos";
import Discover from "@/pages/Discover";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import EditProfile from "@/pages/EditProfile";
import AppHeader from "@/components/AppHeader";
import BottomNavigation from "@/components/BottomNavigation";
import StoriesCarousel from "@/components/StoriesCarousel";
import StoryViewer from "@/components/StoryViewer";
import CreateContentModal from "@/components/CreateContentModal";
import { TabProvider } from "@/hooks/use-tab";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

function PrivateRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <Component {...rest} /> : <Redirect to="/auth" />;
}

function MainApp() {
  const [location] = useLocation();
  const { user } = useAuth();
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
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  return (
    <div className="max-w-screen-md mx-auto bg-white min-h-screen flex flex-col relative">
      <AppHeader user={user} notifications={notifications} />
      
      {showStoriesCarousel && (
        <StoriesCarousel currentUserId={user.id} onStoryClick={handleOpenStory} />
      )}
      
      <main className="flex-1 overflow-hidden">
        <Switch>
          <Route path="/" component={Feed} />
          <Route path="/videos" component={Videos} />
          <Route path="/discover" component={Discover} />
          <Route path="/profile" component={Profile} />
          <Route path="/edit-profile" component={EditProfile} />
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
          userId={user.id}
          onClose={() => setIsCreateModalOpen(false)} 
        />
      )}
    </div>
  );
}

function Router() {
  return (
    <TabProvider>
      <Switch>
        <Route path="/auth" component={Auth} />
        <Route>
          <MainApp />
        </Route>
      </Switch>
    </TabProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
