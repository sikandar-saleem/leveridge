import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { SimulationInputs } from "@/types/simulation"

interface Props {
  inputs: SimulationInputs
  onChange: (inputs: SimulationInputs) => void
  onRun: () => void
}

function FieldLabel({ label, tip }: { label: string; tip?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {tip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{tip}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  tip,
  min,
  max,
  step,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  prefix?: string
  suffix?: string
  tip?: string
  min?: number
  max?: number
  step?: number
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} tip={tip} />
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm text-muted-foreground select-none">{prefix}</span>
        )}
        <Input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step ?? 1}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={prefix ? "pl-7" : suffix ? "pr-8" : ""}
        />
        {suffix && (
          <span className="absolute right-3 text-sm text-muted-foreground select-none">{suffix}</span>
        )}
      </div>
    </div>
  )
}

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  tip,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  suffix?: string
  tip?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel label={label} tip={tip} />
        <span className="text-sm font-semibold text-primary">
          {value}{suffix}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  )
}

export function SimulationForm({ inputs, onChange, onRun }: Props) {
  const setProperty = (key: keyof typeof inputs.property, val: unknown) =>
    onChange({ ...inputs, property: { ...inputs.property, [key]: val } })
  const setFinancing = (key: keyof typeof inputs.financing, val: unknown) =>
    onChange({ ...inputs, financing: { ...inputs.financing, [key]: val } })
  const setRehab = (key: keyof typeof inputs.rehab, val: unknown) =>
    onChange({ ...inputs, rehab: { ...inputs.rehab, [key]: val } })
  const setRental = (key: keyof typeof inputs.rental, val: unknown) =>
    onChange({ ...inputs, rental: { ...inputs.rental, [key]: val } })
  const setMarket = (key: keyof typeof inputs.market, val: unknown) =>
    onChange({ ...inputs, market: { ...inputs.market, [key]: val } })

  return (
    <div className="space-y-4">
      {/* ── Property ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Property Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NumberInput
            label="Purchase Price"
            prefix="$"
            value={inputs.property.purchasePrice}
            onChange={(v) => setProperty("purchasePrice", v)}
            min={0}
            step={5000}
            tip="The price you pay to acquire the property."
          />
          <div className="space-y-1.5">
            <FieldLabel label="Property Type" />
            <Select
              value={inputs.property.propertyType}
              onValueChange={(v) => setProperty("propertyType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_family">Single Family</SelectItem>
                <SelectItem value="multi_family">Multi-Family</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="mixed_use">Mixed Use</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Sq Ft"
              value={inputs.property.squareFootage}
              onChange={(v) => setProperty("squareFootage", v)}
              min={0}
              step={100}
            />
            <NumberInput
              label="Year Built"
              value={inputs.property.yearBuilt}
              onChange={(v) => setProperty("yearBuilt", v)}
              min={1800}
              max={2026}
              step={1}
            />
            <NumberInput
              label="Bedrooms"
              value={inputs.property.bedrooms}
              onChange={(v) => setProperty("bedrooms", v)}
              min={0}
              max={20}
              step={1}
            />
            <NumberInput
              label="Bathrooms"
              value={inputs.property.bathrooms}
              onChange={(v) => setProperty("bathrooms", v)}
              min={0}
              max={20}
              step={0.5}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Exit + Horizon ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <FieldLabel label="Exit Strategy" tip="How you plan to monetise the deal." />
            <Select
              value={inputs.exitStrategy}
              onValueChange={(v) =>
                onChange({ ...inputs, exitStrategy: v as typeof inputs.exitStrategy })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hold_rental">Buy & Hold (Rental)</SelectItem>
                <SelectItem value="flip">Fix & Flip</SelectItem>
                <SelectItem value="brrrr">BRRRR</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="lease_option">Lease Option</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {inputs.exitStrategy !== "flip" && inputs.exitStrategy !== "wholesale" && (
            <SliderInput
              label="Hold Period"
              value={inputs.simulationYears}
              onChange={(v) => onChange({ ...inputs, simulationYears: v })}
              min={1}
              max={30}
              step={1}
              suffix=" yrs"
              tip="Number of years to model the investment."
            />
          )}
        </CardContent>
      </Card>

      {/* ── Financing ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Financing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <FieldLabel label="Financing Strategy" />
            <Select
              value={inputs.financing.strategy}
              onValueChange={(v) => setFinancing("strategy", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conventional">Conventional Mortgage</SelectItem>
                <SelectItem value="hard_money">Hard Money Loan</SelectItem>
                <SelectItem value="seller_finance">Seller Financing</SelectItem>
                <SelectItem value="cash">All Cash</SelectItem>
                <SelectItem value="brrrr">BRRRR Financing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SliderInput
            label="Down Payment"
            value={inputs.financing.downPaymentPercent}
            onChange={(v) => setFinancing("downPaymentPercent", v)}
            min={0}
            max={100}
            step={1}
            suffix="%"
            tip="Percentage of purchase price paid upfront."
          />
          <SliderInput
            label="Interest Rate"
            value={inputs.financing.interestRate}
            onChange={(v) => setFinancing("interestRate", v)}
            min={0}
            max={20}
            step={0.125}
            suffix="%"
          />
          <SliderInput
            label="Loan Term"
            value={inputs.financing.loanTermYears}
            onChange={(v) => setFinancing("loanTermYears", v)}
            min={1}
            max={40}
            step={1}
            suffix=" yrs"
          />
          <div className="grid grid-cols-2 gap-3">
            <SliderInput
              label="Closing Costs"
              value={inputs.financing.closingCostPercent}
              onChange={(v) => setFinancing("closingCostPercent", v)}
              min={0}
              max={10}
              step={0.25}
              suffix="%"
            />
            <SliderInput
              label="Points"
              value={inputs.financing.pointsPaid}
              onChange={(v) => setFinancing("pointsPaid", v)}
              min={0}
              max={5}
              step={0.5}
              suffix=" pts"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Rehab ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rehab & Holding Costs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NumberInput
            label="Estimated Rehab Cost"
            prefix="$"
            value={inputs.rehab.estimatedCost}
            onChange={(v) => setRehab("estimatedCost", v)}
            min={0}
            step={1000}
            tip="Estimated cost of repairs and improvements."
          />
          <SliderInput
            label="Contingency"
            value={inputs.rehab.contingencyPercent}
            onChange={(v) => setRehab("contingencyPercent", v)}
            min={0}
            max={50}
            step={5}
            suffix="%"
            tip="Buffer over estimated rehab cost for surprises."
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Duration (months)"
              value={inputs.rehab.durationMonths}
              onChange={(v) => setRehab("durationMonths", v)}
              min={0}
              max={60}
              step={1}
            />
            <NumberInput
              label="Holding Cost/mo"
              prefix="$"
              value={inputs.rehab.holdingCostPerMonth}
              onChange={(v) => setRehab("holdingCostPerMonth", v)}
              min={0}
              step={100}
              tip="Monthly cost to hold while rehabbing (taxes, insurance, utilities, loan interest)."
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Rental ── */}
      {inputs.exitStrategy !== "flip" && inputs.exitStrategy !== "wholesale" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rental Income</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NumberInput
              label="Monthly Rent"
              prefix="$"
              value={inputs.rental.monthlyRent}
              onChange={(v) => setRental("monthlyRent", v)}
              min={0}
              step={50}
            />
            <Separator />
            <SliderInput
              label="Vacancy Rate"
              value={inputs.rental.vacancyRatePercent}
              onChange={(v) => setRental("vacancyRatePercent", v)}
              min={0}
              max={30}
              step={0.5}
              suffix="%"
              tip="Percentage of time the property sits vacant."
            />
            <SliderInput
              label="Property Management"
              value={inputs.rental.propertyManagementPercent}
              onChange={(v) => setRental("propertyManagementPercent", v)}
              min={0}
              max={20}
              step={0.5}
              suffix="% of EGI"
              tip="Management fee as a percentage of effective gross income."
            />
            <SliderInput
              label="Maintenance & CapEx"
              value={inputs.rental.maintenancePercent}
              onChange={(v) => setRental("maintenancePercent", v)}
              min={0}
              max={20}
              step={0.5}
              suffix="% of EGI"
            />
            <Separator />
            <SliderInput
              label="Annual Appreciation"
              value={inputs.rental.annualAppreciationPercent}
              onChange={(v) => setRental("annualAppreciationPercent", v)}
              min={-5}
              max={20}
              step={0.5}
              suffix="%"
            />
            <SliderInput
              label="Annual Rent Growth"
              value={inputs.rental.rentGrowthPercent}
              onChange={(v) => setRental("rentGrowthPercent", v)}
              min={-5}
              max={15}
              step={0.5}
              suffix="%"
            />
          </CardContent>
        </Card>
      )}

      {/* ── Market ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Market Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <FieldLabel label="Market Condition" />
            <Select
              value={inputs.market.condition}
              onValueChange={(v) => setMarket("condition", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyers">Buyer's Market</SelectItem>
                <SelectItem value="balanced">Balanced Market</SelectItem>
                <SelectItem value="sellers">Seller's Market</SelectItem>
                <SelectItem value="boom">Boom Market</SelectItem>
                <SelectItem value="recession">Recession</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SliderInput
            label="ARV Multiplier"
            value={inputs.market.arvMultiplier}
            onChange={(v) => setMarket("arvMultiplier", v)}
            min={0.8}
            max={2.0}
            step={0.05}
            suffix="x"
            tip="After-repair value as a multiple of (purchase price + rehab). 1.2x means the rehabbed property is worth 20% more than you put in."
          />
          <SliderInput
            label="Market Cap Rate"
            value={inputs.market.capRate}
            onChange={(v) => setMarket("capRate", v)}
            min={2}
            max={15}
            step={0.25}
            suffix="%"
          />
          <SliderInput
            label="Price Appreciation"
            value={inputs.market.priceAppreciationPercent}
            onChange={(v) => setMarket("priceAppreciationPercent", v)}
            min={-10}
            max={20}
            step={0.5}
            suffix="%/yr"
          />
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={onRun}>
        Run Simulation
      </Button>
    </div>
  )
}
