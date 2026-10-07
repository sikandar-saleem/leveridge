export type PropertyType = "single_family" | "multi_family" | "commercial" | "mixed_use"
export type FinancingStrategy = "conventional" | "hard_money" | "seller_finance" | "cash" | "brrrr"
export type ExitStrategy = "flip" | "hold_rental" | "wholesale" | "lease_option" | "brrrr"
export type MarketCondition = "buyers" | "balanced" | "sellers" | "recession" | "boom"
export type DealGrade = "A+" | "A" | "B+" | "B" | "C" | "D" | "F"

export interface DealScore {
  grade: DealGrade
  score: number // 0–100 composite
  breakdown: {
    cashFlow: number  // 0–25
    capRate: number   // 0–25
    dscr: number      // 0–25
    irr: number       // 0–25
  }
  label: string
}

export interface ScenarioResult {
  name: "Bear" | "Base" | "Bull"
  appreciationRate: number
  rentGrowthRate: number
  results: SimulationResults
}

export interface PropertyInputs {
  purchasePrice: number
  propertyType: PropertyType
  squareFootage: number
  bedrooms: number
  bathrooms: number
  yearBuilt: number
  location: string
}

export interface FinancingInputs {
  strategy: FinancingStrategy
  downPaymentPercent: number
  interestRate: number
  loanTermYears: number
  closingCostPercent: number
  pointsPaid: number
}

export interface RehabInputs {
  estimatedCost: number
  contingencyPercent: number
  durationMonths: number
  holdingCostPerMonth: number
}

export interface RentalInputs {
  monthlyRent: number
  vacancyRatePercent: number
  propertyManagementPercent: number
  maintenancePercent: number
  annualAppreciationPercent: number
  rentGrowthPercent: number
  holdYears: number
}

export interface MarketInputs {
  condition: MarketCondition
  arvMultiplier: number        // after-repair value multiplier on purchase price
  capRate: number
  daysOnMarket: number
  priceAppreciationPercent: number
}

export interface SimulationInputs {
  property: PropertyInputs
  financing: FinancingInputs
  rehab: RehabInputs
  rental: RentalInputs
  market: MarketInputs
  exitStrategy: ExitStrategy
  simulationYears: number
}

export interface YearlyProjection {
  year: number
  propertyValue: number
  monthlyRent: number
  annualGrossRent: number
  vacancyLoss: number
  effectiveGrossIncome: number
  operatingExpenses: number
  noi: number
  mortgagePayment: number
  annualCashFlow: number
  cumulativeCashFlow: number
  loanBalance: number
  equity: number
  cashOnCash: number
  capRateOnCost: number
  totalReturn: number
}

export interface SimulationResults {
  // Purchase metrics
  purchasePrice: number
  downPayment: number
  loanAmount: number
  closingCosts: number
  rehabCost: number
  totalInvestment: number

  // Monthly payment
  monthlyMortgagePayment: number
  monthlyExpenses: number
  monthlyCashFlow: number

  // Rental metrics
  grossRentMultiplier: number
  capRate: number
  cashOnCashReturn: number
  debtServiceCoverageRatio: number

  // Flip metrics (if exit = flip)
  arv: number
  flipProfit: number
  returnOnInvestment: number
  annualizedROI: number

  // Hold metrics
  yearlyProjections: YearlyProjection[]
  internalRateOfReturn: number
  netPresentValue: number
  equityAtExit: number
  totalCashFlowAtExit: number
  totalReturnAtExit: number

  // Risk metrics
  breakEvenOccupancy: number
  monthsToBreakEven: number
  maxMonthsNegativeCashFlow: number

  // BRRRR specific
  afterRefinanceEquity?: number
  cashRecaptured?: number
  infiniteReturnAchieved?: boolean
}
