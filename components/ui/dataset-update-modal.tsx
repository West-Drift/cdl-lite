// components/ui/dataset-update-modal.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, File, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ✅ Define proper TypeScript types
interface Dataset {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  timeline: string;
  size: string;
  records: string;
  formats: string[];
  lastUpdated: string;
}

interface DatasetUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: Dataset; // ✅ Specific type instead of 'any'
  onUpdate: (updatedDataset: Dataset) => void; // ✅ Specific type
}

export function DatasetUpdateModal({
  isOpen,
  onClose,
  dataset,
  onUpdate,
}: DatasetUpdateModalProps) {
  const [formData, setFormData] = useState({
    title: dataset.title,
    description: dataset.description,
    category: dataset.category,
    location: dataset.location,
    timeline: dataset.timeline,
  });

  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Move file input ref outside of conditional logic
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ useCallback moved outside conditional block
  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      setFile(droppedFiles[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const updatedDataset: Dataset = {
        ...dataset,
        ...formData,
        // Auto-computed fields (would be calculated by backend)
        size: file
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : dataset.size,
        records: file ? "1,234" : dataset.records, // Placeholder
        lastUpdated: new Date().toISOString().split("T")[0],
        formats: file
          ? [file.name.split(".").pop()?.toUpperCase() || dataset.formats[0]]
          : dataset.formats,
      };

      onUpdate(updatedDataset);
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  // ✅ Early return moved to bottom for readability
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Update Dataset</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: File Upload */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2">
                Upload New File
              </label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()} // ✅ Use ref
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-1">
                  Drag & drop file or click
                </p>
                <p className="text-xs text-muted-foreground">
                  CSV, GeoTIFF, GeoJSON, NetCDF
                </p>
                <input
                  ref={fileInputRef} // ✅ Assign ref
                  type="file"
                  className="hidden"
                  onChange={handleFileInput}
                  accept=".csv,.tif,.tiff,.geojson,.nc"
                />
              </div>

              {file && (
                <div className="mt-3 p-3 bg-input-background rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <File size={16} className="text-muted-foreground" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Right: Form Fields */}
            <div className="md:col-span-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Timeline
                  </label>
                  <Input
                    value={formData.timeline}
                    onChange={(e) =>
                      setFormData({ ...formData, timeline: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Dataset"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
