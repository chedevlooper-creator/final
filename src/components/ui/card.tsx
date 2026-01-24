import * as React from "react"

import { cn } from "@/lib/utils"

// Card variants for different styles
const cardVariants = {
  default: "rounded-xl border bg-card text-card-foreground shadow-soft",
  elevated: "rounded-xl border bg-card text-card-foreground shadow-medium",
  flat: "rounded-xl border bg-card text-card-foreground shadow-none",
  interactive: "rounded-xl border bg-card text-card-foreground shadow-soft card-interactive cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none focus-visible:ring-offset-2",
  glass: "rounded-xl border bg-card/80 text-card-foreground shadow-soft backdrop-blur-sm",
  gradient: "rounded-xl border-0 bg-gradient-surface text-card-foreground shadow-medium",
}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: keyof typeof cardVariants
    interactive?: boolean
  }
>(({ className, variant = "default", interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      cardVariants[variant],
      "transition-all duration-200",
      className
    )}
    tabIndex={interactive || variant === "interactive" ? 0 : undefined}
    role={interactive || variant === "interactive" ? "button" : undefined}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
