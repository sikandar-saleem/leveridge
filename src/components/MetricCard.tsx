import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string
  subValue?: string
  trend?: "up" | "down" | "neutral"
  highlight?: "positive" | "negative" | "neutral"
  size?: "sm" | "md" | "lg"
}

export function MetricCard({
  label,
  value,
  subValue,
  trend,
  highlight = "neutral",
  size = "md",
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 space-y-1",
        highlight === "positive" && "border-green-200 bg-green-50",
        highlight === "negative" && "border-red-200 bg-red-50"
      )}
    >
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      <div className="flex items-end gap-1.5">
        <span
          className={cn(
            "font-bold leading-none",
            size === "sm" && "text-lg",
            size === "md" && "text-2xl",
            size === "lg" && "text-3xl",
            highlight === "positive" && "text-green-700",
            highlight === "negative" && "text-red-700"
          )}
        >
          {value}
        </span>
        {trend && (
          <span className="mb-0.5">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : trend === "down" ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : null}
          </span>
        )}
      </div>
      {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
    </div>
  )
}
