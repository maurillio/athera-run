import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'circular' | 'avatar'
}

export function Skeleton({ 
  className, 
  variant = 'default',
  ...props 
}: SkeletonProps) {
  const variantClasses = {
    default: 'h-4 w-full',
    card: 'h-32 w-full rounded-lg',
    text: 'h-3 w-full',
    circular: 'h-10 w-10 rounded-full',
    avatar: 'h-12 w-12 rounded-full',
  }

  return (
    <div
      className={cn(
        "skeleton rounded-md bg-slate-100",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="border border-slate-200 rounded-lg p-6 space-y-4 shadow-elevation-2">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton variant="text" className="w-2/3" />
        </div>
      </div>
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-4/5" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          <Skeleton variant="circular" className="h-8 w-8" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-6 space-y-3 shadow-elevation-1">
          <Skeleton variant="circular" className="h-10 w-10" />
          <Skeleton className="h-6 w-16" />
          <Skeleton variant="text" className="w-24" />
        </div>
      ))}
    </div>
  )
}
