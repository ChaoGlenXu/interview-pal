import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResumeUploadProps {
  onResumeText: (text: string) => void;
  resumeText: string;
  className?: string;
  label?: string;
  compact?: boolean;
}

export function ResumeUpload({ 
  onResumeText, 
  resumeText, 
  className,
  label = "Upload Resume",
  compact = false
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);
    
    try {
      // For text files, read directly
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text();
        onResumeText(text);
      } else {
        // For other files, read as text (basic support)
        const text = await file.text();
        onResumeText(text);
      }
    } catch (error) {
      console.error('Error reading file:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onResumeText]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const clearResume = () => {
    onResumeText('');
    setFileName(null);
  };

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label>{label} (Optional)</Label>
        {resumeText ? (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm flex-1 truncate">{fileName || 'Resume uploaded'}</span>
            <Button variant="ghost" size="icon" onClick={clearResume} className="h-6 w-6">
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="w-full gap-2" disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload Resume
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Label className="text-base font-medium">{label}</Label>
      
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          isProcessing && "opacity-50 pointer-events-none"
        )}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Processing...</p>
          </div>
        ) : resumeText ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            <p className="font-medium text-foreground">{fileName || 'Resume uploaded'}</p>
            <Button variant="ghost" size="sm" onClick={clearResume}>
              Remove
            </Button>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag & drop your resume here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports .txt, .pdf, .doc, .docx (text extraction for non-txt files is basic)
            </p>
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button variant="outline" size="sm" className="mt-3 relative">
              Browse Files
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileInput}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </Button>
          </>
        )}
      </div>

      {/* Or paste text */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 flex items-center">
          <div className="flex-1 border-t border-border" />
          <span className="px-3 text-xs text-muted-foreground bg-background">or paste your resume</span>
          <div className="flex-1 border-t border-border" />
        </div>
      </div>

      <Textarea
        placeholder="Paste your resume text here..."
        value={resumeText}
        onChange={(e) => onResumeText(e.target.value)}
        className="min-h-[150px] mt-6"
      />
    </div>
  );
}
