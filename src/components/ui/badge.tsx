import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-[#FEE2E2] text-[#991B1B] dark:bg-red-900/50 dark:text-red-300",
        outline: "text-foreground",
        pending: "border-transparent bg-[#FEF3C7] text-[#92400E] dark:bg-yellow-900/50 dark:text-yellow-300",
        approved: "border-transparent bg-[#D1FAE5] text-[#065F46] dark:bg-green-900/50 dark:text-green-300",
        review: "border-transparent bg-[#DBEAFE] text-[#1E40AF] dark:bg-blue-900/50 dark:text-blue-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
