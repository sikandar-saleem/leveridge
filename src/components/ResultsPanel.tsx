import { motion } from "framer-motion"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { DealGradeCard } from "@/components/DealGrade"
import { ScenarioComparison } from "@/components/ScenarioComparison"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatPercent } from "@/lib/utils"
import type { DealScore, ScenarioResult, SimulationInputs, SimulationResults } from "@/types/simulation"
import { MetricCard } from "./MetricCard"

interface Props {
  results: SimulationResults
  inputs: SimulationInputs
  dealScore: DealScore
  scenarios: ScenarioResult[] | null
}

const C = {
  blue:   "#3b82f6",
  green:  "#22c55e",
  red:    "#ef4444",
  amber:  "#f59e0b",
  purple: "#8b5cf6",
  slate:  "#94a3b8",
}

function fmtAxis(v: number) {
  const abs = Math.abs(v)
  const s = v < 0 ? "-" : ""
  if (abs >= 1_000_000) return `${s}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `${s}$${(abs / 1_000).toFixed(0)}k`
  return `${s}$${abs}`
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
}

export function ResultsPanel({ results, inputs, dealScore, scenarios }: Props) {
  const isFlip      = inputs.exitStrategy === "flip" || inputs.exitStrategy === "wholesale"
  const isBRRRR     = inputs.financing.strategy === "brrrr"
  const cashFlowPos = results.monthlyCashFlow >= 0
  const npvPos      = results.netPresentValue > 0
  const irrPos      = results.internalRateOfReturn > 0

  return (
    <motion.div {...fadeUp} className="space-y-4">

      {/* ── Top KPI strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isFlip ? (
          <>
            <MetricCard
              label="ARV"
              value={formatCurrency(results.arv)}
              highlight="neutral"
              size="md"
            />
            <MetricCard
              label="Flip Profit"
              value={formatCurrency(results.flipProfit)}
              highlight={results.flipProfit >= 0 ? "positive" : "negative"}
              trend={results.flipProfit >= 0 ? "up" : "down"}
              size="md"
            />
            <MetricCard
              label="ROI"
              value={formatPercent(results.returnOnInvestment)}
              highlight={results.returnOnInvestment >= 15 ? "positive" : "neutral"}
              size="md"
            />
            <MetricCard
              label="Annualised ROI"
              value={formatPercent(results.annualizedROI)}
              highlight={results.annualizedROI >= 20 ? "positive" : "neutral"}
              size="md"
            />
          </>
        ) : (
          <>
            <MetricCard
              label="Monthly Cash Flow"
              value={formatCurrency(results.monthlyCashFlow)}
              highlight={cashFlowPos ? "positive" : "negative"}
              trend={cashFlowPos ? "up" : "down"}
              size="md"
            />
            <MetricCard
              label="Cap Rate"
              value={formatPercent(results.capRate)}
              highlight={results.capRate >= 6 ? "positive" : "neutral"}
              size="md"
            />
            <MetricCard
              label="IRR"
              value={formatPercent(results.internalRateOfReturn)}
              highlight={irrPos ? "positive" : "negative"}
              trend={irrPos ? "up" : "down"}
              size="md"
            />
            <MetricCard
              label="Equity at Exit"
              value={formatCurrency(results.equityAtExit, true)}
              highlight="positive"
              size="md"
            />
          </>
        )}
      </div>

      {/* ── Deal grade + quality badges ── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <DealGradeCard score={dealScore} isFlip={isFlip} />

        <Card>
          <CardContent className="pt-4 pb-4 h-full flex flex-col justify-center gap-2">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Deal Quality Signals</p>
            <div className="flex flex-wrap gap-2">
              {results.cashOnCashReturn >= 8 ? (
                <Badge variant="success">Strong CoC ({formatPercent(results.cashOnCashReturn, 1)})</Badge>
              ) : results.cashOnCashReturn >= 4 ? (
                <Badge variant="secondary">Moderate CoC ({formatPercent(results.cashOnCashReturn, 1)})</Badge>
              ) : (
                <Badge variant="destructive">Weak CoC ({formatPercent(results.cashOnCashReturn, 1)})</Badge>
              )}

              {!isFlip && (
                results.debtServiceCoverageRatio >= 1.25 ? (
                  <Badge variant="success">DSCR {results.debtServiceCoverageRatio.toFixed(2)}x</Badge>
                ) : results.debtServiceCoverageRatio >= 1.0 ? (
                  <Badge variant="warning">DSCR {results.debtServiceCoverageRatio.toFixed(2)}x</Badge>
                ) : (
                  <Badge variant="destructive">DSCR {results.debtServiceCoverageRatio.toFixed(2)}x</Badge>
                )
              )}

              {npvPos
                ? <Badge variant="success">Positive NPV</Badge>
                : <Badge variant="destructive">Negative NPV</Badge>
              }

              {isBRRRR && results.infiniteReturnAchieved && (
                <Badge variant="success">Infinite Return (BRRRR)</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="overview">
        <TabsList className={`grid w-full ${scenarios ? "grid-cols-5" : "grid-cols-4"}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="equity">Equity</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          {scenarios && <TabsTrigger value="scenarios">Scenarios</TabsTrigger>}
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-4">
          {/* Capital stack */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Capital Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MetricCard label="Purchase Price"  value={formatCurrency(results.purchasePrice)} />
                <MetricCard label="Down Payment"    value={formatCurrency(results.downPayment)} />
                <MetricCard label="Loan Amount"     value={formatCurrency(results.loanAmount)} />
                <MetricCard label="Closing Costs"   value={formatCurrency(results.closingCosts)} />
                <MetricCard label="Rehab Cost"      value={formatCurrency(results.rehabCost)} />
                <MetricCard label="Total Investment" value={formatCurrency(results.totalInvestment)} size="lg" highlight="neutral" />
              </div>
            </CardContent>
          </Card>

          {/* Monthly snapshot */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Monthly Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MetricCard label="Mortgage Payment" value={formatCurrency(results.monthlyMortgagePayment)} />
                <MetricCard label="Total Expenses"   value={formatCurrency(results.monthlyExpenses)} />
                <MetricCard
                  label="Net Cash Flow"
                  value={formatCurrency(results.monthlyCashFlow)}
                  highlight={cashFlowPos ? "positive" : "negative"}
                  trend={cashFlowPos ? "up" : "down"}
                  size="lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Flip or Rental metrics */}
          {isFlip ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Flip Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <MetricCard label="ARV"           value={formatCurrency(results.arv)} />
                  <MetricCard label="Flip Profit"   value={formatCurrency(results.flipProfit)} highlight={results.flipProfit >= 0 ? "positive" : "negative"} trend={results.flipProfit >= 0 ? "up" : "down"} />
                  <MetricCard label="ROI"           value={formatPercent(results.returnOnInvestment)} highlight={results.returnOnInvestment >= 0 ? "positive" : "negative"} />
                  <MetricCard label="Annualised ROI" value={formatPercent(results.annualizedROI)}    highlight={results.annualizedROI >= 0 ? "positive" : "negative"} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Rental Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <MetricCard label="Cap Rate"      value={formatPercent(results.capRate)}           highlight={results.capRate >= 6 ? "positive" : "neutral"} />
                  <MetricCard label="Cash-on-Cash"  value={formatPercent(results.cashOnCashReturn)}  highlight={results.cashOnCashReturn >= 8 ? "positive" : results.cashOnCashReturn < 0 ? "negative" : "neutral"} />
                  <MetricCard label="GRM"           value={results.grossRentMultiplier.toFixed(1) + "x"} />
                  <MetricCard label="DSCR"          value={results.debtServiceCoverageRatio.toFixed(2) + "x"} highlight={results.debtServiceCoverageRatio >= 1.25 ? "positive" : results.debtServiceCoverageRatio < 1.0 ? "negative" : "neutral"} />
                  <MetricCard label="IRR"           value={formatPercent(results.internalRateOfReturn)} highlight={irrPos ? "positive" : "negative"} trend={irrPos ? "up" : "down"} />
                  <MetricCard label="NPV (8% disc.)" value={formatCurrency(results.netPresentValue)}  highlight={npvPos ? "positive" : "negative"} trend={npvPos ? "up" : "down"} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* BRRRR block */}
          {isBRRRR && (
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-purple-700">BRRRR Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <MetricCard label="ARV"            value={formatCurrency(results.arv)} />
                  <MetricCard label="Cash Recaptured" value={formatCurrency(results.cashRecaptured ?? 0)} highlight={(results.cashRecaptured ?? 0) > 0 ? "positive" : "neutral"} />
                  <MetricCard label="Post-Refi Equity" value={formatCurrency(results.afterRefinanceEquity ?? 0)} />
                  <MetricCard label="Infinite Return" value={results.infiniteReturnAchieved ? "Yes!" : "Not Yet"} highlight={results.infiniteReturnAchieved ? "positive" : "neutral"} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk metrics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Risk Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MetricCard label="Break-Even Occupancy" value={formatPercent(results.breakEvenOccupancy)} />
                <MetricCard
                  label="Months to Break-Even"
                  value={results.monthsToBreakEven > 0 ? `${results.monthsToBreakEven} mo` : "Never"}
                  highlight={results.monthsToBreakEven > 0 && results.monthsToBreakEven < 120 ? "neutral" : "negative"}
                />
                <MetricCard label="Equity at Exit"     value={formatCurrency(results.equityAtExit)}        highlight="positive" />
                <MetricCard label="Total Cash Flow"    value={formatCurrency(results.totalCashFlowAtExit)}  highlight={results.totalCashFlowAtExit >= 0 ? "positive" : "negative"} />
                <MetricCard label="Total Return"       value={formatPercent(results.totalReturnAtExit)}     highlight={results.totalReturnAtExit >= 0 ? "positive" : "negative"} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CASH FLOW ── */}
        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Annual Cash Flow</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={results.yearlyProjections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} labelFormatter={(l) => `Year ${l}`} />
                  <ReferenceLine y={0} stroke="#94a3b8" />
                  <Bar
                    dataKey="annualCashFlow"
                    name="Annual Cash Flow"
                    fill={C.blue}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Cumulative Cash Flow</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={results.yearlyProjections}>
                  <defs>
                    <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.green} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} labelFormatter={(l) => `Year ${l}`} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 2" />
                  <Area type="monotone" dataKey="cumulativeCashFlow" stroke={C.green} fill="url(#cfGrad)" name="Cumulative Cash Flow" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">NOI vs Debt Service</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={results.yearlyProjections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} labelFormatter={(l) => `Year ${l}`} />
                  <Legend />
                  <Bar dataKey="noi"             fill={C.green}  name="NOI"          radius={[3, 3, 0, 0]} />
                  <Bar dataKey="mortgagePayment" fill={C.red}    name="Debt Service" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── EQUITY ── */}
        <TabsContent value="equity" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Property Value vs Loan Balance</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={results.yearlyProjections}>
                  <defs>
                    <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.blue} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lbGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.red} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} labelFormatter={(l) => `Year ${l}`} />
                  <Legend />
                  <Area type="monotone" dataKey="propertyValue" stroke={C.blue}   fill="url(#pvGrad)" name="Property Value" strokeWidth={2} />
                  <Area type="monotone" dataKey="loanBalance"   stroke={C.red}    fill="url(#lbGrad)" name="Loan Balance"   strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Equity Growth</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={results.yearlyProjections}>
                  <defs>
                    <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.purple} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} labelFormatter={(l) => `Year ${l}`} />
                  <Area type="monotone" dataKey="equity" stroke={C.purple} fill="url(#eqGrad)" name="Equity" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── RETURNS ── */}
        <TabsContent value="returns" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Cash-on-Cash Return by Year</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={results.yearlyProjections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${v.toFixed(1)}%`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} labelFormatter={(l) => `Year ${l}`} />
                  <ReferenceLine y={0} stroke="#94a3b8" />
                  <Line type="monotone" dataKey="cashOnCash" stroke={C.blue} name="CoC Return" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Total Return % vs Year</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={results.yearlyProjections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} labelFormatter={(l) => `Year ${l}`} />
                  <Legend />
                  <Line type="monotone" dataKey="totalReturn"    stroke={C.green} name="Total Return" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="capRateOnCost"  stroke={C.amber} name="Cap Rate"     strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projection table */}
          <Card>
            <CardHeader><CardTitle className="text-base">Year-by-Year Projections</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {["Yr", "Value", "Rent/mo", "NOI", "Cash Flow", "Cum. CF", "Equity", "CoC%", "Total%"].map((h) => (
                      <th key={h} className="p-2 text-left font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.yearlyProjections.map((row) => (
                    <tr key={row.year} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-semibold">{row.year}</td>
                      <td className="p-2">{formatCurrency(row.propertyValue, true)}</td>
                      <td className="p-2">{formatCurrency(row.monthlyRent, true)}</td>
                      <td className="p-2">{formatCurrency(row.noi, true)}</td>
                      <td className={`p-2 font-semibold ${row.annualCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(row.annualCashFlow, true)}
                      </td>
                      <td className={`p-2 ${row.cumulativeCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(row.cumulativeCashFlow, true)}
                      </td>
                      <td className="p-2 text-purple-700 font-semibold">{formatCurrency(row.equity, true)}</td>
                      <td className="p-2">{row.cashOnCash.toFixed(1)}%</td>
                      <td className={`p-2 font-semibold ${row.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {row.totalReturn.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SCENARIOS ── */}
        {scenarios && (
          <TabsContent value="scenarios">
            <ScenarioComparison scenarios={scenarios} />
          </TabsContent>
        )}
      </Tabs>

      <Separator />
      <p className="text-xs text-muted-foreground text-center pb-2">
        Leveridge Simulation Engine · projections are estimates only and do not constitute financial advice.
      </p>
    </motion.div>
  )
}
