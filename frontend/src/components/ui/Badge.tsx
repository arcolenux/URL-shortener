import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "active" | "expired" | "expiring_soon" | "neutral" | "default";
}

export function Badge({ children, variant = "default", className, ...props }: BadgeProps) {
  const variantStyles = {
    active: "bg-emerald-50 text-success-emerald border-emerald-200/60",
    expired: "bg-rose-50 text-danger-rose border-rose-200/60",
    expiring_soon: "bg-amber-50 text-warning-amber border-amber-200/60",
    neutral: "bg-slate-100 text-text-slate border-slate-200",
    default: "bg-blue-50 text-primary-container border-blue-200/60",
  };

  const dotStyles = {
    active: "bg-success-emerald",
    expired: "bg-danger-rose",
    expiring_soon: "bg-warning-amber",
    neutral: "bg-slate-400",
    default: "bg-primary-container",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-2xs",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotStyles[variant])} />
      {children}
    </span>
  );
}
