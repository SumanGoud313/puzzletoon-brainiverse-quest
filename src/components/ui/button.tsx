import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 game-button",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-neon hover:shadow-lg hover:scale-105 active:scale-95",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Game-specific variants
        cosmic: "bg-gradient-cosmic text-foreground shadow-cosmic hover:shadow-lg hover:scale-105 active:scale-95",
        energy: "bg-gradient-energy text-background shadow-neon hover:shadow-lg hover:scale-105 active:scale-95",
        joy: "bg-joy text-joy-foreground shadow-joy hover:shadow-lg hover:scale-105 active:scale-95",
        curiosity: "bg-curiosity text-curiosity-foreground shadow-neon hover:shadow-lg hover:scale-105 active:scale-95",
        sadness: "bg-sadness text-sadness-foreground shadow-cosmic hover:shadow-lg hover:scale-105 active:scale-95",
        anger: "bg-anger text-anger-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
        success: "bg-success text-success-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
        warning: "bg-warning text-warning-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
        premium: "bg-gradient-mystery text-foreground shadow-cosmic border-2 border-primary-glow hover:shadow-xl hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-16 rounded-xl px-12 text-lg",
        xl: "h-20 rounded-2xl px-16 text-xl",
        icon: "h-12 w-12",
        "icon-lg": "h-16 w-16",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
