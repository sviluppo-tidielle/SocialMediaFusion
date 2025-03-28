import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Assicurati che le directory di upload esistano
const uploadDir = path.join(process.cwd(), 'uploads');
const profileImagesDir = path.join(uploadDir, 'profile-images');
const postsMediaDir = path.join(uploadDir, 'posts');
const videosDir = path.join(uploadDir, 'videos');
const storiesDir = path.join(uploadDir, 'stories');

// Crea le directory se non esistono
[uploadDir, profileImagesDir, postsMediaDir, videosDir, storiesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configurazione dello storage per multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determina la destinazione in base al tipo di upload
    const uploadType = req.path.split('/')[2]; // Il formato del path sarà /api/uploads/[tipo]
    let dest = uploadDir;
    
    switch (uploadType) {
      case 'profile':
        dest = profileImagesDir;
        break;
      case 'post':
        dest = postsMediaDir;
        break;
      case 'video':
        dest = videosDir;
        break;
      case 'story':
        dest = storiesDir;
        break;
    }
    
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Genera un nome di file unico
    const userId = req.user?.id || 'anonymous';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${userId}-${timestamp}${ext}`;
    cb(null, filename);
  }
});

// Filtro per controllare i tipi di file accettati
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Controlla il tipo di upload e verifica che il tipo di file sia appropriato
  const uploadType = req.path.split('/')[2];
  const mimeType = file.mimetype;
  
  if (uploadType === 'profile' && !mimeType.startsWith('image/')) {
    cb(new Error('Solo le immagini sono accettate per l\'immagine del profilo'));
    return;
  }
  
  if ((uploadType === 'post' || uploadType === 'story') && 
      !mimeType.startsWith('image/') && 
      !mimeType.startsWith('video/') && 
      !mimeType.startsWith('audio/')) {
    cb(new Error('Solo immagini, video e audio sono accettati'));
    return;
  }
  
  if (uploadType === 'video' && !mimeType.startsWith('video/')) {
    cb(new Error('Solo i video sono accettati per upload di tipo video'));
    return;
  }
  
  cb(null, true);
};

// Configurazione multer con limiti
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  }
});

// Middleware per gestire gli errori di multer
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'File troppo grande',
        message: 'Il file caricato supera il limite di 50MB'
      });
    }
    return res.status(400).json({ 
      error: err.code,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({ 
      error: 'File non valido',
      message: err.message
    });
  }
  
  next();
};

export default upload;