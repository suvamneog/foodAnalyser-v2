/* eslint-disable react/prop-types */
"use client"

import { cn } from "@/lib/utils"
import { createContext, useState, useContext, useRef, useEffect } from "react"

const MouseEnterContext = createContext({
  mouseX: 0,
  mouseY: 0,
  isMouseEnter: false,
})

export const CardContainer = ({
  children,
  className,
  containerClassName,
}) => {
  const containerRef = useRef(null)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [isMouseEnter, setIsMouseEnter] = useState(false)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMouseX(e.clientX - rect.left)
    setMouseY(e.clientY - rect.top)
  }

  return (
    <div
      className={cn("px-8 py-4", containerClassName)}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsMouseEnter(true)}
      onMouseLeave={() => setIsMouseEnter(false)}
    >
      <MouseEnterContext.Provider value={{ mouseX, mouseY, isMouseEnter }}>
        <div className={cn("relative", className)}>{children}</div>
      </MouseEnterContext.Provider>
    </div>
  )
}

export const CardBody = ({
  children,
  className,
}) => {
  const { mouseX, mouseY, isMouseEnter } = useContext(MouseEnterContext)
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    let transform = "none"
    if (isMouseEnter) {
      const rotateX = (mouseY - centerY) / 30
      const rotateY = (mouseX - centerX) / 30
      transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`
    }

    ref.current.style.transform = transform
  }, [mouseX, mouseY, isMouseEnter])

  return (
    <div
      ref={ref}
      className={cn("w-full h-full transition-all duration-300 ease-out [transform-style:preserve-3d]", className)}
    >
      {children}
    </div>
  )
}

export const CardItem = ({
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  as: Component = "div",
  ...rest
}) => {
  const { isMouseEnter } = useContext(MouseEnterContext)
  const transform = isMouseEnter
    ? `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
    : "none"

  return (
    <Component className={cn("transition-transform duration-200 ease-out", className)} style={{ transform }} {...rest}>
      {children}
    </Component>
  )
}