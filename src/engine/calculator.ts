import type {
  DealGrade,
  DealScore,
  ScenarioResult,
  SimulationInputs,
  SimulationResults,
  YearlyProjection,
} from "../types/simulation"

// ─── Mortgage helpers ────────────────────────────────────────────────────────

export function calcMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (annualRate === 0) return principal / (termYears * 12)
  const r = annualRate / 100 / 12
  const n = termYears * 12
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export function calcLoanBalance(
  principal: number,
  annualRate: number,
  termYears: number,
  monthsPaid: number
): number {
  if (annualRate === 0) return principal - (principal / (termYears * 12)) * monthsPaid
  const r = annualRate / 100 / 12
  const n = termYears * 12
  return (
    principal *
    ((Math.pow(1 + r, n) - Math.pow(1 + r, monthsPaid)) /
      (Math.pow(1 + r, n) - 1))
  )
}

// ─── IRR via Newton-Raphson ───────────────────────────────────────────────────

export function calcIRR(cashFlows: number[]): number {
  let rate = 0.1
  for (let i = 0; i < 1000; i++) {
    let npv = 0
    let dnpv = 0
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t)
      dnpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1)
    }
    if (Math.abs(dnpv) < 1e-10) break
    const newRate = rate - npv / dnpv
    if (Math.abs(newRate - rate) < 1e-8) {
      rate = newRate
      break
    }
    rate = newRate
  }
  return rate * 100
}

// ─── NPV ─────────────────────────────────────────────────────────────────────

export function calcNPV(cashFlows: number[], discountRate: number): number {
  return cashFlows.reduce(
    (acc, cf, t) => acc + cf / Math.pow(1 + discountRate / 100, t),
    0
  )
}

// ─── ARV calculator ───────────────────────────────────────────────────────────

function calcARV(inputs: SimulationInputs): number {
  const { purchasePrice } = inputs.property
  const { arvMultiplier } = inputs.market
  const rehabCost = inputs.rehab.estimatedCost * (1 + inputs.rehab.contingencyPercent / 100)
  return (purchasePrice + rehabCost) * arvMultiplier
}

// ─── Main simulation engine ───────────────────────────────────────────────────

