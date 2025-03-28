import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Video, Mic, X, Radio, Users } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveStreamModal = ({ isOpen, onClose }: LiveStreamModalProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Verifica iniziale della disponibilità della fotocamera
  useEffect(() => {
    const checkCameraAvailability = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraAvailable(videoDevices.length > 0);
      } catch (err) {
        console.error('Error checking camera availability:', err);
        setCameraAvailable(false);
      }
    };
    
    if (isOpen) {
      checkCameraAvailability();
    }
  }, [isOpen]);

  // Inizializza la fotocamera quando il componente viene aperto
  useEffect(() => {
    if (isOpen && !isStreaming && cameraAvailable) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, cameraAvailable]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Errore accesso fotocamera:', err);
      setCameraAvailable(false);
      toast({
        title: 'Fotocamera non disponibile',
        description: 'Verifica le autorizzazioni della fotocamera nelle impostazioni del browser.',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startLiveStream = () => {
    if (!streamTitle.trim()) {
      toast({
        title: 'Titolo richiesto',
        description: 'Inserisci un titolo per la tua diretta.',
        variant: 'destructive'
      });
      return;
    }
    
    // Avvia il countdown
    setCountdown(3);
    
    // Simula l'inizio del livestream dopo il countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          setIsStreaming(true);
          simulateViewers();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopLiveStream = () => {
    setIsStreaming(false);
    setViewerCount(0);
    
    toast({
      title: 'Diretta terminata',
      description: `La tua diretta è stata conclusa con successo.`,
    });
  };

  // Simula un aumento graduale dei visualizzatori per scopi dimostrativi
  const simulateViewers = () => {
    let count = 0;
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 3) + 1;
      setViewerCount(count);
      
      if (!isStreaming || count > 50) {
        clearInterval(interval);
      }
    }, 5000);
  };

  const handleCloseModal = () => {
    if (isStreaming) {
      if (window.confirm('Sei sicuro di voler terminare la diretta?')) {
        stopLiveStream();
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleCloseModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isStreaming ? 'Live in corso' : 'Inizia una diretta'}
          </DialogTitle>
          <DialogDescription>
            {isStreaming 
              ? 'Stai trasmettendo in diretta. I tuoi follower possono vederti ora.'
              : 'Condividi un momento live con i tuoi follower.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {cameraAvailable ? (
            <div className="relative aspect-video bg-black rounded-md overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted={!isStreaming}
                className="w-full h-full object-cover"
              />
              
              {isStreaming && (
                <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-500 px-2 py-1 rounded-full text-white text-xs">
                  <Radio className="h-3 w-3 animate-pulse" />
                  <span>LIVE</span>
                </div>
              )}
              
              {isStreaming && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full text-white text-xs">
                  <Users className="h-3 w-3" />
                  <span>{viewerCount}</span>
                </div>
              )}
              
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="text-6xl font-bold text-white">{countdown}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video bg-slate-100 rounded-md flex flex-col items-center justify-center p-4">
              <Video className="h-16 w-16 text-slate-400 mb-4" />
              <p className="text-sm text-slate-500 mb-4 text-center">
                La fotocamera non è disponibile. Verifica che il tuo dispositivo abbia una fotocamera e che il browser abbia il permesso di accedervi.
              </p>
              <p className="text-sm text-slate-500 mb-4 text-center">
                Su Windows, verifica nelle impostazioni di privacy che il browser abbia l'autorizzazione ad accedere alla fotocamera e al microfono.
              </p>
            </div>
          )}
          
          {!isStreaming && (
            <>
              <Input
                placeholder="Titolo della diretta"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                disabled={!cameraAvailable}
                className="w-full"
              />
              
              <Textarea
                placeholder="Descrizione (opzionale)"
                value={streamDescription}
                onChange={(e) => setStreamDescription(e.target.value)}
                disabled={!cameraAvailable}
                className="resize-none h-20"
              />
            </>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          {isStreaming ? (
            <>
              <Button
                type="button"
                variant="destructive"
                onClick={stopLiveStream}
              >
                <X className="mr-2 h-4 w-4" />
                Termina diretta
              </Button>
            </>
          ) : (
            <>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Annulla
                </Button>
              </DialogClose>
              
              <Button
                type="button"
                onClick={startLiveStream}
                disabled={!cameraAvailable || countdown !== null}
                className="bg-red-600 hover:bg-red-700"
              >
                {countdown !== null ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniziando...
                  </>
                ) : (
                  <>
                    <Radio className="mr-2 h-4 w-4" />
                    Inizia diretta
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LiveStreamModal;