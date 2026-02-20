import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'peer block min-h-[120px] w-full appearance-none rounded-none border-b-2 border-glass-border bg-transparent px-0 py-2.5 text-base text-text-primary ring-offset-background placeholder:text-muted-foreground transition-all duration-200 focus:border-electric-cyan focus:outline-none focus:ring-0 focus:shadow-[0_1px_0_0_hsl(var(--electric-cyan))]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};