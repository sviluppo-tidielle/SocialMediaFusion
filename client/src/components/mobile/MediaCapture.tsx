import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, Video, Image, Mic, X, RotateCcw, 
  CameraOff, Sparkles, Upload, Music, ArrowLeft,
  FlipHorizontal, CircleSlash
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface MediaFile {
  file: File;
  preview: string;
  type: 'photo' | 'video' | 'audio' | 'gallery';
}

interface MediaCaptureProps {
  onCapture: (media: MediaFile) => void;
  onClose: () => void;
  allowedTypes?: Array<'photo' | 'video' | 'audio' | 'gallery'>;
  aspectRatio?: number;
}

const MediaCapture: React.FC<MediaCaptureProps> = ({
  onCapture,
  onClose,
  allowedTypes = ['photo', 'gallery'],
  aspectRatio = 1
}) => {
  // Se siamo su un ambiente desktop, fallback preferito è la galleria
  const defaultTab = 
    navigator.userAgent.match(/Android|iPhone|iPad|iPod/i) ? 
    (allowedTypes[0] || 'photo') : 
    (allowedTypes.includes('gallery') ? 'gallery' : allowedTypes[0]);
  
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioRecording, setAudioRecording] = useState<boolean>(false);
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Verifica iniziale della disponibilità della fotocamera
  useEffect(() => {
    const checkCameraAvailability = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraAvailable(videoDevices.length > 0);
        
        if (videoDevices.length === 0 && activeTab === 'photo') {
          console.log('No camera available, switching to gallery tab');
          setActiveTab(allowedTypes.includes('gallery') ? 'gallery' : allowedTypes[0]);
        }
      } catch (err) {
        console.error('Error checking camera availability:', err);
        setCameraAvailable(false);
        if (activeTab === 'photo' || activeTab === 'video') {
          setActiveTab(allowedTypes.includes('gallery') ? 'gallery' : allowedTypes[0]);
        }
      }
    };
    
    checkCameraAvailability();
  }, [allowedTypes, activeTab]);

  // Helper to create a File from a Blob
  const createFileFromBlob = useCallback((blob: Blob, type: string, extension: string) => {
    const now = new Date();
    const fileName = `${type}_${now.getTime()}.${extension}`;
    return new File([blob], fileName, { type: blob.type });
  }, []);

  // Capture photo from webcam
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convert base64 to blob
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = createFileFromBlob(blob, 'photo', 'jpg');
            onCapture({
              file,
              preview: imageSrc,
              type: 'photo'
            });
          })
          .catch(err => {
            console.error('Error capturing photo:', err);
            toast({
              title: 'Errore',
              description: 'Impossibile acquisire la foto. Riprova.',
              variant: 'destructive',
            });
          });
      } else {
        console.error('No screenshot available');
        toast({
          title: 'Errore',
          description: 'Fotocamera non disponibile o permessi mancanti.',
          variant: 'destructive',
        });
      }
    } else {
      console.error('Webcam ref not available');
      toast({
        title: 'Errore',
        description: 'Fotocamera non inizializzata. Prova a ricaricare la pagina.',
        variant: 'destructive',
      });
    }
  }, [webcamRef, onCapture, createFileFromBlob, toast]);

  // Start video recording
  const handleStartRecording = useCallback(() => {
    if (webcamRef.current && webcamRef.current.stream) {
      setRecordedChunks([]);
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/webm',
      });
      
      mediaRecorderRef.current.addEventListener('dataavailable', ({ data }) => {
        if (data.size > 0) {
          setRecordedChunks(prev => [...prev, data]);
        }
      });
      
      mediaRecorderRef.current.addEventListener('stop', () => {
        // Recording stopped, handle the chunks
      });
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  }, [webcamRef, setRecordedChunks]);

  // Stop video recording
  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [mediaRecorderRef, isRecording]);

  // Process recorded video
  useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const file = createFileFromBlob(blob, 'video', 'webm');
      const videoURL = URL.createObjectURL(blob);
      
      onCapture({
        file,
        preview: videoURL,
        type: 'video'
      });
      
      setRecordedChunks([]);
    }
  }, [recordedChunks, isRecording, onCapture, createFileFromBlob]);

  // Start audio recording
  const startAudioRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioFile = createFileFromBlob(audioBlob, 'audio', 'wav');
        const audioUrl = URL.createObjectURL(audioBlob);
        
        onCapture({
          file: audioFile,
          preview: audioUrl,
          type: 'audio'
        });
        
        if (audioStream) {
          audioStream.getTracks().forEach(track => track.stop());
          setAudioStream(null);
        }
      };
      
      audioRecorderRef.current = recorder;
      recorder.start();
      setAudioRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: 'Errore',
        description: 'Impossibile accedere al microfono. Verifica le autorizzazioni.',
        variant: 'destructive',
      });
    }
  }, [onCapture, createFileFromBlob, toast]);

  // Stop audio recording
  const stopAudioRecording = useCallback(() => {
    if (audioRecorderRef.current && audioRecording) {
      audioRecorderRef.current.stop();
      setAudioRecording(false);
    }
  }, [audioRecording]);

  // Handle file selection from gallery
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const fileURL = URL.createObjectURL(file);
    let mediaType: 'photo' | 'video' | 'audio' | 'gallery' = 'gallery';
    
    // Determine file type based on MIME type
    if (file.type.startsWith('image/')) {
      mediaType = 'photo';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video';
    } else if (file.type.startsWith('audio/')) {
      mediaType = 'audio';
    }
    
    onCapture({
      file,
      preview: fileURL,
      type: mediaType
    });
  };

  // Clean up streams when component unmounts
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      
      if (webcamRef.current && webcamRef.current.stream) {
        webcamRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioStream]);

  // Render the MediaCapture UI based on active tab
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {activeTab === 'photo' && 'Scatta una foto'}
            {activeTab === 'video' && 'Registra un video'}
            {activeTab === 'audio' && 'Registra audio'}
            {activeTab === 'gallery' && 'Seleziona dalla galleria'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${allowedTypes.length}, 1fr)` }}>
            {allowedTypes.includes('photo') && (
              <TabsTrigger value="photo">
                <Camera className="h-4 w-4 mr-2" />
                Foto
              </TabsTrigger>
            )}
            {allowedTypes.includes('video') && (
              <TabsTrigger value="video">
                <Video className="h-4 w-4 mr-2" />
                Video
              </TabsTrigger>
            )}
            {allowedTypes.includes('audio') && (
              <TabsTrigger value="audio">
                <Mic className="h-4 w-4 mr-2" />
                Audio
              </TabsTrigger>
            )}
            {allowedTypes.includes('gallery') && (
              <TabsTrigger value="gallery">
                <Image className="h-4 w-4 mr-2" />
                Galleria
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* Photo tab */}
          {allowedTypes.includes('photo') && (
            <TabsContent value="photo" className="flex flex-col items-center">
              {cameraAvailable ? (
                <div className="relative w-full">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ aspectRatio }}
                    className="w-full rounded-md"
                    onUserMediaError={(err) => {
                      console.error('Errore di accesso alla fotocamera:', err);
                      setCameraAvailable(false);
                      toast({
                        title: 'Fotocamera non disponibile',
                        description: 'Verifica le autorizzazioni o prova con un altro metodo di acquisizione.',
                        variant: 'destructive'
                      });
                    }}
                  />
                  
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <Button 
                      type="button" 
                      className="rounded-full w-16 h-16"
                      onClick={capturePhoto}
                    >
                      <Camera className="h-8 w-8" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100 w-full h-60 rounded-md flex flex-col items-center justify-center p-4">
                  <Camera className="h-16 w-16 text-slate-400 mb-4" />
                  <p className="text-sm text-slate-500 mb-4 text-center">
                    La fotocamera non è disponibile. Verifica che il tuo dispositivo abbia una fotocamera e che il browser abbia il permesso di accedervi.
                  </p>
                  <p className="text-sm text-slate-500 mb-4 text-center">
                    Su Windows, verifica nelle impostazioni di privacy che il browser abbia l'autorizzazione ad accedere alla fotocamera.
                  </p>
                  {allowedTypes.includes('gallery') && (
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab('gallery')}
                    >
                      Usa galleria invece
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          )}
          
          {/* Video tab */}
          {allowedTypes.includes('video') && (
            <TabsContent value="video" className="flex flex-col items-center">
              {cameraAvailable ? (
                <div className="relative w-full">
                  <Webcam
                    audio={true}
                    ref={webcamRef}
                    videoConstraints={{ aspectRatio }}
                    className="w-full rounded-md"
                    onUserMediaError={(err) => {
                      console.error('Errore di accesso alla fotocamera/microfono:', err);
                      setCameraAvailable(false);
                      toast({
                        title: 'Fotocamera non disponibile',
                        description: 'Verifica le autorizzazioni o prova con un altro metodo di acquisizione.',
                        variant: 'destructive'
                      });
                    }}
                  />
                  
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    {!isRecording ? (
                      <Button 
                        type="button" 
                        variant="destructive"
                        className="rounded-full w-16 h-16"
                        onClick={handleStartRecording}
                      >
                        <Video className="h-8 w-8" />
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        variant="destructive"
                        className="rounded-full w-16 h-16 animate-pulse"
                        onClick={handleStopRecording}
                      >
                        <X className="h-8 w-8" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100 w-full h-60 rounded-md flex flex-col items-center justify-center p-4">
                  <Video className="h-16 w-16 text-slate-400 mb-4" />
                  <p className="text-sm text-slate-500 mb-4 text-center">
                    La fotocamera o il microfono non sono disponibili. Verifica che il tuo dispositivo abbia i permessi necessari.
                  </p>
                  <p className="text-sm text-slate-500 mb-4 text-center">
                    Su Windows, verifica nelle impostazioni di privacy che il browser abbia l'autorizzazione ad accedere alla fotocamera e al microfono.
                  </p>
                  {allowedTypes.includes('gallery') && (
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab('gallery')}
                    >
                      Usa galleria invece
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          )}
          
          {/* Audio tab */}
          {allowedTypes.includes('audio') && (
            <TabsContent value="audio" className="flex flex-col items-center p-4">
              <div className="bg-slate-100 w-full h-48 rounded-md flex flex-col items-center justify-center">
                <Mic className="h-16 w-16 text-slate-400 mb-4" />
                {!audioRecording ? (
                  <Button 
                    type="button" 
                    onClick={startAudioRecording}
                    className="rounded-full"
                  >
                    Inizia registrazione
                  </Button>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="text-center mb-4">
                      <p className="text-sm text-red-500">Registrazione in corso...</p>
                      <div className="flex space-x-1 mt-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="destructive"
                      onClick={stopAudioRecording}
                      className="rounded-full"
                    >
                      Termina registrazione
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
          
          {/* Gallery tab */}
          {allowedTypes.includes('gallery') && (
            <TabsContent value="gallery" className="flex flex-col items-center">
              <div className="bg-slate-100 w-full h-60 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <Image className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm text-slate-500 mb-4 px-4">
                    Seleziona una foto, video o file audio dal tuo dispositivo
                  </p>
                  <Button 
                    type="button" 
                    onClick={() => {
                      // Reset l'input file prima di aprirlo per assicurarsi che l'evento change venga sempre attivato
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    Seleziona file
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={[
                      allowedTypes.includes('photo') ? 'image/*' : '',
                      allowedTypes.includes('video') ? 'video/*' : '',
                      allowedTypes.includes('audio') ? 'audio/*' : ''
                    ].filter(Boolean).join(',')}
                    className="hidden"
                  />
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        <div className="flex justify-between mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Annulla
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaCapture;