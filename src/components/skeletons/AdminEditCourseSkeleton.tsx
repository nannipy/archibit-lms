import { Skeleton } from "@/components/ui/skeleton"


export function AdminEditCourseSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-24 w-full" />
               <Skeleton className="h-10 w-full" />
               <div className="flex gap-4">
                  <Skeleton className="h-10 w-1/2" />
                  <Skeleton className="h-10 w-1/2" />
               </div>
            </div>
        </section>

        <section>
             <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-9 w-24" />
             </div>
             
             <div className="bg-background rounded-lg border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="p-4 flex items-center justify-between">
                         <div>
                             <Skeleton className="h-5 w-48 mb-1" />
                             <Skeleton className="h-4 w-24" />
                         </div>
                         <Skeleton className="h-8 w-16" />
                     </div>
                   ))}
                </div>
             </div>
        </section>
      </main>
    </div>
  )
}
