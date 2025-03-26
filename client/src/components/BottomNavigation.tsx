import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { Home, Play, Compass, User } from 'lucide-react';
import { useTab } from '@/hooks/use-tab';

export default function BottomNavigation() {
  const [location, navigate] = useLocation();
  const { activeTab, setActiveTab } = useTab();
  
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    
    switch (tab) {
      case 'feed':
        navigate('/');
        break;
      case 'videos':
        navigate('/videos');
        break;
      case 'discover':
        navigate('/discover');
        break;
      case 'profile':
        navigate('/profile');
        break;
    }
  }, [navigate, setActiveTab]);

  return (
    <nav className="sticky bottom-0 z-20 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center">
        <NavButton 
          icon={<Home className={activeTab === 'feed' ? 'fill-current' : ''} />}
          label="Home"
          isActive={activeTab === 'feed'}
          onClick={() => handleTabChange('feed')}
        />
        
        <NavButton 
          icon={<Play className={activeTab === 'videos' ? 'fill-current' : ''} />}
          label="Video"
          isActive={activeTab === 'videos'}
          onClick={() => handleTabChange('videos')}
        />
        
        <NavButton 
          icon={<Compass className={activeTab === 'discover' ? 'fill-current' : ''} />}
          label="Scopri"
          isActive={activeTab === 'discover'}
          onClick={() => handleTabChange('discover')}
        />
        
        <NavButton 
          icon={<User className={activeTab === 'profile' ? 'fill-current' : ''} />}
          label="Profilo"
          isActive={activeTab === 'profile'}
          onClick={() => handleTabChange('profile')}
        />
      </div>
    </nav>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ icon, label, isActive, onClick }: NavButtonProps) {
  return (
    <button 
      className={`flex flex-col items-center py-3 px-4 relative ${isActive ? 'text-primary' : 'text-slate-600'}`}
      onClick={onClick}
    >
      <div className="text-xl mb-1">
        {icon}
      </div>
      <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-slate-600'}`}>
        {label}
      </span>
      {isActive && (
        <div className="nav-indicator w-1/3 h-0.5 bg-primary absolute top-0 left-1/3"></div>
      )}
    </button>
  );
}
