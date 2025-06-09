
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { toast } from '@/hooks/use-toast';

const FileUpload: React.FC = () => {
  const { setCurrentFile, currentFile } = useAppStore();
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File size must be less than 50MB');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Only .cbl and .cob files are supported');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCurrentFile({
          id: Date.now().toString(),
          name: file.name,
          type: file.type || 'text/plain',
          size: file.size,
          content,
          uploadedAt: new Date()
        });
        toast({
          title: "File uploaded successfully",
          description: `${file.name} is ready for analysis`
        });
      };
      
      reader.readAsText(file);
    }
  }, [setCurrentFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.cbl', '.cob']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
          }
          ${error ? 'border-destructive' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop your COBOL file here' : 'Upload COBOL File'}
            </h3>
            <p className="text-muted-foreground">
              Drag and drop your .cbl or .cob file, or click to browse
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Maximum file size: 50MB (.cbl, .cob). For larger files or ZIP archives, Use Version Control.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {currentFile && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">{currentFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(currentFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFile(null)}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
