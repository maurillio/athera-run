
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-brand-primary text-white hover:bg-brand-primary-dark shadow-sm hover:shadow-elevation-2 hover:-translate-y-0.5",
        destructive:
          "bg-error text-white hover:bg-red-600 shadow-sm hover:shadow-elevation-2",
        outline:
          "border-2 border-slate-300 bg-background hover:bg-slate-50 hover:border-slate-400 hover:shadow-elevation-1",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 hover:shadow-elevation-1",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-brand-primary underline-offset-4 hover:underline hover:text-brand-primary-dark",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-11 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
