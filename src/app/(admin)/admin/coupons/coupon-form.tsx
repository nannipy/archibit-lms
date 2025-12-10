'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CouponFormProps {
    initialData?: {
        id?: string;
        code: string;
        discountType: 'PERCENTAGE' | 'FIXED';
        discountValue: number;
        expiresAt?: Date | null;
        maxUses?: number | null;
        isActive: boolean;
    };
    action: (data: FormData) => Promise<void>;
    submitLabel: string;
}

export function CouponForm({ initialData, action, submitLabel }: CouponFormProps) {
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
                router.push('/admin/coupons');
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
                        <Label htmlFor="code">Coupon Code</Label>
                        <Input
                            id="code"
                            name="code"
                            required
                            defaultValue={initialData?.code}
                            placeholder="e.g. SUMMER2024"
                            className="uppercase"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="discountType">Tipo Sconto</Label>
                            <div className="relative">
                                <select
                                    id="discountType"
                                    name="discountType"
                                    defaultValue={initialData?.discountType || 'PERCENTAGE'}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                >
                                    <option value="PERCENTAGE">Percentuale (%)</option>
                                    <option value="FIXED">Fisso (€)</option>
                                </select>
                                <svg className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="discountValue">Value</Label>
                             <Input
                                id="discountValue"
                                name="discountValue"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                defaultValue={initialData?.discountValue}
                                placeholder="e.g. 20"
                             />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                             <Label htmlFor="expiresAt">Expiry Date</Label>
                             <Input
                                id="expiresAt"
                                name="expiresAt"
                                type="datetime-local"
                                defaultValue={initialData?.expiresAt ? new Date(initialData.expiresAt).toISOString().slice(0, 16) : ''}
                             />
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="maxUses">Max Uses</Label>
                             <Input
                                id="maxUses"
                                name="maxUses"
                                type="number"
                                min="1"
                                defaultValue={initialData?.maxUses || ''}
                                placeholder="Unlimited"
                             />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                         <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            defaultChecked={initialData?.isActive ?? true}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <Label htmlFor="isActive">Active</Label>
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
