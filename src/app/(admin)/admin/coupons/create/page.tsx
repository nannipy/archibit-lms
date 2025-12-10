import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CouponForm } from '../coupon-form';
import { revalidatePath } from 'next/cache';

export default async function CreateCouponPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user || user.role !== 'ADMIN') redirect('/courses');

  async function createCoupon(formData: FormData) {
    'use server';
    
    const code = (formData.get('code') as string).toUpperCase();
    const discountType = formData.get('discountType') as 'PERCENTAGE' | 'FIXED';
    const discountValue = parseFloat(formData.get('discountValue') as string);
    
    const expiresAtStr = formData.get('expiresAt') as string;
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;
    
    const maxUsesStr = formData.get('maxUses') as string;
    const maxUses = maxUsesStr ? parseInt(maxUsesStr) : null;
    
    const isActive = formData.get('isActive') === 'on';

    await prisma.coupon.create({
      data: {
        code,
        discountType,
        discountValue,
        expiresAt,
        maxUses,
        isActive,
      },
    });

    revalidatePath('/admin/coupons');
    redirect('/admin/coupons');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center h-16">
              <h1 className="text-xl font-medium text-gray-900">Create Coupon</h1>
           </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CouponForm action={createCoupon} submitLabel="Create Coupon" />
      </main>
    </div>
  );
}
