import React from "react";

import { cn } from "../../../lib/utils";

export interface TruncateProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Custom tooltip text. Defaults to the textual content (if string).
   */
  title?: string;
}

export function Truncate({ children, className, title, ...props }: TruncateProps) {
  const fallbackTitle = React.useMemo(() => {
    if (typeof children === "string") {
      return children;
    }
    return undefined;
  }, [children]);

  return (
    <span
      className={cn("inline-flex min-w-0 max-w-full truncate", className)}
      title={title ?? fallbackTitle}
      {...props}
    >
      {children}
    </span>
  );
}

