/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
// components/ui/toast.jsx
import * as React from "react"
import { Toaster as Sonner } from "sonner"

const ToastContext = React.createContext({ toast: () => {} })

export const Toaster = ({
  ...props
}) => {
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
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])

  const toast = React.useCallback(
    ({ variant = "default", ...props }) => {
      const id = Math.random().toString(36).substring(2, 9)
      
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, variant, ...props },
      ])
      
      return id
    },
    [setToasts]
  )

  const dismissToast = React.useCallback(
    (id) => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    },
    [setToasts]
  )

  return (
    <ToastContext.Provider value={{ toast, dismissToast, toasts }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  
  return context
}