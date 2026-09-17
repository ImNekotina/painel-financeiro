import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={!!error}
        className={cn(
          "h-10 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors",
          "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
          error
            ? "border-red-400 dark:border-red-500"
            : "border-slate-200 dark:border-slate-700",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
