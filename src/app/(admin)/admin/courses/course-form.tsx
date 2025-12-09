'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CourseFormProps {
    initialData?: {
        id?: string;
        title: string;
        description: string;
        price: number;
        thumbnailUrl?: string | null;
        isPublished: boolean;
    };
    action: (data: FormData) => Promise<void>;
    submitLabel: string;
}

export function CourseForm({ initialData, action, submitLabel }: CourseFormProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            await action(formData);
            toast.success('Success');
            if (!initialData) {
                router.push('/admin/courses');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className='bg-card/50'>
            <CardContent className="pt-6 ">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            defaultValue={initialData?.title}
                            placeholder="e.g. Advanced Architectural Design"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            name="description"
                            required
                            defaultValue={initialData?.description}
                            placeholder="Course description..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Price (€)</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            defaultValue={initialData?.price}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                        <Input
                            id="thumbnailUrl"
                            name="thumbnailUrl"
                            defaultValue={initialData?.thumbnailUrl || ''}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                         <input
                            type="checkbox"
                            id="isPublished"
                            name="isPublished"
                            defaultChecked={initialData?.isPublished}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <Label htmlFor="isPublished">Publish immediately</Label>
                    </div>

                    <div className="flex justify-end gap-4">
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
                </form>
            </CardContent>
        </Card>
    );
}
