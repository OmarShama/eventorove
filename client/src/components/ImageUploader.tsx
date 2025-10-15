import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface UploadFile extends File {
  preview?: string;
  id: string;
  caption?: string;
  alt?: string;
  isMain?: boolean;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface ImageUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: Array<{ file: File; caption?: string; alt?: string; isMain?: boolean }>) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  existingImageCount?: number;
}

export default function ImageUploader({
  isOpen,
  onClose,
  onUpload,
  maxFiles = 20,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  existingImageCount = 0,
}: ImageUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const maxAllowedFiles = maxFiles - existingImageCount;

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(rejected => {
        const error = rejected.errors[0];
        return `${rejected.file.name}: ${error.message}`;
      }).join('\n');

      alert(`Some files were rejected:\n${errors}`);
    }

    // Process accepted files
    const newFiles: UploadFile[] = acceptedFiles.map((file, index) => ({
      ...file,
      id: Date.now().toString() + index,
      preview: URL.createObjectURL(file),
      caption: '',
      alt: '',
      isMain: false,
      uploadProgress: 0,
      uploadStatus: 'pending',
    }));

    setFiles(prevFiles => {
      const totalFiles = prevFiles.length + newFiles.length;
      if (totalFiles > maxAllowedFiles) {
        alert(`You can only upload ${maxAllowedFiles} more images (${maxFiles} total limit)`);
        return prevFiles.slice(0, maxAllowedFiles);
      }
      return [...prevFiles, ...newFiles];
    });
  }, [maxAllowedFiles, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFileTypes.map(type => type.replace('image/', '.'))
    },
    maxSize: maxFileSize,
    maxFiles: maxAllowedFiles,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeFile = (fileId: string) => {
    setFiles(prevFiles => {
      const fileToRemove = prevFiles.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter(f => f.id !== fileId);
    });
  };

  const updateFileDetails = (fileId: string, updates: Partial<UploadFile>) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId ? { ...file, ...updates } : file
      )
    );
  };

  const setMainImage = (fileId: string) => {
    setFiles(prevFiles =>
      prevFiles.map(file => ({
        ...file,
        isMain: file.id === fileId,
      }))
    );
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // Simulate upload progress for each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        updateFileDetails(file.id, { uploadStatus: 'uploading' });

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          updateFileDetails(file.id, { uploadProgress: progress });
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        updateFileDetails(file.id, { uploadStatus: 'success' });
      }

      // Prepare upload data
      const uploadData = files.map(file => ({
        file,
        caption: file.caption || undefined,
        alt: file.alt || undefined,
        isMain: file.isMain || false,
      }));

      await onUpload(uploadData);

      // Clean up
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      // Mark all files as error
      setFiles(prevFiles =>
        prevFiles.map(file => ({ ...file, uploadStatus: 'error' as const }))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleClose = () => {
    if (!isUploading) {
      // Clean up object URLs
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      setFiles([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Venue Images
          </DialogTitle>
          <DialogDescription>
            Upload high-quality images to showcase your venue. You can upload up to {maxAllowedFiles} more images.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          {files.length < maxAllowedFiles && !isUploading && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${dragActive || isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop images here or click to browse
              </h3>
              <p className="text-gray-600 mb-4">
                Supports JPG, PNG, and WebP files up to {formatFileSize(maxFileSize)} each
              </p>
              <Button variant="outline">
                <ImageIcon className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selected Images ({files.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {files.map((file) => (
                    <div key={file.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        {/* Preview */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {file.preview && (
                            <img
                              src={file.preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium truncate">{file.name}</h4>
                              <p className="text-sm text-gray-600">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {file.isMain && (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600">
                                  Main Image
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(file.id)}
                                disabled={isUploading}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Upload Progress */}
                          {file.uploadStatus === 'uploading' && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Uploading... {file.uploadProgress}%</span>
                              </div>
                              <Progress value={file.uploadProgress} className="h-2" />
                            </div>
                          )}

                          {/* Upload Status */}
                          {file.uploadStatus === 'success' && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">Uploaded successfully</span>
                            </div>
                          )}

                          {file.uploadStatus === 'error' && (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">{file.error || 'Upload failed'}</span>
                            </div>
                          )}

                          {/* File Details Form */}
                          {file.uploadStatus !== 'uploading' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor={`caption-${file.id}`} className="text-xs">
                                  Caption (Optional)
                                </Label>
                                <Input
                                  id={`caption-${file.id}`}
                                  placeholder="Brief description of the image"
                                  value={file.caption || ''}
                                  onChange={(e) => updateFileDetails(file.id, { caption: e.target.value })}
                                  disabled={isUploading}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`alt-${file.id}`} className="text-xs">
                                  Alt Text (Optional)
                                </Label>
                                <Input
                                  id={`alt-${file.id}`}
                                  placeholder="Accessibility description"
                                  value={file.alt || ''}
                                  onChange={(e) => updateFileDetails(file.id, { alt: e.target.value })}
                                  disabled={isUploading}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {/* Main Image Toggle */}
                          {file.uploadStatus !== 'uploading' && existingImageCount === 0 && (
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`main-${file.id}`} className="text-sm">
                                Set as main venue image
                              </Label>
                              <Switch
                                id={`main-${file.id}`}
                                checked={file.isMain || false}
                                onCheckedChange={() => setMainImage(file.id)}
                                disabled={isUploading}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Guidelines */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <h4 className="font-medium mb-2">Image Guidelines</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Upload high-quality images (minimum 1024×768 pixels recommended)</li>
                    <li>• Use good lighting and clear, uncluttered compositions</li>
                    <li>• Show different angles and areas of your venue</li>
                    <li>• The main image will be used as the primary venue photo</li>
                    <li>• Maximum file size: {formatFileSize(maxFileSize)} per image</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} Image{files.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
