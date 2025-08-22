import React from "react";
import { Loader2, FileText, Eye } from "lucide-react";

interface DocumentLoaderProps {
  message?: string;
  showProgress?: boolean;
}

const DocumentLoader: React.FC<DocumentLoaderProps> = ({
  message = "Loading document...",
  showProgress = false,
}) => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="relative">
          <div className="animate-pulse">
            <FileText className="h-16 w-16 text-primary/60" />
          </div>
          <div className="absolute -bottom-1 -right-1">
            <div className="rounded-full bg-primary p-1">
              <Eye className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>

        <Loader2 className="h-8 w-8 animate-spin text-primary" />

        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">
            Preparing your document for the best viewing experience
          </p>
        </div>

        {showProgress && (
          <div className="w-64 space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full animate-pulse bg-primary transition-all duration-1000 ease-out"
                style={{ width: "60%" }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Optimizing document layout...
            </p>
          </div>
        )}

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="bg-green-500 h-2 w-2 rounded-full" />
            <span>Document retrieved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span>Preparing viewer...</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <span>Initializing tools</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentLoader;
