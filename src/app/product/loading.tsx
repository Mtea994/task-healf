import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Skeleton */}
        <Skeleton className="aspect-square w-full rounded-lg" />

        {/* Details Skeleton */}
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-1/4" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-12 flex-grow" />
            <Skeleton className="h-12 w-12" />
          </div>
          <div className="pt-6 space-y-3">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
