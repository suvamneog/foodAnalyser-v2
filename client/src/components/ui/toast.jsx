/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import * as React from "react";
import { Toaster as Sonner } from "sonner";

// Create a context for toast functionality
const ToastContext = React.createContext({ toast: () => {} });

// Toaster component to render the toast notifications
const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-neutral-950 group-[.toaster]:border-neutral-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-neutral-950 dark:group-[.toaster]:text-neutral-50 dark:group-[.toaster]:border-neutral-800",
          description: "group-[.toast]:text-neutral-500 dark:group-[.toast]:text-neutral-400",
          actionButton:
            "group-[.toast]:bg-neutral-900 group-[.toast]:text-neutral-50 dark:group-[.toast]:bg-neutral-50 dark:group-[.toast]:text-neutral-900",
          cancelButton:
            "group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-500 dark:group-[.toast]:bg-neutral-800 dark:group-[.toast]:text-neutral-400",
          success: "group-[.toaster]:bg-green-600 group-[.toaster]:text-white",
          error: "group-[.toaster]:bg-red-600 group-[.toaster]:text-white",
          warning: "group-[.toaster]:bg-amber-500 group-[.toaster]:text-white",
          info: "group-[.toaster]:bg-blue-500 group-[.toaster]:text-white",
        },
      }}
      {...props}
    />
  );
};

import { toast as sonnerToast } from "sonner";

// ToastProvider component to manage toast state and provide context
export function ToastProvider({ children }) {
  const toast = React.useCallback(({ title, description, variant = "default" }) => {
    const message = title || description || "";
    const opts = description && title ? { description } : undefined;

    if (variant === "destructive" || variant === "error") {
      return sonnerToast.error(message, opts);
    }
    if (variant === "success") {
      return sonnerToast.success(message, opts);
    }
    if (variant === "warning") {
      return sonnerToast.warning(message, opts);
    }
    return sonnerToast(message, opts);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismissToast: sonnerToast.dismiss }}>
      {children}
      <Toaster richColors position="top-center" />
    </ToastContext.Provider>
  );
}

// Custom hook to use toast functionality
export const useToast = () => {
  const context = React.useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};

// Export the toast function directly for convenience
export const toast = ({ variant = "default", ...props }) => {
  const { toast: showToast } = React.useContext(ToastContext);
  return showToast({ variant, ...props });
};

export default Toaster;