import { cn } from "@/lib/utils"
import type { DealScore } from "@/types/simulation"

const gradeConfig = {
  "A+": { ring: "ring-emerald-400", bg: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-50 border-emerald-200" },
  "A":  { ring: "ring-green-400",   bg: "bg-green-500",   text: "text-green-700",   light: "bg-green-50 border-green-200"   },
  "B+": { ring: "ring-blue-400",    bg: "bg-blue-500",    text: "text-blue-700",    light: "bg-blue-50 border-blue-200"     },
  "B":  { ring: "ring-sky-400",     bg: "bg-sky-500",     text: "text-sky-700",     light: "bg-sky-50 border-sky-200"       },
  "C":  { ring: "ring-amber-400",   bg: "bg-amber-500",   text: "text-amber-700",   light: "bg-amber-50 border-amber-200"   },
  "D":  { ring: "ring-orange-400",  bg: "bg-orange-500",  text: "text-orange-700",  light: "bg-orange-50 border-orange-200" },
  "F":  { ring: "ring-red-400",     bg: "bg-red-500",     text: "text-red-700",     light: "bg-red-50 border-red-200"       },
}

const metricLabels = {
  cashFlow: "Cash Flow",
  capRate:  "Cap Rate",
  dscr:     "DSCR",
  irr:      "IRR",
}

interface Props {
  score: DealScore
  isFlip?: boolean
}

export function DealGradeCard({ score, isFlip = false }: Props) {
  const cfg = gradeConfig[score.grade]

  return (
    <div className={cn("rounded-xl border-2 p-4 flex items-start gap-4", cfg.light)}>
      {/* Grade circle */}
      <div
        className={cn(
          "shrink-0 w-16 h-16 rounded-full flex items-center justify-center",
          "text-white font-black text-xl ring-4 ring-offset-2",
          cfg.bg, cfg.ring
        )}
      >
        {score.grade}
      </div>

      {/* Right side */}
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Deal Grade</p>
          <p className={cn("text-lg font-bold leading-tight", cfg.text)}>{score.label}</p>
        </div>

        {/* Score bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Composite Score</span>
            <span className="font-semibold">{score.score}/100</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", cfg.bg)}
              style={{ width: `${score.score}%` }}
            />
          </div>
        </div>

        {/* Breakdown mini-bars */}
        {!isFlip && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {(Object.keys(score.breakdown) as (keyof typeof score.breakdown)[]).map((k) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground w-16 shrink-0">{metricLabels[k]}</span>
                <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", cfg.bg)}
                    style={{ width: `${(score.breakdown[k] / 25) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-6 text-right">{score.breakdown[k]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
