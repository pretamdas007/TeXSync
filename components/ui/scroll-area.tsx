'use client';

import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

import { cn } from '@/lib/utils';

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  viewportRef?: React.RefObject<HTMLDivElement>;
  scrollHideDelay?: number;
  type?: 'auto' | 'always' | 'scroll' | 'hover';
  smoothScroll?: boolean;
}

// Create a stable ref to prevent infinite loops
const createStableRef = <T extends any>(initialValue: T | null = null) => {
  const ref = React.useRef<T | null>(initialValue);
  return React.useMemo(() => ({
    get current() {
      return ref.current;
    },
    set current(value: T | null) {
      ref.current = value;
    }
  }), []);
};

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ 
  className, 
  children, 
  viewportRef,
  scrollHideDelay = 600,
  type = 'auto', // Changed default from 'hover' to 'auto'
  smoothScroll = false,
  ...props 
}, ref) => {
  // Create a stable local ref to prevent re-renders
  const localViewportRef = createStableRef<HTMLDivElement>();
  
  // Use a callback ref pattern instead of directly passing the ref
  const viewportRefCallback = React.useCallback((node: HTMLDivElement | null) => {
    // Update the local ref
    localViewportRef.current = node;
    
    // Update the provided viewportRef if it exists
    if (viewportRef && typeof viewportRef === 'object') {
      (viewportRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [viewportRef]);

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      type={type}
      scrollHideDelay={scrollHideDelay}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport 
        ref={viewportRefCallback}
        className={cn(
          "h-full w-full rounded-[inherit]",
          smoothScroll && "scroll-smooth"
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

// Enhanced scroll bar with improved styling and animation
const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors duration-200 ease-out',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
      orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-[1px]',
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb 
      className={cn(
        "relative flex-1 rounded-full bg-border",
        "hover:bg-border/80 active:bg-border/70",
        "transition-colors duration-150"
      )} 
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
