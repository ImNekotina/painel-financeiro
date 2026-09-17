import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        aria-invalid={!!error}
        className={cn(
          "h-10 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 transition-colors",
          "dark:bg-slate-900 dark:text-slate-100",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
          error
            ? "border-red-400 dark:border-red-500"
            : "border-slate-200 dark:border-slate-700",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
