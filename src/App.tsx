import { motion } from "framer-motion"
import {
  BarChart3,
  Building2,
  ChevronDown,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { useState } from "react"
import { ResultsPanel } from "@/components/ResultsPanel"
import { SimulationForm } from "@/components/SimulationForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PRESETS, useSimulation } from "@/hooks/useSimulation"
import "./index.css"

const FEATURES = [
  { icon: BarChart3,  label: "7 chart types with real-time projections" },
  { icon: TrendingUp, label: "IRR, NPV, DSCR, CoC, Cap Rate & more" },
  { icon: Sparkles,   label: "Bear / Base / Bull scenario comparison" },
]

export default function App() {
  const { inputs, setInputs, results, dealScore, scenarios, hasRun, run, loadPreset } =
    useSimulation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

        {/* ── Header ── */}
        <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
                <Building2 className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">Leveridge</span>
              <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
                Simulation Engine
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Select onValueChange={(v) => loadPreset(v)}>
                <SelectTrigger className="w-[200px] h-9 text-xs">
                  <SelectValue placeholder="Load scenario preset…" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(PRESETS).map((name) => (
                    <SelectItem key={name} value={name} className="text-xs">
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="outline"
                onClick={() => loadPreset("Conservative Buy & Hold")}
                title="Reset to defaults"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button size="sm" onClick={run} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                <Play className="h-4 w-4" />
                Run
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-screen-2xl mx-auto px-4 py-6">
          <div className="flex gap-6">

            {/* Mobile sidebar toggle */}
            <div className="lg:hidden w-full mb-4">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Simulation Inputs
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </div>

            {/* ── Left Sidebar ── */}
            <aside
              className={`w-full lg:w-[360px] shrink-0 ${
                sidebarOpen ? "block" : "hidden lg:block"
              }`}
            >
              <SimulationForm inputs={inputs} onChange={setInputs} onRun={run} />
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 min-w-0">
              {!hasRun ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 py-12"
                >
                  {/* Icon */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-200">
                      <Building2 className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight">
                      Real Estate Simulation Engine
                    </h1>
                    <p className="text-muted-foreground max-w-md text-base leading-relaxed">
                      Model buy-and-hold, fix-and-flip, BRRRR, and more.
                      Get IRR, NPV, equity projections, and Bear / Base / Bull
                      scenario analysis — to the dollar.
                    </p>
                  </div>

                  {/* Feature list */}
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {FEATURES.map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-blue-500 shrink-0" />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Preset quick-start */}
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                      Quick start with a preset
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {Object.keys(PRESETS).map((name) => (
                        <Button
                          key={name}
                          variant="outline"
                          size="sm"
                          className="hover:border-blue-400 hover:text-blue-600 transition-colors"
                          onClick={() => {
                            loadPreset(name)
                            setTimeout(run, 50)
                          }}
                        >
                          {name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={run}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 px-8"
                  >
                    <Play className="h-5 w-5" />
                    Run Simulation
                  </Button>

                  <Separator className="w-48" />

                  {/* Info cards */}
                  <div className="grid grid-cols-3 gap-3 max-w-sm w-full">
                    {[
                      { label: "Strategies", value: "5" },
                      { label: "Metrics", value: "20+" },
                      { label: "Scenarios", value: "3" },
                    ].map(({ label, value }) => (
                      <Card key={label} className="p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              ) : (
                results && dealScore && (
                  <ResultsPanel
                    results={results}
                    inputs={inputs}
                    dealScore={dealScore}
                    scenarios={scenarios}
                  />
                )
              )}
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
