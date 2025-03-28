import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Radio, X, Mic, MicOff, Camera, CameraOff, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveStreamModal = ({ isOpen, onClose }: LiveStreamModalProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [streamTitle, setStreamTitle] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [viewers, setViewers] = useState(0);
  const [streamStartTime, setStreamStartTime] = useState<Date | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  
  // Verifica la disponibilità della fotocamera all'apertura del modale
  useEffect(() => {
    if (isOpen) {
      checkCameraAvailability();
    } else {
      // Quando il modale si chiude, assicuriamoci di fermare lo streaming
      stopStreaming();
    }
  }, [isOpen]);
  
  const checkCameraAvailability = async () => {
    setCameraError(null);
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      
      if (!hasCamera) {
        setCameraError('Nessuna fotocamera trovata sul dispositivo');
        return false;
      }
      
      // Prova ad accedere alla fotocamera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Memorizza lo stream per poterlo fermare più tardi
      mediaStreamRef.current = stream;
      
      return true;
    } catch (error) {
      console.error('Errore accesso alla fotocamera:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Impossibile accedere alla fotocamera';
        
      setCameraError(`Errore: ${errorMessage}`);
      return false;
    }
  };
  
  // Mock di una mutazione per avviare lo streaming
  const startStreamMutation = useMutation({
    mutationFn: async (data: { title: string }) => {
      // Nella versione reale, qui si connettrebbe a un servizio di streaming
      // e invierebbe lo stream video/audio
      
      // Simulazione di una chiamata API
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            streamId: 'stream_' + Math.random().toString(36).substring(2, 9),
            serverUrl: 'rtmp://streaming.server.example/live'
          });
        }, 1500);
      });
      
      return response;
    },
    onSuccess: () => {
      setIsStreaming(true);
      setStreamStartTime(new Date());
      
      // Simulare un incremento graduale degli spettatori
      const interval = setInterval(() => {
        setViewers(prev => {
          const increment = Math.floor(Math.random() * 3);
          return prev + increment;
        });
      }, 10000);
      
      // Pulire l'intervallo quando il componente viene smontato
      return () => clearInterval(interval);
    },
    onError: (error) => {
      toast({
        title: "Errore nell'avvio della diretta",
        description: String(error),
        variant: 'destructive'
      });
    }
  });
  
  // Mutation per terminare lo streaming
  const endStreamMutation = useMutation({
    mutationFn: async () => {
      // Simulazione di una chiamata API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      stopStreaming();
      toast({
        title: 'Diretta terminata',
        description: 'La tua diretta è stata terminata con successo.'
      });
    }
  });
  
  const startStreaming = async () => {
    if (!streamTitle.trim()) {
      toast({
        title: 'Titolo richiesto',
        description: 'Inserisci un titolo per la tua diretta',
        variant: 'destructive'
      });
      return;
    }
    
    const cameraAvailable = await checkCameraAvailability();
    if (!cameraAvailable) return;
    
    startStreamMutation.mutate({ title: streamTitle });
  };
  
  const stopStreaming = () => {
    // Fermare lo streaming e ripulire
    if (isStreaming) {
      endStreamMutation.mutate();
    }
    
    // Fermare i flussi multimediali
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    setIsStreaming(false);
    setStreamStartTime(null);
    setViewers(0);
  };
  
  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };
  
  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };
  
  // Calcola la durata dello streaming
  const getStreamDuration = () => {
    if (!streamStartTime) return '00:00';
    
    const now = new Date();
    const diffMs = now.getTime() - streamStartTime.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffSec = Math.floor((diffMs % 60000) / 1000);
    
    return `${diffMin.toString().padStart(2, '0')}:${diffSec.toString().padStart(2, '0')}`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isStreaming ? 'In diretta' : 'Inizia una diretta'}
          </DialogTitle>
          <DialogDescription>
            {isStreaming 
              ? `Durata: ${getStreamDuration()} | Spettatori: ${viewers}`
              : 'Trasmetti in diretta ai tuoi follower'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {cameraError ? (
            <div className="p-6 rounded-md bg-red-50 text-red-600 text-center">
              <p>{cameraError}</p>
              <Button 
                className="mt-4"
                onClick={checkCameraAvailability}
              >
                Riprova
              </Button>
            </div>
          ) : (
            <>
              {/* Preview webcam */}
              <div className="relative bg-black rounded-md overflow-hidden aspect-video">
                <Webcam
                  ref={webcamRef}
                  audio={true}
                  mirrored={true}
                  className="w-full h-full object-cover"
                  videoConstraints={{
                    facingMode: "user"
                  }}
                />
                
                {/* Streaming indicator */}
                {isStreaming && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white rounded-md flex items-center">
                    <Radio className="h-4 w-4 mr-1 animate-pulse" />
                    <span className="text-xs font-semibold">LIVE</span>
                  </div>
                )}
                
                {/* Streaming controls overlay */}
                <div className="absolute bottom-2 right-2 flex space-x-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                    onClick={toggleAudio}
                  >
                    {isAudioMuted ? (
                      <MicOff className="h-4 w-4 text-white" />
                    ) : (
                      <Mic className="h-4 w-4 text-white" />
                    )}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                    onClick={toggleVideo}
                  >
                    {isVideoEnabled ? (
                      <Camera className="h-4 w-4 text-white" />
                    ) : (
                      <CameraOff className="h-4 w-4 text-white" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Stream Title Input (only visible before streaming starts) */}
              {!isStreaming && (
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="Titolo della diretta..."
                  className="w-full p-2 border rounded-md"
                />
              )}
            </>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          {!isStreaming ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
              >
                Annulla
              </Button>
              
              <Button 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                onClick={startStreaming}
                disabled={startStreamMutation.isPending || !!cameraError}
              >
                {startStreamMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Avvio...
                  </>
                ) : (
                  <>
                    <Radio className="mr-2 h-4 w-4" />
                    Inizia diretta
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="destructive"
                onClick={stopStreaming}
                disabled={endStreamMutation.isPending}
              >
                {endStreamMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Terminando...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Termina diretta
                  </>
                )}
              </Button>
              
              <Button variant="default" className="bg-primary">
                <Send className="mr-2 h-4 w-4" />
                Invia messaggio
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LiveStreamModal;