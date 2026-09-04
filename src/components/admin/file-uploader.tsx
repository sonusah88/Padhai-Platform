'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface FileUploaderProps {
  bucketName: 'videos' | 'study_materials';
  acceptedTypes?: string;
  maxSizeBytes?: number;
  onUploadComplete: (publicUrl: string, fileMetadata: { name: string; size: number; type: string }) => void;
  label?: string;
}

export function FileUploader({
  bucketName,
  acceptedTypes = '*',
  maxSizeBytes = 50 * 1024 * 1024, // 50 MB
  onUploadComplete,
  label = 'Upload File',
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File size exceeds limit (${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB)`);
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);
    setProgress(20);

    try {
      const isSupabaseConfigured =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      let publicUrl = `https://storage.padhai.edu.np/${bucketName}/${fileName}`;

      if (isSupabaseConfigured) {
        const supabase = createClient();
        setProgress(40);
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
        if (urlData?.publicUrl) publicUrl = urlData.publicUrl;
      } else {
        // Simulated upload progress for local development
        await new Promise((resolve) => setTimeout(resolve, 600));
        setProgress(80);
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      setProgress(100);
      setUploadedFile({ name: file.name, size: file.size });
      onUploadComplete(publicUrl, {
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || 'unknown',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-[hsl(var(--foreground))]">{label}</label>

      {uploadedFile ? (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[hsl(var(--foreground))] truncate">{uploadedFile.name}</p>
              <p className="text-[10px] text-[hsl(var(--foreground-tertiary))]">
                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Uploaded
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUploadedFile(null)}
            className="p-1 text-[hsl(var(--foreground-tertiary))] hover:text-rose-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'p-6 rounded-xl border-2 border-dashed cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2',
            isDragging
              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary-light))]'
              : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--muted)/0.3)]'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] flex items-center justify-center">
            {bucketName === 'videos' ? <Film className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
          </div>

          <p className="text-xs font-semibold text-[hsl(var(--foreground))]">
            {isUploading ? `Uploading... ${progress}%` : 'Click to select or drag & drop file'}
          </p>
          <p className="text-[10px] text-[hsl(var(--foreground-tertiary))]">
            Bucket: <span className="font-mono">{bucketName}</span> • Max {(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB
          </p>

          {isUploading && (
            <div className="w-full max-w-xs h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden mt-1">
              <div
                className="h-full bg-[hsl(var(--primary))] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMessage}</span>
        </p>
      )}
    </div>
  );
}
