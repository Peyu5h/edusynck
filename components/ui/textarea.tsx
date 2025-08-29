import * as React from "react";

import { ny } from "~/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={ny(
          "flex min-h-[80px] w-full rounded-md border-0 bg-accent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
