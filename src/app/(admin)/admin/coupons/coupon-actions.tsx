'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteCoupon } from './actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

interface CouponActionsProps {
    couponId: string;
}

export function CouponActions({ couponId }: CouponActionsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;

        startTransition(async () => {
            try {
                await deleteCoupon(couponId);
                toast.success('Coupon deleted');
                router.refresh();
            } catch (error) {
                toast.error('Failed to delete coupon');
            }
        });
    };

    return (
        <div className="flex items-center justify-end gap-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isPending}
                className="text-muted-foreground hover:text-destructive"
            >
               <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
