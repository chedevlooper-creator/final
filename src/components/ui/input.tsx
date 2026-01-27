import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean
  /** ID of element describing the input for accessibility */
  "aria-describedby"?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, "aria-invalid": ariaInvalid, ...props }, ref) => {
    return (
      <input
        type={type}
        aria-invalid={ariaInvalid ?? error}
        className={cn(
          "flex h-10 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-soft transition-all duration-200",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Error state
          error && "border-danger focus-visible:ring-danger/20 focus-visible:border-danger",
          // Remove default spinner for number inputs
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
