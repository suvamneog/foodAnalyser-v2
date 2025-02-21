/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import * as React from "react"
import { cva } from "class-variance-authority"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 shadow-lg [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&:has(svg)]:pl-12",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-red-500/50 bg-red-500/10 text-red-500 dark:border-red-500 [&>svg]:text-red-500",
        success: 
          "border-green-500/50 bg-green-500/10 text-green-500 dark:border-green-500 [&>svg]:text-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className = "", variant, icon, children, ...props }, ref) => {
  const Icon = {
    default: AlertCircle,
    destructive: XCircle,
    success: CheckCircle2
  }[variant] || AlertCircle

  return (
    <div
      ref={ref}
      role="alert"
      className={alertVariants({ variant, className })}
      {...props}
    >
      <Icon className="h-5 w-5" />
      {children}
    </div>
  )
})
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }