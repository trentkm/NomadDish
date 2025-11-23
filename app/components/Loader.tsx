"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function Loader() {
  return (
    <div className="glass-panel p-6 space-y-4">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-3/5" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-3 w-full" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}
