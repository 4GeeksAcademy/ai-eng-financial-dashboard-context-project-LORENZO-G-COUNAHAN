export type OperationType = 'income' | 'outcome'
export type Category = 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'
export type BusinessType = 'B2B' | 'B2C'

export interface FinancialMovement {
  create_date: string // ISO date
  amount: number
  operation_type: OperationType
  category: Category
  business_type: BusinessType
}

export interface KPIMetrics {
  totalIncome: number
  totalOutcome: number
  profit: number
  profitPercent: number
}

export interface MonthlyDataPoint {
  month: string
  income: number
  outcome: number
  profitPercent: number
}

export interface MetricsAlert {
  period: string
  outcome_total: number
  baseline_average: number
  increase_ratio: number
}

export interface MetricsFacets {
  operation_types: OperationType[]
  business_types: BusinessType[]
  categories: Category[]
  min_date: string
  max_date: string
}

export interface TopCategoryItem {
  category: Category
  operation_type: OperationType
  total_amount: number
}

export interface CategoryIncomeShare extends TopCategoryItem {
  percentage: number
}

export type CategoryOperationShare = CategoryIncomeShare

export interface BusinessCategoryComparisonRow {
  category: Category
  income: CategoryOperationShare
  outcome: CategoryOperationShare
}

export interface BusinessIncomeComparisonPoint {
  category: Category
  B2BIncome: number
  B2BOutcome: number
  B2CIncome: number
  B2COutcome: number
}
