import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg hover:from-slate-600 hover:to-slate-700 hover:shadow-xl hover:scale-[1.02] border border-slate-600 hover:border-slate-500 active:scale-[0.98]",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:from-red-500 hover:to-red-600 hover:shadow-xl hover:scale-[1.02] border border-red-500 hover:border-red-400 active:scale-[0.98]",
        outline:
          "border border-slate-600 bg-slate-800/50 text-white shadow-lg hover:bg-slate-700/70 hover:border-slate-500 hover:shadow-xl hover:scale-[1.02] backdrop-blur-sm active:scale-[0.98]",
        secondary:
          "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg hover:from-slate-500 hover:to-slate-600 hover:shadow-xl hover:scale-[1.02] border border-slate-500 hover:border-slate-400 active:scale-[0.98]",
        ghost:
          "text-white hover:bg-slate-800/70 hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-slate-600 active:scale-[0.98]",
        link: "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300 hover:scale-[1.02] active:scale-[0.98]",
        primary:
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-500 hover:to-purple-500 hover:shadow-xl hover:scale-[1.02] border border-blue-500 hover:border-blue-400 active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
