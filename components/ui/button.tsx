"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-amber-500 text-slate-900 hover:bg-amber-400 focus-visible:ring-amber-500 shadow-lg shadow-amber-500/20",
        outline:
          "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:border-slate-600 focus-visible:ring-slate-500",
        ghost:
          "text-slate-300 hover:bg-slate-800 hover:text-slate-100 focus-visible:ring-slate-500",
        destructive:
          "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500",
        secondary:
          "bg-slate-800 text-slate-200 hover:bg-slate-700 focus-visible:ring-slate-500",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };