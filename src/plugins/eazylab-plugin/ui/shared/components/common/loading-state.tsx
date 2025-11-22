import { Loader2 } from "lucide-react";

type LoadingSize = "sm" | "md" | "lg";
type LoadingLayout = "inline" | "stacked";

export interface LoadingStateProps {
  label?: string;
  description?: string;
  size?: LoadingSize;
  layout?: LoadingLayout;
  minHeight?: number;
  className?: string;
}

const sizeMap: Record<LoadingSize, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-10",
};

const gapMap: Record<LoadingSize, string> = {
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
};

export function LoadingState({
  label = "Loading...",
  description,
  size = "md",
  layout = "stacked",
  minHeight,
  className,
}: LoadingStateProps) {
  const base =
    layout === "inline"
      ? "inline-flex items-center text-sm text-left"
      : "flex flex-col items-center justify-center text-center";
  const containerClass = [base, gapMap[size], className].filter(Boolean).join(" ");

  return (
    <div className={containerClass} role="status" aria-live="polite" style={minHeight ? { minHeight } : undefined}>
      <Loader2 className={`animate-spin text-muted-foreground ${sizeMap[size]}`} />
      <div
        className={
          layout === "inline"
            ? "flex flex-col leading-tight"
            : "flex flex-col items-center justify-center space-y-1"
        }
      >
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {description ? <p className="text-xs text-muted-foreground/80">{description}</p> : null}
      </div>
    </div>
  );
}

