"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const [isDark, setIsDark] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return

    // Get the phone frame container to constrain the animation
    const phoneFrame = document.getElementById("phone-frame")
    const isDesktop = window.matchMedia('(min-width: 768px)').matches

    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      // Fallback: just toggle theme without animation
      const newTheme = !isDark
      setIsDark(newTheme)
      document.documentElement.classList.toggle("dark")
      localStorage.setItem("theme", newTheme ? "dark" : "light")
      return
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        const newTheme = !isDark
        setIsDark(newTheme)
        document.documentElement.classList.toggle("dark")
        localStorage.setItem("theme", newTheme ? "dark" : "light")
      })
    })

    await transition.ready

    const buttonRect = buttonRef.current.getBoundingClientRect()

    // Button center position
    const x = buttonRect.left + buttonRect.width / 2
    const y = buttonRect.top + buttonRect.height / 2

    // If we're on desktop and have a phone frame, clip the animation to the phone frame
    if (isDesktop && phoneFrame) {
      const frameRect = phoneFrame.getBoundingClientRect()

      // Get the scale factor from the phone frame's transform
      const computedStyle = window.getComputedStyle(phoneFrame)
      const transform = computedStyle.transform
      let scale = 1
      if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/)
        if (matrix) {
          const values = matrix[1].split(', ')
          scale = parseFloat(values[0]) || 1
        }
      }

      // Calculate the inset values for clipping to phone frame (getBoundingClientRect returns visual bounds)
      const insetTop = frameRect.top
      const insetRight = window.innerWidth - frameRect.right
      const insetBottom = window.innerHeight - frameRect.bottom
      const insetLeft = frameRect.left

      // Border radius for the phone frame - 3rem = 48px, scaled appropriately
      // The visual border radius is also scaled, so we use the scaled value
      const baseBorderRadius = 48 // 3rem in pixels
      const borderRadius = baseBorderRadius * scale

      // Set CSS custom properties for the phone frame clip bounds (used by CSS)
      const root = document.documentElement
      root.style.setProperty('--phone-clip-top', `${insetTop}px`)
      root.style.setProperty('--phone-clip-right', `${frameRect.right}px`)
      root.style.setProperty('--phone-clip-bottom', `${frameRect.bottom}px`)
      root.style.setProperty('--phone-clip-left', `${insetLeft}px`)
      root.style.setProperty('--phone-border-radius', `${borderRadius}px`)

      // Calculate max radius to cover the phone frame from the button position
      const distanceToLeft = x - frameRect.left
      const distanceToRight = frameRect.right - x
      const distanceToTop = y - frameRect.top
      const distanceToBottom = frameRect.bottom - y

      const maxRadius = Math.hypot(
        Math.max(distanceToLeft, distanceToRight),
        Math.max(distanceToTop, distanceToBottom)
      )

      // Apply inset clip to the old view to bound it to phone frame
      document.documentElement.animate(
        {
          clipPath: [
            `inset(${insetTop}px ${insetRight}px ${insetBottom}px ${insetLeft}px round ${borderRadius}px)`,
            `inset(${insetTop}px ${insetRight}px ${insetBottom}px ${insetLeft}px round ${borderRadius}px)`,
          ],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-old(root)",
        }
      )

      // Create the circular reveal animation on the new view
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      )
    } else {
      // Mobile or no phone frame: animate across the full viewport
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      )
    }
  }, [isDark, duration])

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(className)}
      {...props}
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
