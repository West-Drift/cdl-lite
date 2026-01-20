// components/ui/dataset-download-modal.tsx
"use client";

import { useState, useCallback } from "react";
import { Download, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatasetDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetId: string;
  datasetTitle: string;
  onDownload: (datasetId: string) => void;
}

export function DatasetDownloadModal({
  isOpen,
  onClose,
  datasetId,
  datasetTitle,
  onDownload,
}: DatasetDownloadModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate download
    setTimeout(() => {
      onDownload(datasetId);
      setIsDownloading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Download Dataset</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Dataset:</p>
          <p className="font-medium">{datasetTitle}</p>
        </div>

        <div className="bg-input-background border-2 border-dashed border-border rounded-lg p-8 text-center mb-6">
          <Download className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-1">
            Click to download
          </p>
          <p className="text-xs text-muted-foreground">
            File will be available for 7 days
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            className="flex-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            disabled={isDownloading}
          >
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
        </div>
      </div>
    </div>
  );
}
