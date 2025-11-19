import { LucideIcon } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline"
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in",
      className
    )}>
      {Icon && (
        <div className="mb-4 rounded-full bg-slate-100 p-4">
          <Icon className="h-8 w-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-600 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || "default"}
          onClick={action.onClick}
          className={action.variant === "default" 
            ? "bg-gradient-to-r from-brand-primary to-brand-primary-light hover:from-brand-primary-dark hover:to-brand-primary" 
            : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

interface EmptyStateCardProps extends EmptyStateProps {
  border?: boolean
}

export function EmptyStateCard({
  border = true,
  ...props
}: EmptyStateCardProps) {
  return (
    <div className={cn(
      "rounded-lg py-8",
      border && "border border-slate-200 shadow-elevation-1"
    )}>
      <EmptyState {...props} />
    </div>
  )
}
