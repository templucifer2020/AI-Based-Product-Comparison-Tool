import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFilesSelect,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  disabled = false,
  className,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...uploadedFiles, ...acceptedFiles].slice(0, maxFiles);
    setUploadedFiles(newFiles);
    onFilesSelect(newFiles);
  }, [uploadedFiles, maxFiles, onFilesSelect]);

  const removeFile = (fileToRemove: File) => {
    const newFiles = uploadedFiles.filter(file => file !== fileToRemove);
    setUploadedFiles(newFiles);
    onFilesSelect(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles,
    disabled,
    multiple: true,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          "bg-gray-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? "Drop your images here" : "Drop your images here, or click to browse"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports JPG, PNG, WEBP up to {formatFileSize(maxSize)} each
            </p>
          </div>
          <Button
            type="button"
            variant="default"
            className="inline-flex items-center"
            disabled={disabled}
          >
            <Upload className="w-4 h-4 mr-2" />
            Select Images
          </Button>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Uploaded Images ({uploadedFiles.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(file)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
