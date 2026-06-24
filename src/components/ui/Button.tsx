import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/format";

const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2 font-semibold",
    "transition-all duration-200 cursor-pointer select-none",
    "disabled:opacity-50 disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
    "font-body",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary — electric violet gradient
        primary: [
          "bg-brand text-white",
          "hover:bg-brand-dark hover:shadow-brand-glow",
          "active:scale-[0.98]",
        ].join(" "),

        // CTA — amber gradient (for purchase buttons)
        cta: [
          "bg-accent text-bg-base font-bold",
          "hover:bg-accent-dark hover:shadow-accent-glow",
          "active:scale-[0.98]",
        ].join(" "),

        // Secondary — outlined
        secondary: [
          "border border-bg-border text-text-primary bg-bg-elevated",
          "hover:border-brand/50 hover:bg-bg-surface",
          "active:scale-[0.98]",
        ].join(" "),

        // Ghost — minimal
        ghost: [
          "text-text-secondary bg-transparent",
          "hover:text-text-primary hover:bg-bg-surface",
        ].join(" "),

        // Danger
        danger: [
          "bg-error/10 text-error border border-error/30",
          "hover:bg-error hover:text-white",
        ].join(" "),

        // Link style
        link: [
          "text-brand underline-offset-4",
          "hover:underline hover:text-brand-light",
          "p-0 h-auto",
        ].join(" "),
      },
      size: {
        xs: "h-7 px-3 text-xs rounded-lg",
        sm: "h-9 px-4 text-sm rounded-xl",
        md: "h-11 px-5 text-sm rounded-xl",
        lg: "h-13 px-7 text-base rounded-2xl",
        xl: "h-15 px-8 text-lg rounded-2xl",
        icon: "h-9 w-9 rounded-xl",
        "icon-sm": "h-7 w-7 rounded-lg",
        "icon-lg": "h-11 w-11 rounded-xl",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
