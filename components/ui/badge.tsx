
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold transition-all duration-200 ease-smooth focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-orange-50 text-brand-primary hover:bg-orange-100",
        secondary:
          "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200",
        success:
          "border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        warning:
          "border-transparent bg-orange-100 text-orange-700 hover:bg-orange-200",
        destructive:
          "border-transparent bg-red-50 text-red-700 hover:bg-red-100",
        outline: "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  interactive?: boolean
}

function Badge({ className, variant, interactive, ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        badgeVariants({ variant }), 
        interactive && "cursor-pointer hover:scale-105 active:scale-95",
        className
      )} 
      {...props} 
    />
  )
}

export { Badge, badgeVariants }
