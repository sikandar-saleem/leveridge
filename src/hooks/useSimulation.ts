import { useState } from "react"
import { getDealGrade, runScenarioComparison, runSimulation } from "@/engine/calculator"
import type { DealScore, ScenarioResult, SimulationInputs, SimulationResults } from "@/types/simulation"

export const DEFAULT_INPUTS: SimulationInputs = {
  property: {
    purchasePrice: 300000,
    propertyType: "single_family",
    squareFootage: 1500,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 1990,
    location: "US",
  },
  financing: {
    strategy: "conventional",
    downPaymentPercent: 20,
    interestRate: 7.0,
    loanTermYears: 30,
    closingCostPercent: 3,
    pointsPaid: 0,
  },
  rehab: {
    estimatedCost: 20000,
    contingencyPercent: 10,
    durationMonths: 2,
    holdingCostPerMonth: 1200,
  },
  rental: {
    monthlyRent: 2000,
    vacancyRatePercent: 5,
    propertyManagementPercent: 8,
    maintenancePercent: 5,
    annualAppreciationPercent: 3,
    rentGrowthPercent: 2,
    holdYears: 10,
  },
  market: {
    condition: "balanced",
    arvMultiplier: 1.2,
    capRate: 6,
    daysOnMarket: 30,
    priceAppreciationPercent: 3,
  },
  exitStrategy: "hold_rental",
  simulationYears: 10,
}

export const PRESETS: Record<string, SimulationInputs> = {
  "Conservative Buy & Hold": DEFAULT_INPUTS,
  "Aggressive Flip": {
    ...DEFAULT_INPUTS,
    property: { ...DEFAULT_INPUTS.property, purchasePrice: 180000 },
    financing: {
      ...DEFAULT_INPUTS.financing,
      strategy: "hard_money",
      downPaymentPercent: 10,
      interestRate: 12,
      loanTermYears: 1,
      closingCostPercent: 4,
      pointsPaid: 2,
    },
    rehab: {
      estimatedCost: 60000,
      contingencyPercent: 15,
      durationMonths: 6,
      holdingCostPerMonth: 2000,
    },
    market: { ...DEFAULT_INPUTS.market, arvMultiplier: 1.5, condition: "sellers" },
    exitStrategy: "flip",
    simulationYears: 1,
  },
  "BRRRR Strategy": {
    ...DEFAULT_INPUTS,
    property: { ...DEFAULT_INPUTS.property, purchasePrice: 120000 },
    financing: {
      ...DEFAULT_INPUTS.financing,
      strategy: "brrrr",
      downPaymentPercent: 25,
      interestRate: 8.5,
      loanTermYears: 30,
      closingCostPercent: 3,
      pointsPaid: 1,
    },
    rehab: {
      estimatedCost: 40000,
      contingencyPercent: 10,
      durationMonths: 4,
      holdingCostPerMonth: 1000,
    },
    rental: {
      ...DEFAULT_INPUTS.rental,
      monthlyRent: 1600,
      vacancyRatePercent: 5,
    },
    market: { ...DEFAULT_INPUTS.market, arvMultiplier: 1.4, condition: "balanced" },
    exitStrategy: "brrrr",
    simulationYears: 10,
  },
  "Commercial Value-Add": {
    ...DEFAULT_INPUTS,
    property: {
      ...DEFAULT_INPUTS.property,
      purchasePrice: 1_200_000,
      propertyType: "commercial",
      squareFootage: 6000,
      bedrooms: 0,
      bathrooms: 4,
      yearBuilt: 1975,
    },
    financing: {
      ...DEFAULT_INPUTS.financing,
      downPaymentPercent: 30,
      interestRate: 6.75,
      loanTermYears: 25,
      closingCostPercent: 3.5,
      pointsPaid: 1,
    },
    rehab: {
      estimatedCost: 200_000,
      contingencyPercent: 20,
      durationMonths: 12,
      holdingCostPerMonth: 5000,
    },
    rental: {
      ...DEFAULT_INPUTS.rental,
      monthlyRent: 12000,
      vacancyRatePercent: 8,
      propertyManagementPercent: 5,
      maintenancePercent: 8,
    },
    market: { ...DEFAULT_INPUTS.market, arvMultiplier: 1.3, capRate: 7 },
    exitStrategy: "hold_rental",
    simulationYears: 15,
  },
}

export function useSimulation() {
  const [inputs, setInputs] = useState<SimulationInputs>(DEFAULT_INPUTS)
  const [results, setResults] = useState<SimulationResults | null>(null)
  const [dealScore, setDealScore] = useState<DealScore | null>(null)
  const [scenarios, setScenarios] = useState<ScenarioResult[] | null>(null)
  const [hasRun, setHasRun] = useState(false)

  function run() {
    const r = runSimulation(inputs)
    const isFlip = inputs.exitStrategy === "flip" || inputs.exitStrategy === "wholesale"
    const score = getDealGrade(r, isFlip)
    const scenarioData = isFlip ? null : runScenarioComparison(inputs)
    setResults(r)
    setDealScore(score)
    setScenarios(scenarioData)
    setHasRun(true)
  }

  function loadPreset(name: string) {
    const preset = PRESETS[name]
    if (preset) {
      setInputs(preset)
      setResults(null)
      setDealScore(null)
      setScenarios(null)
      setHasRun(false)
    }
  }

  return { inputs, setInputs, results, dealScore, scenarios, hasRun, run, loadPreset }
}
