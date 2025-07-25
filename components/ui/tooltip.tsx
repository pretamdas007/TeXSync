'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Add this component to your UI
const EngineHelp = () => (
  <div className="p-4 bg-gray-100 rounded-md text-sm mt-2">
    <h4 className="font-bold">Compiler options:</h4>
    <ul className="list-disc pl-5 space-y-1 mt-2">
      <li><strong>pdfLaTeX</strong>: Standard engine for most documents</li>
      <li><strong>XeLaTeX</strong>: Better for custom fonts and multilingual documents</li>
      <li><strong>LuaLaTeX</strong>: Advanced features for complex documents and programming</li>
    </ul>
  </div>
);

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, EngineHelp };
