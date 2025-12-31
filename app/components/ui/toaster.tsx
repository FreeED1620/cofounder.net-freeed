"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        // Base styling
        const baseClasses =
          "border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3";

        // Variant styling based on toast type
        const variantClasses =
          variant === "destructive"
            ? "bg-orange-500 text-white border-orange-600" // warm orange for errors
            : "bg-yellow-400 text-black border-yellow-500"; // bright sunflower yellow for success/info

        return (
          <Toast
            key={id}
            {...props}
            duration={props.duration ?? 4000} // fallback to 4s if not set
            className={`${baseClasses} ${variantClasses}`}
          >
            <div className="grid gap-1">
              {title && (
                <ToastTitle className="font-semibold">{title}</ToastTitle>
              )}
              {description && (
                <ToastDescription className="text-sm opacity-90">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="ml-auto hover:bg-black/20 rounded-full px-2 py-1 transition" />
          </Toast>
        );
      })}
      <ToastViewport className="fixed bottom-4 right-4 flex flex-col gap-2" />
    </ToastProvider>
  );
}
