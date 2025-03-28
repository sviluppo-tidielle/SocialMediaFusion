import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

const MediaCaptureModern: React.FC<MediaCaptureProps> = ({
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
        
        if (videoDevices.length === 0 && (activeTab === 'photo' || activeTab === 'video')) {
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
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              {activeTab === 'photo' && (
                <div className="flex items-center justify-center">
                  <Camera className="h-5 w-5 mr-2 text-blue-500" />
                  Inserisci una foto
                </div>
              )}
              {activeTab === 'video' && (
                <div className="flex items-center justify-center">
                  <Video className="h-5 w-5 mr-2 text-red-500" />
                  Inserisci un video
                </div>
              )}
              {activeTab === 'audio' && (
                <div className="flex items-center justify-center">
                  <Music className="h-5 w-5 mr-2 text-green-500" />
                  Registra audio
                </div>
              )}
              {activeTab === 'gallery' && (
                <div className="flex items-center justify-center">
                  <Image className="h-5 w-5 mr-2 text-purple-500" />
                  Seleziona dalla galleria
                </div>
              )}
            </DialogTitle>
            
            <DialogDescription className="text-center">
              {activeTab === 'photo' && 'Immortala un momento da condividere con i tuoi amici'}
              {activeTab === 'video' && 'Cattura e condividi momenti in movimento'}
              {activeTab === 'audio' && 'Condividi pensieri, musica o registrazioni audio'}
              {activeTab === 'gallery' && 'Seleziona foto o video già presenti sul tuo dispositivo'}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none border-y flex bg-slate-50">
            {allowedTypes.includes('photo') && (
              <TabsTrigger value="photo" className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                <Camera className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Fotocamera</span>
              </TabsTrigger>
            )}
            {allowedTypes.includes('video') && (
              <TabsTrigger value="video" className="flex-1 data-[state=active]:bg-red-50 data-[state=active]:text-red-600">
                <Video className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Video</span>
              </TabsTrigger>
            )}
            {allowedTypes.includes('audio') && (
              <TabsTrigger value="audio" className="flex-1 data-[state=active]:bg-green-50 data-[state=active]:text-green-600">
                <Music className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Audio</span>
              </TabsTrigger>
            )}
            {allowedTypes.includes('gallery') && (
              <TabsTrigger value="gallery" className="flex-1 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600">
                <Upload className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Galleria</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* Photo tab */}
          {allowedTypes.includes('photo') && (
            <TabsContent value="photo" className="m-0">
              {cameraAvailable ? (
                <div className="relative bg-black">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ aspectRatio }}
                    className="w-full aspect-square object-cover"
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
                  
                  {/* Capture interface overlay */}
                  <div className="absolute inset-0 flex flex-col">
                    {/* Top controls */}
                    <div className="p-4 flex justify-end">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="bg-black bg-opacity-30 text-white rounded-full"
                        onClick={() => onClose()}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {/* Middle space */}
                    <div className="flex-grow"></div>
                    
                    {/* Bottom controls */}
                    <div className="p-6 flex items-center justify-between bg-gradient-to-t from-black to-transparent">
                      <Button
                        type="button"
                        variant="ghost" 
                        size="icon"
                        className="text-white rounded-full"
                      >
                        <FlipHorizontal className="h-6 w-6" />
                      </Button>
                      
                      <Button 
                        type="button" 
                        className="bg-white hover:bg-gray-100 text-black rounded-full w-16 h-16 flex items-center justify-center border-4 border-blue-500"
                        onClick={capturePhoto}
                      >
                        <div className="h-10 w-10 rounded-full border-2 border-black"></div>
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost" 
                        size="icon"
                        className="text-white rounded-full"
                        onClick={() => setActiveTab('gallery')}
                      >
                        <Image className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 flex flex-col items-center justify-center min-h-[300px]">
                  <div className="bg-white rounded-full p-6 mb-6 shadow-md">
                    <CameraOff className="h-12 w-12 text-blue-400" />
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2 text-blue-800">Fotocamera non disponibile</h3>
                  
                  <p className="text-sm text-slate-600 mb-6 text-center max-w-xs">
                    Verifica che il tuo dispositivo abbia una fotocamera e che il browser abbia il permesso di accedervi.
                  </p>
                  
                  <div className="space-y-3">
                    <Button 
                      type="button" 
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      onClick={() => {
                        setCameraAvailable(true);
                        // Try to reinitialize camera
                        if (webcamRef.current) {
                          webcamRef.current.video?.play();
                        }
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Riprova
                    </Button>
                    
                    {allowedTypes.includes('gallery') && (
                      <Button 
                        type="button" 
                        variant="outline"
                        className="w-full border-blue-300"
                        onClick={() => setActiveTab('gallery')}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Carica dalla galleria
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          )}
          
          {/* Video tab */}
          {allowedTypes.includes('video') && (
            <TabsContent value="video" className="m-0">
              {cameraAvailable ? (
                <div className="relative bg-black">
                  <Webcam
                    audio={true}
                    ref={webcamRef}
                    videoConstraints={{ aspectRatio }}
                    className="w-full aspect-square object-cover"
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
                  
                  {/* Capture interface overlay */}
                  <div className="absolute inset-0 flex flex-col">
                    {/* Top controls with recording indicator */}
                    <div className="p-4 flex justify-between items-center">
                      {isRecording ? (
                        <div className="flex items-center bg-black bg-opacity-30 text-white px-3 py-1 rounded-full">
                          <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                          <span className="text-sm">REC</span>
                        </div>
                      ) : (
                        <div></div>
                      )}
                      
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="bg-black bg-opacity-30 text-white rounded-full"
                        onClick={() => onClose()}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {/* Middle space */}
                    <div className="flex-grow"></div>
                    
                    {/* Bottom controls */}
                    <div className="p-6 flex items-center justify-center bg-gradient-to-t from-black to-transparent">
                      {!isRecording ? (
                        <Button 
                          type="button" 
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center"
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
                </div>
              ) : (
                <div className="bg-gradient-to-r from-red-50 to-red-100 p-8 flex flex-col items-center justify-center min-h-[300px]">
                  <div className="bg-white rounded-full p-6 mb-6 shadow-md">
                    <CircleSlash className="h-12 w-12 text-red-400" />
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2 text-red-800">Camera/microfono non disponibili</h3>
                  
                  <p className="text-sm text-slate-600 mb-6 text-center max-w-xs">
                    Verifica che il tuo dispositivo abbia una fotocamera e un microfono e che il browser abbia i permessi per accedervi.
                  </p>
                  
                  <div className="space-y-3">
                    <Button 
                      type="button" 
                      className="w-full bg-red-500 hover:bg-red-600"
                      onClick={() => {
                        setCameraAvailable(true);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Riprova
                    </Button>
                    
                    {allowedTypes.includes('gallery') && (
                      <Button 
                        type="button" 
                        variant="outline"
                        className="w-full border-red-300"
                        onClick={() => setActiveTab('gallery')}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Carica dalla galleria
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          )}
          
          {/* Audio tab */}
          {allowedTypes.includes('audio') && (
            <TabsContent value="audio" className="m-0">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-8 flex flex-col items-center justify-center min-h-[300px]">
                <div className={`bg-white rounded-full p-6 mb-6 shadow-md ${audioRecording ? 'animate-pulse' : ''}`}>
                  <Mic className={`h-12 w-12 ${audioRecording ? 'text-red-500' : 'text-green-500'}`} />
                </div>
                
                <h3 className="text-lg font-medium mb-4 text-green-800">
                  {audioRecording ? 'Registrazione in corso...' : 'Pronto per registrare'}
                </h3>
                
                {audioRecording && (
                  <div className="w-full max-w-xs mb-6">
                    <div className="h-1 bg-green-200 rounded-full w-full overflow-hidden">
                      <div className="bg-green-500 h-full animate-[audio-wave_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                )}
                
                {!audioRecording ? (
                  <Button 
                    type="button" 
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6"
                    onClick={startAudioRecording}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Inizia registrazione
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={stopAudioRecording}
                    className="rounded-full px-6"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Termina registrazione
                  </Button>
                )}
              </div>
            </TabsContent>
          )}
          
          {/* Gallery tab */}
          {allowedTypes.includes('gallery') && (
            <TabsContent value="gallery" className="m-0">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-8 flex flex-col items-center justify-center min-h-[300px]">
                <input
                  type="file"
                  accept={allowedTypes.includes('photo') && allowedTypes.includes('video') && allowedTypes.includes('audio') 
                    ? "image/*,video/*,audio/*" 
                    : allowedTypes.includes('photo') && allowedTypes.includes('video') 
                    ? "image/*,video/*" 
                    : allowedTypes.includes('photo') 
                    ? "image/*" 
                    : allowedTypes.includes('video') 
                    ? "video/*" 
                    : "audio/*"}
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
                
                <div className="bg-white rounded-full p-6 mb-6 shadow-md">
                  <Image className="h-12 w-12 text-purple-500" />
                </div>
                
                <h3 className="text-lg font-medium mb-2 text-purple-800">Seleziona un file</h3>
                
                <p className="text-sm text-slate-600 mb-6 text-center max-w-xs">
                  Scegli un {allowedTypes.includes('photo') ? "immagine" : ""} 
                  {allowedTypes.includes('photo') && allowedTypes.includes('video') ? ", " : ""}
                  {allowedTypes.includes('video') ? "video" : ""} 
                  {(allowedTypes.includes('photo') || allowedTypes.includes('video')) && allowedTypes.includes('audio') ? " o " : ""}
                  {allowedTypes.includes('audio') ? "audio" : ""} 
                  dalla tua galleria
                </p>
                
                <Button
                  type="button"
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-6"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Seleziona dalla galleria
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MediaCaptureModern;