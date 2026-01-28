// components/MapSelector.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  MapPin,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileType,
} from "lucide-react";
import { MapCanvas } from "@/components/MapCanvas";

type UserRole = "public" | "registered" | "verified" | "admin";

interface MapSelectorProps {
  userRole: UserRole;
}

export function MapSelector({ userRole }: MapSelectorProps) {
  const [activeTab, setActiveTab] = useState<"map" | "custom">("map");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customRequestNotes, setCustomRequestNotes] = useState("");

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.name.endsWith(".shp") ||
        file.name.endsWith(".geojson") ||
        file.name.endsWith(".zip"))
    ) {
      setUploadedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Data Selection</CardTitle>
          <CardDescription>
            Select from pre-defined boundaries or upload your custom shapefile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "map" | "custom")}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-input-background border border-border p-0.5 rounded-xl">
              <TabsTrigger
                value="map"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=inactive]:hover:bg-muted data-[state=inactive]:text-muted-foreground"
              >
                <MapPin className="size-4 mr-2" />
                Select from Map
              </TabsTrigger>
              <TabsTrigger
                value="custom"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=inactive]:hover:bg-muted data-[state=inactive]:text-muted-foreground"
              >
                <Upload className="size-4 mr-2" />
                Upload Custom Boundary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="space-y-6">
              <MapCanvas />
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Area */}
                <div>
                  <Label className="mb-2 text-foreground">
                    Upload Shapefile or GeoJSON
                  </Label>
                  <div
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    {!uploadedFile ? (
                      <>
                        <Upload className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h4 className="text-foreground mb-2">
                          Drag and drop your file here
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          or click to browse
                        </p>
                        <input
                          type="file"
                          accept=".shp,.geojson,.zip"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          disabled={userRole === "public"}
                        />
                        <label htmlFor="file-upload">
                          <Button
                            type="button"
                            variant="outline"
                            asChild
                            disabled={userRole === "public"}
                          >
                            <span>Browse Files</span>
                          </Button>
                        </label>
                        <p className="text-xs text-muted-foreground mt-4">
                          Supported formats: Shapefile (.shp in .zip), GeoJSON
                          (.geojson)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Max file size: 50 MB
                        </p>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <FileType className="size-8 text-emerald-600 dark:text-emerald-400" />
                              <div className="text-left">
                                <p className="text-sm text-foreground">
                                  {uploadedFile.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={removeFile}
                              className="flex-shrink-0"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                          <CheckCircle2 className="size-5 text-primary mx-auto mb-2" />
                          <p className="text-sm text-foreground text-center">
                            File uploaded successfully
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {userRole === "public" && (
                    <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-4">
                      <div className="flex gap-2">
                        <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-900 dark:text-amber-100">
                          Custom shapefile uploads require a registered account.
                          Sign in or create an account to enable uploads.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Request Details */}
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="custom-notes"
                      className="mb-2 text-foreground"
                    >
                      Request Notes (Optional)
                    </Label>
                    <Textarea
                      id="custom-notes"
                      placeholder="Describe what data you need within your custom boundary..."
                      rows={6}
                      value={customRequestNotes}
                      onChange={(e) => setCustomRequestNotes(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Specify which datasets you need for this custom boundary.
                    </p>
                  </div>

                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <h4 className="text-sm text-foreground">
                      Custom Request Process
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Upload your shapefile or GeoJSON.</li>
                      <li>Add notes about required datasets.</li>
                      <li>Admin reviews and processes your boundary.</li>
                      <li>Data is clipped to your custom area.</li>
                      <li>You&apos;ll be notified when ready to download.</li>
                    </ol>
                  </div>

                  {uploadedFile && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        alert("Submit Custom Request");
                      }}
                      disabled={userRole === "public"}
                    >
                      <Upload className="size-4 mr-2" />
                      Submit Custom Request
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
