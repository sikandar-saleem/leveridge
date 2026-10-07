import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
import type { ScenarioResult } from "@/types/simulation"

interface Props {
  scenarios: ScenarioResult[]
}

const SCENARIO_COLORS = {
  Bear: "#ef4444",
  Base: "#3b82f6",
  Bull: "#22c55e",
}

const SCENARIO_BADGES = {
  Bear: "destructive" as const,
  Base: "secondary" as const,
  Bull: "success" as const,
}

function CompareRow({
  label,
  bear,
  base,
  bull,
  format = "currency",
}: {
  label: string
  bear: number
  base: number
  bull: number
  format?: "currency" | "percent" | "number"
}) {
  const fmt = (v: number) =>
    format === "currency" ? formatCurrency(v) :
    format === "percent"  ? formatPercent(v) :
    v.toFixed(1)

  return (
    <tr className="border-b hover:bg-muted/30">
      <td className="py-2 px-3 text-sm font-medium text-muted-foreground">{label}</td>
      <td className="py-2 px-3 text-sm font-semibold text-red-600 text-right">{fmt(bear)}</td>
      <td className="py-2 px-3 text-sm font-semibold text-blue-600 text-right">{fmt(base)}</td>
      <td className="py-2 px-3 text-sm font-semibold text-green-600 text-right">{fmt(bull)}</td>
    </tr>
  )
}

export function ScenarioComparison({ scenarios }: Props) {
  const bear = scenarios.find((s) => s.name === "Bear")!
  const base = scenarios.find((s) => s.name === "Base")!
  const bull = scenarios.find((s) => s.name === "Bull")!

  // Build combined chart data (equity over time)
  const years = base.results.yearlyProjections.length
  const equityChartData = Array.from({ length: years }, (_, i) => ({
    year: i + 1,
    Bear: bear.results.yearlyProjections[i]?.equity ?? 0,
    Base: base.results.yearlyProjections[i]?.equity ?? 0,
    Bull: bull.results.yearlyProjections[i]?.equity ?? 0,
  }))

  const cfChartData = Array.from({ length: years }, (_, i) => ({
    year: i + 1,
    Bear: bear.results.yearlyProjections[i]?.cumulativeCashFlow ?? 0,
    Base: base.results.yearlyProjections[i]?.cumulativeCashFlow ?? 0,
    Bull: bull.results.yearlyProjections[i]?.cumulativeCashFlow ?? 0,
  }))

  const formatAxisCurrency = (v: number) => {
    const abs = Math.abs(v)
    const sign = v < 0 ? "-" : ""
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}k`
    return `${sign}$${abs}`
  }

  return (
    <div className="space-y-4">
      {/* Scenario assumptions banner */}
      <div className="flex flex-wrap gap-3">
        {scenarios.map((s) => (
          <div key={s.name} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <Badge variant={SCENARIO_BADGES[s.name]}>{s.name}</Badge>
            <span className="text-muted-foreground">
              Appreciation {s.appreciationRate > 0 ? "+" : ""}{s.appreciationRate.toFixed(1)}%/yr
              &nbsp;·&nbsp;
              Rent growth {s.rentGrowthRate > 0 ? "+" : ""}{s.rentGrowthRate.toFixed(1)}%/yr
            </span>
          </div>
        ))}
      </div>

      {/* Summary comparison table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Key Metrics by Scenario</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-2 px-3 text-xs font-semibold text-left text-muted-foreground uppercase tracking-wide">Metric</th>
                <th className="py-2 px-3 text-xs font-semibold text-right text-red-600 uppercase tracking-wide">Bear</th>
                <th className="py-2 px-3 text-xs font-semibold text-right text-blue-600 uppercase tracking-wide">Base</th>
                <th className="py-2 px-3 text-xs font-semibold text-right text-green-600 uppercase tracking-wide">Bull</th>
              </tr>
            </thead>
            <tbody>
              <CompareRow
                label="Monthly Cash Flow"
                bear={bear.results.monthlyCashFlow}
                base={base.results.monthlyCashFlow}
                bull={bull.results.monthlyCashFlow}
              />
              <CompareRow
                label="Cap Rate"
                bear={bear.results.capRate}
                base={base.results.capRate}
                bull={bull.results.capRate}
                format="percent"
              />
              <CompareRow
                label="Cash-on-Cash"
                bear={bear.results.cashOnCashReturn}
                base={base.results.cashOnCashReturn}
                bull={bull.results.cashOnCashReturn}
                format="percent"
              />
              <CompareRow
                label="IRR"
                bear={bear.results.internalRateOfReturn}
                base={base.results.internalRateOfReturn}
                bull={bull.results.internalRateOfReturn}
                format="percent"
              />
              <CompareRow
                label="NPV"
                bear={bear.results.netPresentValue}
                base={base.results.netPresentValue}
                bull={bull.results.netPresentValue}
              />
              <CompareRow
                label="Equity at Exit"
                bear={bear.results.equityAtExit}
                base={base.results.equityAtExit}
                bull={bull.results.equityAtExit}
              />
              <CompareRow
                label="Total Cash Flow"
                bear={bear.results.totalCashFlowAtExit}
                base={base.results.totalCashFlowAtExit}
                bull={bull.results.totalCashFlowAtExit}
              />
              <CompareRow
                label="Total Return %"
                bear={bear.results.totalReturnAtExit}
                base={base.results.totalReturnAtExit}
                bull={bull.results.totalReturnAtExit}
                format="percent"
              />
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Equity chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Equity Growth — Bear / Base / Bull</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={equityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={formatAxisCurrency} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} labelFormatter={(l) => `Year ${l}`} />
              <Legend />
              {(["Bear", "Base", "Bull"] as const).map((name) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={SCENARIO_COLORS[name]}
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray={name === "Bear" ? "5 3" : name === "Bull" ? "3 2" : undefined}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cumulative cash flow chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cumulative Cash Flow — Bear / Base / Bull</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={cfChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={formatAxisCurrency} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} labelFormatter={(l) => `Year ${l}`} />
              <Legend />
              {(["Bear", "Base", "Bull"] as const).map((name) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={SCENARIO_COLORS[name]}
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray={name === "Bear" ? "5 3" : name === "Bull" ? "3 2" : undefined}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
