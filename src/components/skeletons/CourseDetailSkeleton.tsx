import { Skeleton } from "@/components/ui/skeleton"


export function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">


      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Link */}
         <div className="mb-8">
           <Skeleton className="h-4 w-24 mb-4" />
           
           <div className="mt-4 flex flex-col lg:flex-row gap-8">
              {/* Info */}
              <div className="flex-1">
                 <Skeleton className="h-10 w-3/4 mb-2" />
                 <Skeleton className="h-6 w-full mb-1" />
                 <Skeleton className="h-6 w-5/6 mb-6" />

                 <div className="flex gap-4 mb-6">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                 </div>
              </div>

              {/* Card */}
              <div className="lg:w-80">
                 <Skeleton className="h-[300px] w-full rounded-lg" />
              </div>
           </div>
         </div>

         <Skeleton className="h-px w-full my-8" />

         {/* Content List */}
         <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-3">
               {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
               ))}
            </div>
         </div>
      </main>
    </div>
  )
}
