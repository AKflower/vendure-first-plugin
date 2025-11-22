import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading data..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

