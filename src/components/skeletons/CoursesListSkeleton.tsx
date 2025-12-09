import { Skeleton } from "@/components/ui/skeleton"


export function CoursesListSkeleton() {
  return (
    <div className="min-h-screen bg-background">


        <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Skeleton className="h-10 w-48 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col border rounded-lg h-[300px] bg-card text-card-foreground shadow-sm">
                        <div className="p-6 flex flex-col space-y-1.5">
                             <div className="flex justify-between mb-2">
                                 <Skeleton className="h-5 w-16" />
                                 <Skeleton className="h-5 w-12" />
                             </div>
                             <Skeleton className="h-6 w-3/4" />
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-5/6" />
                        </div>
                        <div className="p-6 pt-0 flex-1">
                             <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="p-6 pt-0 flex gap-2">
                             <Skeleton className="h-9 flex-1" />
                             <Skeleton className="h-9 flex-1" />
                        </div>
                    </div>
                ))}
            </div>
        </main>
    </div>
  )
}
