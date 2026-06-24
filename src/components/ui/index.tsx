import * as React from "react";
import { cn } from "@/lib/utils/format";

// ============================================================
// INPUT
// ============================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, hint, leftElement, rightElement, id, ...props },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "input-base",
              leftElement && "pl-10",
              rightElement && "pr-10",
              error && "border-error focus:border-error focus:ring-error/30",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-error flex items-center gap-1">
            <span aria-hidden="true">✕</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// ============================================================
// TEXTAREA
// ============================================================

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "input-base resize-none min-h-[120px]",
            error && "border-error focus:border-error focus:ring-error/30",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-error flex items-center gap-1">
            <span aria-hidden="true">✕</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ============================================================
// BADGE
// ============================================================

import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva("badge", {
  variants: {
    variant: {
      default: "bg-bg-elevated text-text-secondary border border-bg-border",
      brand: "bg-brand/15 text-brand-light border border-brand/25",
      accent: "bg-accent/15 text-accent border border-accent/25",
      success: "bg-success/15 text-success border border-success/25",
      error: "bg-error/15 text-error border border-error/25",
      warning: "bg-warning/15 text-warning border border-warning/25",
      info: "bg-info/15 text-info border border-info/25",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// ============================================================
// SKELETON
// ============================================================

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-bg-elevated",
        className
      )}
      {...props}
    />
  );
}

// ============================================================
// SPINNER
// ============================================================

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  return (
    <svg
      className={cn("animate-spin text-brand", sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
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
  );
}

// ============================================================
// DIVIDER
// ============================================================

function Divider({ className }: { className?: string }) {
  return (
    <hr className={cn("border-bg-border", className)} />
  );
}

export { Input, Textarea, Badge, badgeVariants, Skeleton, Spinner, Divider };
