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

// ToastProvider component to manage toast state and provide context
export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  // Function to add a new toast
  const toast = React.useCallback(
    ({ variant = "default", ...props }) => {
      const id = Math.random().toString(36).substring(2, 9); // Generate a unique ID for the toast

      setToasts((prevToasts) => [
        ...prevToasts,
        { id, variant, ...props },
      ]);

      // Automatically dismiss the toast after 5 seconds
      setTimeout(() => {
        dismissToast(id);
      }, 5000);

      return id; // Return the toast ID for manual dismissal
    },
    []
  );

  // Function to dismiss a toast by ID
  const dismissToast = React.useCallback(
    (id) => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast, dismissToast, toasts }}>
      {children}
      <Toaster />
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