export function runSimulation(inputs: SimulationInputs): SimulationResults {
  const { property, financing, rehab, rental, market, exitStrategy, simulationYears } = inputs

  // ── Core financials ──
  const downPayment = property.purchasePrice * (financing.downPaymentPercent / 100)
  const loanAmount = property.purchasePrice - downPayment
  const closingCosts = property.purchasePrice * (financing.closingCostPercent / 100) +
    loanAmount * (financing.pointsPaid / 100)
  const rehabCostTotal = rehab.estimatedCost * (1 + rehab.contingencyPercent / 100)
  const holdingCosts = rehab.holdingCostPerMonth * rehab.durationMonths
  const totalInvestment = downPayment + closingCosts + rehabCostTotal + holdingCosts

  const monthlyMortgagePayment = calcMonthlyPayment(
    loanAmount,
    financing.interestRate,
    financing.loanTermYears
  )

  const arv = calcARV(inputs)

  // ── Rental metrics ──
  const annualGrossRent = rental.monthlyRent * 12
  const vacancyLoss = annualGrossRent * (rental.vacancyRatePercent / 100)
  const effectiveGrossIncome = annualGrossRent - vacancyLoss
  const operatingExpenses =
    effectiveGrossIncome * (rental.propertyManagementPercent / 100) +
    effectiveGrossIncome * (rental.maintenancePercent / 100)
  const noi = effectiveGrossIncome - operatingExpenses
  const annualDebtService = monthlyMortgagePayment * 12
  const annualCashFlow = noi - annualDebtService
  const monthlyCashFlow = annualCashFlow / 12
  const monthlyExpenses =
    (vacancyLoss + operatingExpenses) / 12 + monthlyMortgagePayment

  const grossRentMultiplier = property.purchasePrice / annualGrossRent
  const capRate = (noi / (property.purchasePrice + rehabCostTotal)) * 100
  const cashOnCashReturn = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0
  const debtServiceCoverageRatio = annualDebtService > 0 ? noi / annualDebtService : 0

  // ── Flip metrics ──
  const sellingCosts = arv * 0.08 // ~8% selling costs
  const flipProfit = arv - property.purchasePrice - rehabCostTotal - holdingCosts - closingCosts - sellingCosts
  const returnOnInvestment = totalInvestment > 0 ? (flipProfit / totalInvestment) * 100 : 0
  const flipMonths = rehab.durationMonths + 2
  const annualizedROI = returnOnInvestment * (12 / flipMonths)

  // ── Yearly projections ──
  const years = exitStrategy === "flip" ? 1 : simulationYears
  const yearlyProjections: YearlyProjection[] = []
  let cumulativeCashFlow = 0

  for (let yr = 1; yr <= years; yr++) {
    const propValue = (property.purchasePrice + rehabCostTotal) *
      Math.pow(1 + market.priceAppreciationPercent / 100, yr)
    const rentThisYear = rental.monthlyRent *
      Math.pow(1 + rental.rentGrowthPercent / 100, yr - 1)
    const annualGrossY = rentThisYear * 12
    const vacancyLossY = annualGrossY * (rental.vacancyRatePercent / 100)
    const egiY = annualGrossY - vacancyLossY
    const opExpY = egiY * ((rental.propertyManagementPercent + rental.maintenancePercent) / 100)
    const noiY = egiY - opExpY
    const cashFlowY = noiY - annualDebtService
    cumulativeCashFlow += cashFlowY

    const loanBal = calcLoanBalance(loanAmount, financing.interestRate, financing.loanTermYears, yr * 12)
    const equity = propValue - Math.max(loanBal, 0)
    const cocY = totalInvestment > 0 ? (cashFlowY / totalInvestment) * 100 : 0
    const capRateY = ((noiY / propValue) * 100)
    const totalRetY = totalInvestment > 0
      ? ((cumulativeCashFlow + equity - totalInvestment) / totalInvestment) * 100
      : 0

    yearlyProjections.push({
      year: yr,
      propertyValue: propValue,
      monthlyRent: rentThisYear,
      annualGrossRent: annualGrossY,
      vacancyLoss: vacancyLossY,
      effectiveGrossIncome: egiY,
      operatingExpenses: opExpY,
      noi: noiY,
      mortgagePayment: annualDebtService,
      annualCashFlow: cashFlowY,
      cumulativeCashFlow,
      loanBalance: Math.max(loanBal, 0),
      equity,
      cashOnCash: cocY,
      capRateOnCost: capRateY,
      totalReturn: totalRetY,
    })
  }

  // ── IRR & NPV ──
  const exitYear = yearlyProjections[yearlyProjections.length - 1]
  const exitProceeds = exitYear
    ? exitYear.propertyValue * (1 - 0.06) - exitYear.loanBalance
    : 0

  const irrCashFlows = [-totalInvestment]
  for (let yr = 0; yr < yearlyProjections.length; yr++) {
    if (yr < yearlyProjections.length - 1) {
      irrCashFlows.push(yearlyProjections[yr].annualCashFlow)
    } else {
      irrCashFlows.push(yearlyProjections[yr].annualCashFlow + exitProceeds)
    }
  }

  const irr = calcIRR(irrCashFlows)
  const npv = calcNPV(irrCashFlows, 8) // 8% discount rate

  // ── Risk metrics ──
  const breakEvenOccupancy = annualDebtService + operatingExpenses > 0
    ? ((annualDebtService + operatingExpenses) / annualGrossRent) * 100
    : 0
  let monthsToBreakEven = 0
  let runningCF = -totalInvestment
  for (const yr of yearlyProjections) {
    if (runningCF >= 0) break
    const monthly = yr.annualCashFlow / 12
    for (let m = 0; m < 12; m++) {
      runningCF += monthly
      monthsToBreakEven++
      if (runningCF >= 0) break
    }
  }
  const maxMonthsNeg = yearlyProjections.filter((y) => y.annualCashFlow < 0).length * 12

  // ── BRRRR ──
  let afterRefinanceEquity: number | undefined
  let cashRecaptured: number | undefined
  let infiniteReturnAchieved: boolean | undefined

  if (financing.strategy === "brrrr") {
    const refinanceValue = arv
    const maxLoanOnRefi = refinanceValue * 0.75 // 75% LTV refi
    const payoffAmount = loanAmount + rehabCostTotal * 0.8
    cashRecaptured = Math.max(maxLoanOnRefi - payoffAmount, 0)
    afterRefinanceEquity = refinanceValue - maxLoanOnRefi
    infiniteReturnAchieved = cashRecaptured >= totalInvestment
  }

  return {
    purchasePrice: property.purchasePrice,
    downPayment,
    loanAmount,
    closingCosts,
    rehabCost: rehabCostTotal,
    totalInvestment,
    monthlyMortgagePayment,
    monthlyExpenses,
    monthlyCashFlow,
    grossRentMultiplier,
    capRate,
    cashOnCashReturn,
    debtServiceCoverageRatio,
    arv,
    flipProfit,
    returnOnInvestment,
    annualizedROI,
    yearlyProjections,
    internalRateOfReturn: irr,
    netPresentValue: npv,
    equityAtExit: exitYear?.equity ?? 0,
    totalCashFlowAtExit: cumulativeCashFlow,
    totalReturnAtExit: exitYear?.totalReturn ?? 0,
    breakEvenOccupancy,
    monthsToBreakEven,
    maxMonthsNegativeCashFlow: maxMonthsNeg,
    afterRefinanceEquity,
    cashRecaptured,
    infiniteReturnAchieved,
  }
}

