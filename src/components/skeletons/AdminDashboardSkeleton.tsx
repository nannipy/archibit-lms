import { Skeleton } from "@/components/ui/skeleton"


export function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
         </div>

         <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-background rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                </div>
            ))}
         </div>
         
         <div className="bg-white rounded-lg border border-gray-200">
             <div className="px-6 py-4 border-b border-gray-200">
                 <Skeleton className="h-6 w-48" />
             </div>
             <div className="divide-y divide-gray-200">
                 {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="px-6 py-4 flex items-center justify-between">
                          <div>
                              <Skeleton className="h-5 w-32 mb-1" />
                              <Skeleton className="h-4 w-48" />
                          </div>
                          <Skeleton className="h-4 w-24" />
                      </div>
                 ))}
             </div>
         </div>
      </main>
    </div>
  )
}
