"use client";

import { ReactNode, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  icon,
  defaultOpen = true,
  children,
  className,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border rounded-lg bg-card shadow-sm", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium hover:bg-muted/50 transition-colors rounded-t-lg"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
        )}
        {icon}
        <span className="flex-1">{title}</span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-3 border-t border-border/50">
          {children}
        </div>
      )}
    </div>
  );
}
