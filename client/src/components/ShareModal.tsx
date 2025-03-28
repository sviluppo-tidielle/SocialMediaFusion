import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Facebook, Twitter, Linkedin, Instagram, MessageSquare, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

interface ShareModalProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ postId, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const postUrl = `${window.location.origin}/post/${postId}`;
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: isOpen,
  });

  // Resetta lo stato copied quando si chiude il modal
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const shareToFacebook = () => {
    if (user?.facebookUrl) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, "_blank");
      toast({
        title: "Condivisione Facebook",
        description: "Il post è stato condiviso su Facebook",
      });
    } else {
      toast({
        title: "Link Facebook mancante",
        description: "Aggiungi il tuo URL Facebook nel profilo",
        variant: "destructive",
      });
    }
  };

  const shareToTwitter = () => {
    if (user?.twitterUrl) {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}`, "_blank");
      toast({
        title: "Condivisione Twitter",
        description: "Il post è stato condiviso su Twitter",
      });
    } else {
      toast({
        title: "Link Twitter mancante",
        description: "Aggiungi il tuo URL Twitter nel profilo",
        variant: "destructive",
      });
    }
  };

  const shareToLinkedin = () => {
    if (user?.linkedinUrl) {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, "_blank");
      toast({
        title: "Condivisione LinkedIn",
        description: "Il post è stato condiviso su LinkedIn",
      });
    } else {
      toast({
        title: "Link LinkedIn mancante",
        description: "Aggiungi il tuo URL LinkedIn nel profilo",
        variant: "destructive",
      });
    }
  };

  const shareToInstagram = () => {
    if (user?.instagramUrl) {
      toast({
        title: "Condivisione Instagram",
        description: "Link copiato negli appunti. Apri Instagram e incolla il link",
      });
      navigator.clipboard.writeText(postUrl);
    } else {
      toast({
        title: "Link Instagram mancante",
        description: "Aggiungi il tuo URL Instagram nel profilo",
        variant: "destructive",
      });
    }
  };

  const shareToWhatsapp = () => {
    if (user?.whatsappNumber) {
      window.open(`https://wa.me/?text=${encodeURIComponent(postUrl)}`, "_blank");
      toast({
        title: "Condivisione WhatsApp",
        description: "Il post è stato condiviso su WhatsApp",
      });
    } else {
      toast({
        title: "Numero WhatsApp mancante",
        description: "Aggiungi il tuo numero WhatsApp nel profilo",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    toast({
      title: "Link copiato",
      description: "Il link del post è stato copiato negli appunti",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Condividi post</DialogTitle>
          <DialogDescription>
            Condividi questo post con i tuoi amici e follower sui social network
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-6"
            onClick={shareToFacebook}
          >
            <Facebook className="h-6 w-6 text-blue-600 mb-2" />
            <span className="text-xs">Facebook</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-6"
            onClick={shareToTwitter}
          >
            <Twitter className="h-6 w-6 text-sky-500 mb-2" />
            <span className="text-xs">Twitter</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-6"
            onClick={shareToWhatsapp}
          >
            <MessageSquare className="h-6 w-6 text-green-500 mb-2" />
            <span className="text-xs">WhatsApp</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-6"
            onClick={shareToInstagram}
          >
            <Instagram className="h-6 w-6 text-pink-500 mb-2" />
            <span className="text-xs">Instagram</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-6"
            onClick={shareToLinkedin}
          >
            <Linkedin className="h-6 w-6 text-blue-700 mb-2" />
            <span className="text-xs">LinkedIn</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-6"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-6 w-6 text-green-500 mb-2" />
            ) : (
              <Copy className="h-6 w-6 text-gray-500 mb-2" />
            )}
            <span className="text-xs">Copia link</span>
          </Button>
        </div>
        
        <Separator />
        
        <div className="mt-4 text-sm text-center text-muted-foreground">
          Nota: Per condividere sui social media, assicurati di aver aggiunto i tuoi collegamenti ai social network nel tuo profilo.
        </div>
      </DialogContent>
    </Dialog>
  );
}