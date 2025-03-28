import { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MediaCapture, { MediaFile } from './MediaCapture';
import { User } from 'lucide-react';

interface ProfileImageSelectorProps {
  currentImage: string | null;
  onImageSelected: (imageData: File, preview: string) => void;
}

const ProfileImageSelector = ({ currentImage, onImageSelected }: ProfileImageSelectorProps) => {
  const [showMediaCapture, setShowMediaCapture] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage);

  const handleCapture = (media: MediaFile) => {
    if (media.type === 'photo' || (media.type === 'gallery' && media.file.type.startsWith('image/'))) {
      setPreviewImage(media.preview);
      onImageSelected(media.file, media.preview);
      setShowMediaCapture(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-primary">
            <AvatarImage src={previewImage || undefined} alt="Immagine profilo" />
            <AvatarFallback>
              <User className="h-12 w-12 text-slate-400" />
            </AvatarFallback>
          </Avatar>
          
          <Button 
            type="button"
            className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2"
            onClick={() => setShowMediaCapture(true)}
            aria-label="Cambia immagine profilo"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          type="button"
          className="mt-2 text-primary font-medium text-sm"
          onClick={() => setShowMediaCapture(true)}
          variant="ghost"
        >
          Cambia immagine profilo
        </Button>
      </div>

      {showMediaCapture && (
        <MediaCapture 
          onCapture={handleCapture}
          onClose={() => setShowMediaCapture(false)}
          allowedTypes={['photo', 'gallery']}
          aspectRatio={1}
        />
      )}
    </>
  );
};

export default ProfileImageSelector;