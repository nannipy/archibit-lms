import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CouponActions } from './coupon-actions';

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/courses');
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
        _count: {
            select: { purchases: true }
        }
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Coupons</h1>
            <p className="text-muted-foreground text-lg">Manage discount coupons</p>
          </div>
          <Link
            href="/admin/coupons/create"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
          >
            Create Coupon
          </Link>
        </div>

        <div className="bg-card/50 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-8 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-8 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-8 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Usage
                  </th>
                   <th className="px-8 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5 font-mono font-medium text-foreground">
                      {coupon.code}
                    </td>
                    <td className="px-8 py-5 text-sm text-foreground">
                       {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `€${coupon.discountValue}`}
                    </td>
                    <td className="px-8 py-5 text-sm text-foreground">
                      {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        coupon.isActive 
                          ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-600 border border-red-500/20'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right text-sm">
                        <CouponActions couponId={coupon.id} />
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground">
                        No coupons found.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
