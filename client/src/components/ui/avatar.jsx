/* eslint-disable react/prop-types */
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef(({ className, variant = "none", ...props }, ref) => {
  const ringClass =
    variant === "close-friends"
      ? "bg-gradient-to-tr from-green-400 to-green-600"
      : variant === "normal"
      ? "bg-[conic-gradient(at_top_right,_#f09433,_#e6683c,_#dc2743,_#cc2366,_#bc1888,_#f09433)]"
      : "";

  return variant === "none" ? (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  ) : (
    <div
      className={cn(
        "h-14 w-14 rounded-full p-[2px]",
        ringClass,
        "flex items-center justify-center"
      )}
    >
      <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden">
        <AvatarPrimitive.Root
          ref={ref}
          className={cn("h-full w-full rounded-full overflow-hidden", className)}
          {...props}
        />
      </div>
    </div>
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("h-full w-full object-cover not-prose", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-neutral-100 text-sm font-medium dark:bg-neutral-800",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };