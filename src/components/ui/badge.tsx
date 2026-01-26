import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20",
        outline: 
          "text-foreground border-border",
        success:
          "border-transparent bg-success/10 text-success hover:bg-success/20 border-success/20",
        warning:
          "border-transparent bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
        info:
          "border-transparent bg-info/10 text-info hover:bg-info/20 border-info/20",
        neutral:
          "border-transparent bg-muted text-muted-foreground hover:bg-muted/80 border-border",
        // Aliases for backward compatibility
        error:
          "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Status mapping for automatic badge styling
const STATUS_VARIANT_MAP: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
  // General
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
  
  // Applications / Missions
  new: 'info',
  approved: 'success',
  rejected: 'destructive',
  completed: 'success',
  cancelled: 'destructive',
  
  // Finance
  income: 'success',
  expense: 'destructive',
  
  // Delivery
  delivered: 'success',
  in_progress: 'warning',
  in_transit: 'info',
  scheduled: 'info',
  ongoing: 'warning',
  
  // Other
  draft: 'neutral',
  blocked: 'destructive',
  failed: 'destructive',
  purchased: 'info',
  distributed: 'success',
  assigned: 'success',
  ordered: 'info',
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: string
}

function Badge({ className, variant, status, children, ...props }: BadgeProps) {
  // If status is provided, use the mapping
  const resolvedVariant = status 
    ? STATUS_VARIANT_MAP[status] || 'neutral'
    : variant

  return (
    <div className={cn(badgeVariants({ variant: resolvedVariant }), className)} {...props}>
      {children}
    </div>
  )
}

export { Badge, badgeVariants, STATUS_VARIANT_MAP }
