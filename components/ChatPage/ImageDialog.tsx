import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "~/components/ui/dialog";
import Image from "next/image";

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
}

const ImageDialog: React.FC<ImageDialogProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
        <DialogHeader className="absolute right-2 top-2 z-10">
          <button
            onClick={onClose}
            className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="relative flex h-full w-full items-center justify-center bg-black">
          <Image
            src={imageUrl}
            alt={imageName}
            width={800}
            height={600}
            className="max-h-full max-w-full object-contain"
            priority
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-white">
          <p className="truncate text-center text-sm">{imageName}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDialog;
