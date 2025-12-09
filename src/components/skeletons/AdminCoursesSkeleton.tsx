import { Skeleton } from "@/components/ui/skeleton"


export function AdminCoursesSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="flex items-center justify-between mb-8">
            <div>
               <Skeleton className="h-8 w-48 mb-2" />
               <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
         </div>

         <div className="bg-background rounded-lg border border-gray-200 overflow-hidden">
             <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                 <div className="flex justify-between">
                     <Skeleton className="h-4 w-1/4" />
                     <Skeleton className="h-4 w-1/6" />
                     <Skeleton className="h-4 w-1/6" />
                     <Skeleton className="h-4 w-1/6" />
                     <Skeleton className="h-4 w-1/6" />
                 </div>
             </div>
             <div className="divide-y divide-gray-200">
                 {[1, 2, 3, 4, 5].map((i) => (
                     <div key={i} className="px-6 py-4 flex justify-between items-center">
                         <div className="w-1/3">
                             <Skeleton className="h-5 w-3/4 mb-1" />
                             <Skeleton className="h-4 w-1/2" />
                         </div>
                         <Skeleton className="h-4 w-12" />
                         <Skeleton className="h-4 w-12" />
                         <Skeleton className="h-4 w-16" />
                         <Skeleton className="h-6 w-20 rounded-full" />
                         <Skeleton className="h-8 w-8" />
                     </div>
                 ))}
             </div>
         </div>
      </main>
    </div>
  )
}