// ─── Deal grading ─────────────────────────────────────────────────────────────

function scoreToGrade(score: number): DealGrade {
  if (score >= 90) return "A+"
  if (score >= 78) return "A"
  if (score >= 66) return "B+"
  if (score >= 54) return "B"
  if (score >= 40) return "C"
  if (score >= 25) return "D"
  return "F"
}

function gradeLabel(grade: DealGrade): string {
  switch (grade) {
    case "A+": return "Exceptional Deal"
    case "A":  return "Strong Deal"
    case "B+": return "Good Deal"
    case "B":  return "Decent Deal"
    case "C":  return "Marginal Deal"
    case "D":  return "Weak Deal"
    case "F":  return "Poor Deal"
  }
}

export function getDealGrade(results: SimulationResults, isFlip: boolean): DealScore {
  let cashFlow: number
  let capRate: number
  let dscr: number
  let irr: number

  if (isFlip) {
    const roi = results.returnOnInvestment
    cashFlow = roi >= 30 ? 25 : roi >= 20 ? 20 : roi >= 10 ? 13 : roi > 0 ? 6 : 0
    capRate  = 0
    dscr     = 0
    irr      = results.annualizedROI >= 50 ? 75 : results.annualizedROI >= 30 ? 55 :
               results.annualizedROI >= 15 ? 35 : results.annualizedROI > 0 ? 15 : 0
  } else {
    cashFlow = results.cashOnCashReturn >= 10 ? 25 : results.cashOnCashReturn >= 8 ? 20 :
               results.cashOnCashReturn >= 5  ? 14 : results.cashOnCashReturn >= 2 ? 7 : 0
    capRate  = results.capRate >= 8 ? 25 : results.capRate >= 6 ? 20 :
               results.capRate >= 4 ? 13 : results.capRate >= 2 ? 6 : 0
    dscr     = results.debtServiceCoverageRatio >= 1.5 ? 25 :
               results.debtServiceCoverageRatio >= 1.25 ? 19 :
               results.debtServiceCoverageRatio >= 1.0  ? 10 : 0
    irr      = results.internalRateOfReturn >= 20 ? 25 : results.internalRateOfReturn >= 15 ? 20 :
               results.internalRateOfReturn >= 10 ? 13 : results.internalRateOfReturn >= 5  ? 6 : 0
  }

  const score = cashFlow + capRate + dscr + irr
  const grade = scoreToGrade(score)
  return { grade, score, breakdown: { cashFlow, capRate, dscr, irr }, label: gradeLabel(grade) }
}

// ─── Scenario comparison ──────────────────────────────────────────────────────

export function runScenarioComparison(inputs: SimulationInputs): ScenarioResult[] {
  const scenarios = [
    { name: "Bear" as const, appDelta: -2, rentDelta: -1, vacAdj: +4 },
    { name: "Base" as const, appDelta:  0, rentDelta:  0, vacAdj:  0 },
    { name: "Bull" as const, appDelta: +2, rentDelta: +1.5, vacAdj: -2 },
  ]

  return scenarios.map((s) => {
    const appreciationRate = Math.max(-10, inputs.market.priceAppreciationPercent + s.appDelta)
    const rentGrowthRate   = Math.max(-5,  inputs.rental.rentGrowthPercent + s.rentDelta)
    return {
      name: s.name,
      appreciationRate,
      rentGrowthRate,
      results: runSimulation({
        ...inputs,
        market: { ...inputs.market, priceAppreciationPercent: appreciationRate },
        rental: {
          ...inputs.rental,
          rentGrowthPercent: rentGrowthRate,
          vacancyRatePercent: Math.min(30, Math.max(0, inputs.rental.vacancyRatePercent + s.vacAdj)),
        },
      }),
    }
  })
}
