'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { useDropzone } from 'react-dropzone';
import { File, X, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UseFieldArrayReturn } from 'react-hook-form';

interface FileUploaderProps {
  fieldArray: UseFieldArrayReturn<any, any, "id">;
  icon: ReactNode;
  accept: string;
}

export default function FileUploader({ fieldArray, icon, accept }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const { fields, append, remove } = fieldArray;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    append(acceptedFiles);
    setDragActive(false);
  }, [append]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragActive || dragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center">
            <div className="mx-auto mb-2">{icon}</div>
          <p className="font-semibold">
            Drag & drop files here, or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            Accepted files: {accept}
          </p>
        </div>
      </div>

      {fields.length > 0 && (
        <div className="space-y-2">
            <p className="text-sm font-medium">Uploaded files:</p>
          <ul className="space-y-2">
            {fields.map((field, index) => (
              <li key={field.id} className="flex items-center justify-between p-2 text-sm rounded-md bg-muted">
                <div className="flex items-center gap-2 truncate">
                    <File className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{(field as any as File).name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
