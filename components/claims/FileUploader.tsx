/**
 * File Uploader Component with Drag & Drop
 *
 * Supports multiple file uploads with progress, validation, and preview.
 * Optimized for evidence files (images, PDFs).
 */

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Upload,
  X,
  FileText,
  Image,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  file: File;
  name: string;
  type: 'image' | 'document' | 'satellite';
  size: number;
  url?: string; // For uploaded files
  uploadProgress?: number;
  error?: string;
}

interface FileUploaderProps {
  value?: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string;
  className?: string;
}

export type { UploadedFile };

const MAX_FILES_DEFAULT = 10;
const MAX_SIZE_DEFAULT = 20 * 1024 * 1024; // 20MB

export default function FileUploader({
  value = [],
  onChange,
  maxFiles = MAX_FILES_DEFAULT,
  maxSize = MAX_SIZE_DEFAULT,
  accept = "image/jpeg,image/png,image/jpg,application/pdf",
  className
}: FileUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getFileType = (file: File): UploadedFile['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'document';
    return 'document'; // default fallback
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File too large (${formatFileSize(file.size)}). Maximum ${formatFileSize(maxSize)}.`;
    }

    // Check file type
    const allowedTypes = accept.split(',');
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed: ${accept.replace(/,/g, ', ')}`;
    }

    // Check if file already exists
    const existingFileNames = [...value, ...uploadingFiles].map(f => f.name.toLowerCase());
    if (existingFileNames.includes(file.name.toLowerCase())) {
      return 'File with this name already exists.';
    }

    return null;
  };

  const simulateUploadProgress = (fileIndex: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 5; // Random progress increment
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setUploadingFiles(prev =>
          prev.map((f, idx) =>
            idx === fileIndex
              ? { ...f, uploadProgress: 100, url: URL.createObjectURL(f.file) }
              : f
          )
        );

        // Move to completed files after a short delay
        setTimeout(() => {
          setUploadingFiles(prev => {
            const completedFile = prev[fileIndex];
            const newUploading = prev.filter((_, idx) => idx !== fileIndex);

            if (completedFile) {
              onChange([...value, { ...completedFile, uploadProgress: undefined }]);
            }

            return newUploading;
          });
        }, 500);
      } else {
        setUploadingFiles(prev =>
          prev.map((f, idx) =>
            idx === fileIndex ? { ...f, uploadProgress: progress } : f
          )
        );
      }
    }, 200);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalFiles = value.length + uploadingFiles.length;
    const availableSlots = maxFiles - totalFiles;

    if (availableSlots <= 0) {
      toast.error(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    const filesToProcess = acceptedFiles.slice(0, availableSlots);
    const validFiles: File[] = [];
    const errors: string[] = [];

    filesToProcess.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    // Show errors for invalid files
    errors.forEach(error => toast.error(error));

    if (validFiles.length === 0) return;

    // Add valid files to uploading state
    const newUploadingFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      name: file.name,
      type: getFileType(file),
      size: file.size,
      uploadProgress: 0,
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Start upload simulation for each file
    newUploadingFiles.forEach((_, index) => {
      const fileIndex = uploadingFiles.length + index;
      setTimeout(() => simulateUploadProgress(fileIndex), Math.random() * 1000);
    });

    toast.success(`Starting upload of ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}`);
  }, [value, uploadingFiles, maxFiles, maxSize, accept]);

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => {
      acc[type.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          Evidence Files ({value.length + uploadingFiles.length}/{maxFiles})
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Select Files
        </Button>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
          }
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <div className="flex flex-col items-center gap-4">
          <Upload className={`h-12 w-12 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          <div className="space-y-2">
            <div className="text-lg font-medium">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </div>
            <div className="text-sm text-muted-foreground">
              or click to select files ({formatFileSize(maxSize)} max each)
            </div>
            <div className="text-xs text-muted-foreground">
              Support: JPG, PNG, PDF
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      {(value.length > 0 || uploadingFiles.length > 0) && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Files</Label>

          {/* Completed Files */}
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getFileIcon(file.file.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{formatFileSize(file.size)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {file.type}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0 hover:bg-red-100"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}

          {/* Uploading Files */}
          {uploadingFiles.map((file, index) => (
            <div
              key={`uploading-${index}`}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {file.uploadProgress === 100 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : file.error ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{formatFileSize(file.size)}</span>
                    {file.error && (
                      <span className="text-red-500">{file.error}</span>
                    )}
                  </div>
                  {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                    <Progress value={file.uploadProgress} className="h-1 mt-1" />
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeUploadingFile(index)}
                className="h-8 w-8 p-0 hover:bg-red-100"
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Requirements:</strong> At least one evidence file is required. Files will be securely stored
            and only accessible to authorized verifiers.
          </div>
        </div>
      </div>
    </div>
  );
}
