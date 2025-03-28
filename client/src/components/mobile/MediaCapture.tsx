import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Camera, Image, Mic, Video, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Webcam from 'react-webcam';
import ReactPlayer from 'react-player';

export type MediaType = 'photo' | 'video' | 'audio' | 'gallery';

export type MediaFile = {
  file: File;
  preview: string;
  type: MediaType;
};

interface MediaCaptureProps {
  onCapture: (media: MediaFile) => void;
  onClose: () => void;
  allowedTypes?: MediaType[];
  aspectRatio?: number; // width/height ratio
}

const MediaCapture: React.FC<MediaCaptureProps> = ({ 
  onCapture, 
  onClose, 
  allowedTypes = ['photo', 'video', 'audio', 'gallery'],
  aspectRatio = 1
}) => {
  const [activeType, setActiveType] = useState<MediaType>(allowedTypes[0] || 'photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedMedia, setRecordedMedia] = useState<string | null>(null);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [videoRecorder, setVideoRecorder] = useState<MediaRecorder | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calcola dimensioni del video in base all'aspect ratio
  const videoConstraints = {
    width: aspectRatio >= 1 ? 720 : 720 * aspectRatio,
    height: aspectRatio >= 1 ? 720 / aspectRatio : 720,
    facingMode: cameraFacingMode
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileType = file.type.startsWith('image/') ? 'photo' : 
                       file.type.startsWith('video/') ? 'video' : 
                       file.type.startsWith('audio/') ? 'audio' : 'unknown';
      
      const mediaFile: MediaFile = {
        file,
        preview: URL.createObjectURL(file),
        type: 'gallery'
      };
      
      onCapture(mediaFile);
    }
  };

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Converti il data URL in un file
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const mediaFile: MediaFile = {
              file,
              preview: imageSrc,
              type: 'photo'
            };
            onCapture(mediaFile);
          });
      }
    }
  }, [webcamRef, onCapture]);

  const handleDataAvailable = useCallback(({ data }: BlobEvent) => {
    if (data.size > 0) {
      setRecordedChunks(prev => [...prev, data]);
    }
  }, []);

  const startRecording = useCallback(() => {
    setRecordedChunks([]);
    setIsRecording(true);
    setRecordedMedia(null);

    if (activeType === 'video' && webcamRef.current && webcamRef.current.stream) {
      const stream = webcamRef.current.stream;
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });
      
      recorder.addEventListener('dataavailable', handleDataAvailable);
      recorder.start();
      
      mediaRecorderRef.current = recorder;
      setVideoRecorder(recorder);
    } else if (activeType === 'audio') {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const recorder = new MediaRecorder(stream);
          recorder.addEventListener('dataavailable', handleDataAvailable);
          recorder.start();
          
          mediaRecorderRef.current = recorder;
          setAudioRecorder(recorder);
        })
        .catch(err => console.error('Errore nell\'accesso al microfono:', err));
    }
  }, [activeType, handleDataAvailable]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    
    if (activeType === 'video' && videoRecorder) {
      videoRecorder.stop();
    } else if (activeType === 'audio' && audioRecorder) {
      audioRecorder.stop();
    }
  }, [activeType, videoRecorder, audioRecorder]);

  const toggleCameraFacing = useCallback(() => {
    setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Gestisce la creazione del file dopo che la registrazione è terminata
  useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      const blob = new Blob(recordedChunks, {
        type: activeType === 'video' ? 'video/webm' : 'audio/webm'
      });
      
      const url = URL.createObjectURL(blob);
      setRecordedMedia(url);
      
      const fileName = `${activeType}-${Date.now()}.webm`;
      const file = new File([blob], fileName, { 
        type: activeType === 'video' ? 'video/webm' : 'audio/webm'
      });
      
      const mediaFile: MediaFile = {
        file,
        preview: url,
        type: activeType
      };
      
      if (recordedChunks.length > 1) { // Assicuriamoci che ci sia abbastanza dati
        onCapture(mediaFile);
      }
    }
  }, [recordedChunks, isRecording, activeType, onCapture]);

  // Pulisce le risorse quando il componente viene smontato
  useEffect(() => {
    return () => {
      if (videoRecorder && videoRecorder.state === 'recording') {
        videoRecorder.stop();
      }
      if (audioRecorder && audioRecorder.state === 'recording') {
        audioRecorder.stop();
      }
      if (recordedMedia) {
        URL.revokeObjectURL(recordedMedia);
      }
    };
  }, [videoRecorder, audioRecorder, recordedMedia]);

  const renderMediaCaptureContent = () => {
    switch (activeType) {
      case 'photo':
        return (
          <div className="relative">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <Button 
                onClick={toggleCameraFacing} 
                size="icon" 
                className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-full"
              >
                <Camera className="h-6 w-6" />
              </Button>
              
              <Button 
                onClick={capturePhoto} 
                size="icon" 
                className="bg-white text-primary hover:bg-white/90 h-14 w-14 rounded-full"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="relative">
            <Webcam
              audio={true}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover rounded-lg"
            />
            
            {recordedMedia && !isRecording && (
              <div className="absolute inset-0 bg-black rounded-lg">
                <ReactPlayer
                  url={recordedMedia}
                  width="100%"
                  height="100%"
                  controls
                />
                <Button 
                  onClick={() => onCapture({
                    file: new File(
                      [new Blob(recordedChunks, { type: 'video/webm' })], 
                      `video-${Date.now()}.webm`, 
                      { type: 'video/webm' }
                    ),
                    preview: recordedMedia,
                    type: 'video'
                  })} 
                  className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600"
                >
                  <Check className="mr-2 h-4 w-4" /> Conferma
                </Button>
              </div>
            )}
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <Button 
                onClick={toggleCameraFacing} 
                size="icon" 
                className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-full"
              >
                <Camera className="h-6 w-6" />
              </Button>
              
              {isRecording ? (
                <Button 
                  onClick={stopRecording} 
                  size="icon" 
                  className="bg-red-500 text-white hover:bg-red-600 h-14 w-14 rounded-full"
                >
                  <div className="h-4 w-4 bg-white rounded-sm"></div>
                </Button>
              ) : (
                <Button 
                  onClick={startRecording} 
                  size="icon" 
                  className="bg-red-500 text-white hover:bg-red-600 h-14 w-14 rounded-full"
                >
                  <Video className="h-6 w-6" />
                </Button>
              )}
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center p-8 h-full">
            <div className="w-32 h-32 mb-6 relative">
              <div className={`w-full h-full rounded-full border-4 ${isRecording ? 'border-red-500 animate-pulse' : 'border-primary'} flex items-center justify-center`}>
                <Mic className={`h-12 w-12 ${isRecording ? 'text-red-500' : 'text-primary'}`} />
              </div>
            </div>
            
            {recordedMedia && !isRecording && (
              <div className="w-full mb-6">
                <ReactPlayer
                  url={recordedMedia}
                  width="100%"
                  height="50px"
                  controls
                />
                <Button 
                  onClick={() => onCapture({
                    file: new File(
                      [new Blob(recordedChunks, { type: 'audio/webm' })], 
                      `audio-${Date.now()}.webm`, 
                      { type: 'audio/webm' }
                    ),
                    preview: recordedMedia,
                    type: 'audio'
                  })} 
                  className="mt-4 bg-green-500 hover:bg-green-600 w-full"
                >
                  <Check className="mr-2 h-4 w-4" /> Conferma registrazione
                </Button>
              </div>
            )}
            
            {isRecording ? (
              <Button 
                onClick={stopRecording} 
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Ferma registrazione
              </Button>
            ) : (
              <Button 
                onClick={startRecording} 
                className="bg-primary hover:bg-primary/90"
              >
                Inizia registrazione
              </Button>
            )}
          </div>
        );
      
      case 'gallery':
        return (
          <div className="flex flex-col items-center justify-center p-8 h-full">
            <div 
              className="border-2 border-dashed border-primary rounded-lg p-8 w-full h-48 mb-6 flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <Image className="mx-auto h-12 w-12 text-primary mb-2" />
                <p className="text-sm text-slate-600">Clicca per selezionare un file dalla galleria</p>
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*,audio/*"
              onChange={handleFileSelect}
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              className="bg-primary hover:bg-primary/90"
            >
              Sfoglia galleria
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl overflow-hidden shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">Cattura media</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {allowedTypes.length > 1 && (
          <div className="p-2 flex space-x-2 border-b overflow-x-auto">
            {allowedTypes.includes('photo') && (
              <Button 
                variant={activeType === 'photo' ? 'default' : 'outline'} 
                onClick={() => setActiveType('photo')}
                className="whitespace-nowrap"
              >
                <Camera className="mr-2 h-4 w-4" /> Foto
              </Button>
            )}
            
            {allowedTypes.includes('video') && (
              <Button 
                variant={activeType === 'video' ? 'default' : 'outline'} 
                onClick={() => setActiveType('video')}
                className="whitespace-nowrap"
              >
                <Video className="mr-2 h-4 w-4" /> Video
              </Button>
            )}
            
            {allowedTypes.includes('audio') && (
              <Button 
                variant={activeType === 'audio' ? 'default' : 'outline'} 
                onClick={() => setActiveType('audio')}
                className="whitespace-nowrap"
              >
                <Mic className="mr-2 h-4 w-4" /> Audio
              </Button>
            )}
            
            {allowedTypes.includes('gallery') && (
              <Button 
                variant={activeType === 'gallery' ? 'default' : 'outline'} 
                onClick={() => setActiveType('gallery')}
                className="whitespace-nowrap"
              >
                <Image className="mr-2 h-4 w-4" /> Galleria
              </Button>
            )}
          </div>
        )}
        
        <div className="p-0 h-80" style={{ aspectRatio: aspectRatio.toString() }}>
          {renderMediaCaptureContent()}
        </div>
      </div>
    </div>
  );
};

export default MediaCapture;