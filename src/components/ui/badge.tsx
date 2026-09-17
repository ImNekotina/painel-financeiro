import { cn } from "@/lib/utils";

export function Badge({
  className,
  color,
  children,
}: {
  className?: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        !color && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        className
      )}
      style={
        color
          ? { backgroundColor: `${color}1a`, color }
          : undefined
      }
    >
      {color && <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />}
      {children}
    </span>
  );
}
