import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AppHeader from "@/components/AppHeader";
import BottomNavigation from "@/components/BottomNavigation";
import StoriesCarousel from "@/components/StoriesCarousel";
import StoryViewer from "@/components/StoryViewer";
import CreateContentModal from "@/components/mobile/CreatePostModal";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<{
    id: number;
    userId: number;
    username: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<number>(3);

  // Show stories carousel only on feed page
  const showStoriesCarousel = location === "/" || location === "";

  // Story viewer handlers
  const handleOpenStory = (story: {
    id: number;
    userId: number;
    username: string;
  }) => {
    setCurrentStory(story);
    setIsStoryViewerOpen(true);
  };

  const handleCloseStory = () => {
    setIsStoryViewerOpen(false);
    setCurrentStory(null);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-screen-md mx-auto bg-white min-h-screen flex flex-col relative">
      <AppHeader user={user} notifications={notifications} />

      {showStoriesCarousel && (
        <StoriesCarousel
          currentUserId={user.id}
          onStoryClick={handleOpenStory}
        />
      )}

      <main className="flex-1 overflow-hidden">{children}</main>

      {/* Create content button */}
      <button
        className="fixed bottom-24 right-4 z-10 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg"
        onClick={() => setIsCreateModalOpen(true)}
        aria-label="Create new content"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
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

      <CreateContentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}