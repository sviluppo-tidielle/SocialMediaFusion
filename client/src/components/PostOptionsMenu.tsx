import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Flag, 
  Share, 
  BookmarkPlus,
  Link
} from 'lucide-react';

interface PostOptionsMenuProps {
  postId: number;
  isOwner: boolean;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onCopyLink?: (postId: number) => void;
}

const PostOptionsMenu: React.FC<PostOptionsMenuProps> = ({
  postId,
  isOwner,
  onEdit,
  onDelete,
  onShare,
  onCopyLink
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="text-slate-500 hover:text-slate-700 focus:outline-none" 
          aria-label="Post options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end">
        {isOwner && (
          <>
            <DropdownMenuItem 
              onClick={() => onEdit && onEdit(postId)}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              <span>Modifica post</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onDelete && onDelete(postId)}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Elimina post</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem
          onClick={() => onShare && onShare(postId)}
          className="cursor-pointer"
        >
          <Share className="mr-2 h-4 w-4" />
          <span>Condividi post</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onCopyLink && onCopyLink(postId)}
          className="cursor-pointer"
        >
          <Link className="mr-2 h-4 w-4" />
          <span>Copia link</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <BookmarkPlus className="mr-2 h-4 w-4" />
          <span>Salva post</span>
        </DropdownMenuItem>
        
        {!isOwner && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
              <Flag className="mr-2 h-4 w-4" />
              <span>Segnala post</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostOptionsMenu;