import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/format";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-semibold",
    "transition-all duration-200 cursor-pointer select-none",
    "disabled:opacity-50 disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-brand text-white",
          "hover:bg-brand-dark hover:shadow-brand-glow",
          "active:scale-[0.98]",
        ].join(" "),
        cta: [
          "bg-accent text-bg-base font-bold",
          "hover:bg-accent-dark hover:shadow-accent-glow",
          "active:scale-[0.98]",
        ].join(" "),
        secondary: [
          "border border-bg-border text-text-primary bg-bg-elevated",
          "hover:border-brand/50 hover:bg-bg-surface",
          "active:scale-[0.98]",
        ].join(" "),
        ghost: [
          "text-text-secondary bg-transparent",
          "hover:text-text-primary hover:bg-bg-surface",
        ].join(" "),
        danger: [
          "bg-error/10 text-error border border-error/30",
          "hover:bg-error hover:text-white",
        ].join(" "),
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
  /**
   * When true, renders children directly via Radix Slot — merges props
   * onto the child element instead of wrapping in a <button>.
   * Use for <Button asChild><Link href="...">Label</Link></Button>
   * This avoids the invalid <button><a> nesting React warning.
   */
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
      asChild = false,
      ...props
    },
    ref
  ) => {
    const buttonClasses = cn(buttonVariants({ variant, size, fullWidth, className }));
    const isSingleChild = React.Children.count(children) === 1;

    // When asChild is true, forward the button styles onto a single child element
    // (for example a Next.js Link) without rendering an extra wrapper.
    if (asChild && isSingleChild && React.isValidElement(children)) {
      const Comp = Slot;

      return (
        <Comp
          ref={ref as React.Ref<HTMLButtonElement>}
          className={buttonClasses}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={buttonClasses}
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
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
