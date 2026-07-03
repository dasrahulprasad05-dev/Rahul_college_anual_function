import { c as cn } from './button-DRsC1qZi.mjs';
import * as React from 'react';
import { jsx } from 'react/jsx-runtime';
import { cva } from 'class-variance-authority';
import * as LabelPrimitive from '@radix-ui/react-label';

var Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return /* @__PURE__ */ jsx("input", {
    type,
    className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
    ref,
    ...props
  });
});
Input.displayName = "Input";
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(LabelPrimitive.Root, {
  ref,
  className: cn(labelVariants(), className),
  ...props
}));
Label.displayName = LabelPrimitive.Root.displayName;

export { Input as I, Label as L };
//# sourceMappingURL=label-CmIE8x5o.mjs.map
