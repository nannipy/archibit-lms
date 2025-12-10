'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea'; // Assuming textarea exists or defaulting to Input
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { VideoUpload } from '@/components/video-upload';

interface LessonFormProps {
    initialData?: {
        id?: string;
        title: string;
        description: string | null;
        videoUrl: string;
        videoDuration: number;
        order: number;
    };
    courseId: string;
    action: (data: FormData) => Promise<void>;
    submitLabel: string;
    showDelete?: boolean;
    deleteAction?: () => Promise<void>;
}

export function LessonForm({ initialData, courseId, action, submitLabel, showDelete, deleteAction }: LessonFormProps) {
    const [loading, setLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
    const [videoDuration, setVideoDuration] = useState(initialData?.videoDuration || 0);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        // Add courseId to formData if needed, but usually passed via closure in server action or hidden input
        formData.append('courseId', courseId);
        
        try {
            await action(formData);
            toast.success('Success');
            if (!initialData?.id) {
                // If creating, go back to course page
                router.push(`/admin/courses/${courseId}`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteAction) return;
        if (!confirm('Are you sure you want to delete this lesson?')) return;

        setLoading(true);
        try {
            await deleteAction();
            toast.success('Lesson deleted');
            router.push(`/admin/courses/${courseId}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete lesson');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Lesson Title</Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            defaultValue={initialData?.title}
                            placeholder="e.g. Introduction to Variables"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={initialData?.description || ''}
                            placeholder="Lesson content summary..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Lesson Video</Label>
                        <VideoUpload
                            value={videoUrl}
                            onChange={(url) => setVideoUrl(url)}
                            onDurationChange={(duration) => setVideoDuration(duration)}
                            courseId={courseId}
                        />
                        <input type="hidden" name="videoUrl" value={videoUrl} />
                        <input type="hidden" name="videoDuration" value={videoDuration} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="order">Order</Label>
                        <Input
                            id="order"
                            name="order"
                            type="number"
                            min="1"
                            required
                            defaultValue={initialData?.order}
                            placeholder="1"
                        />
                    </div>

                    <div className="flex justify-between items-center">
                         {showDelete && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                Delete Lesson
                            </Button>
                        )}
                        <div className="flex gap-4 ml-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : submitLabel}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
