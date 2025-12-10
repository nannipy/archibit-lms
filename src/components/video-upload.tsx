'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileVideo, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VideoUploadProps {
    value: string;
    onChange: (url: string) => void;
    onDurationChange?: (duration: number) => void;
    courseId: string;
}

export function VideoUpload({ value, onChange, onDurationChange, courseId }: VideoUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            await handleUpload(file);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleUpload(file);
        }
    };

    const extractDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = function () {
                window.URL.revokeObjectURL(video.src);
                resolve(Math.round(video.duration));
            };
            video.src = URL.createObjectURL(file);
        });
    };

    const xhrRef = useRef<XMLHttpRequest | null>(null);

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith('video/')) {
            toast.error('Please upload a video file');
            return;
        }

        try {
            setIsUploading(true);
            setProgress(0);

            // Extract duration
            if (onDurationChange) {
                const duration = await extractDuration(file);
                onDurationChange(duration);
            }

            // Path structure: courses/{courseId}/{timestamp}-{filename}
            const timestamp = new Date().getTime();
            const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
            const filePath = `courses/${courseId}/${timestamp}-${cleanFileName}`;

            // Get session token for authentication
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('No active session');
            }

            const xhr = new XMLHttpRequest();
            xhrRef.current = xhr;

            const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('://')[1].split('.')[0];
            const uploadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/course-videos/${filePath}`;

            xhr.upload.onprogress = (event) => {
                 if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setProgress(Math.round(percentComplete));
                }
            };

            xhr.onload = async () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                     // Get public URL
                     const { data: { publicUrl } } = supabase.storage
                        .from('course-videos')
                        .getPublicUrl(filePath);

                     onChange(publicUrl);
                     toast.success('Video uploaded successfully');
                     setIsUploading(false);
                } else {
                    console.error('Upload failed:', xhr.responseText);
                    toast.error('Failed to upload video');
                    setIsUploading(false);
                    setProgress(0);
                }
            };

            xhr.onerror = () => {
                console.error('XHR error');
                toast.error('Network error during upload');
                setIsUploading(false);
                 setProgress(0);
            };

            xhr.onabort = () => {
                toast('Upload cancelled');
                setIsUploading(false);
                setProgress(0);
            };

            xhr.open('POST', uploadUrl);
            xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
            xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
            // Supabase storage requires explicit content-type sometimes, or it autosniffs. 
            // Better to set it for video.
            xhr.setRequestHeader('Content-Type', file.type); 
            // Default cache control
            xhr.setRequestHeader('x-cache-control', '3600');

            xhr.send(file);

        } catch (error) {
            console.error('Upload init error:', error);
            toast.error('Failed to start upload');
            setIsUploading(false);
        }
    };

    const handleCancelUpload = () => {
        if (xhrRef.current) {
            xhrRef.current.abort();
            xhrRef.current = null;
        }
    };

    const handleRemove = () => {
        onChange('');
        if (onDurationChange) onDurationChange(0);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="space-y-4 w-full">
            {value ? (
                <div className="relative border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <FileVideo className="h-6 w-6" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">
                                {value.split('/').pop()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Video uploaded
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemove}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-10 cursor-pointer transition-colors",
                        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
                        isUploading && "pointer-events-none opacity-60"
                    )}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <div className="p-4 rounded-full bg-muted">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Drop your video here or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground">
                                MP4, WebM up to 1GB
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isUploading && (
                <div className="space-y-2">
                     <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                             <span>Uploading... {progress}%</span>
                        </div>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-1 text-muted-foreground hover:text-destructive"
                            onClick={handleCancelUpload}
                        >
                            Cancel
                        </Button>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            )}
        </div>
    );
}
