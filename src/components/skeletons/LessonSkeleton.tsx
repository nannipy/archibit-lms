import { Skeleton } from "@/components/ui/skeleton"


export function LessonSkeleton() {
  return (
    <div className="min-h-screen bg-background">


      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-6">
           <Skeleton className="h-4 w-40" />
        </div>

        {/* Title & Desc */}
        <div className="mb-6">
           <Skeleton className="h-8 w-3/4 mb-2" />
           <Skeleton className="h-4 w-full mb-1" />
           <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Video Player */}
        <div className="mb-8">
           <Skeleton className="aspect-video w-full rounded-lg" />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t pt-6">
           <Skeleton className="h-10 w-32" />
           <Skeleton className="h-10 w-32" />
        </div>
      </main>
    </div>
  )
}
