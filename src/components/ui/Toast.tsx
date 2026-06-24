"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/format";

// ============================================================
// TYPES
// ============================================================

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

// ============================================================
// CONTEXT
// ============================================================

interface ToastContextValue {
  toast: (data: Omit<ToastData, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ============================================================
// PROVIDER
// ============================================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const toast = React.useCallback((data: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { ...data, id }]); // Max 5 toasts
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}

        {/* Toast items */}
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}

        {/* Viewport */}
        <ToastPrimitive.Viewport
          className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2
                     w-[90vw] max-w-sm outline-none"
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

// ============================================================
// SINGLE TOAST
// ============================================================

const variantConfig = {
  success: {
    icon: CheckCircle2,
    className: "border-success/30 bg-success/10",
    iconClass: "text-success",
  },
  error: {
    icon: AlertCircle,
    className: "border-error/30 bg-error/10",
    iconClass: "text-error",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-warning/30 bg-warning/10",
    iconClass: "text-warning",
  },
  info: {
    icon: Info,
    className: "border-brand/30 bg-brand/10",
    iconClass: "text-brand-light",
  },
};

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: () => void;
}) {
  const variant = t.variant ?? "info";
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <ToastPrimitive.Root
      duration={t.duration ?? 4000}
      onOpenChange={(open) => !open && onDismiss()}
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-2xl border",
        "shadow-card backdrop-blur-md",
        "data-[state=open]:animate-fade-in",
        "data-[state=closed]:opacity-0 data-[state=closed]:translate-x-4",
        "transition-all duration-200",
        "bg-bg-elevated",
        config.className
      )}
    >
      <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", config.iconClass)} />

      <div className="flex-1 min-w-0">
        <ToastPrimitive.Title className="text-sm font-semibold text-text-primary">
          {t.title}
        </ToastPrimitive.Title>
        {t.description && (
          <ToastPrimitive.Description className="text-xs text-text-muted mt-0.5 leading-relaxed">
            {t.description}
          </ToastPrimitive.Description>
        )}
      </div>

      <ToastPrimitive.Close
        onClick={onDismiss}
        className="shrink-0 p-1 rounded-lg text-text-muted hover:text-text-primary
                   hover:bg-bg-border transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}
