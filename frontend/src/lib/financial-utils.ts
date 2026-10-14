import {
  type Category,
  type FinancialMovement,
  type TopCategoryItem,
  type CategoryIncomeShare,
  type OperationType,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "./financial-types";

function toYearMonthKey(isoDate: string): string {
  // FinancialMovement.create_date is a calendar date (YYYY-MM-DD), not an instant.
  // Keep its calendar month independent of the host's local timezone.
  const [year, month] = isoDate.split("-");
  return `${year}-${month}`;
}

function formatMonthYearLabel(yearMonthKey: string): string {
  const [yearText, monthText] = yearMonthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function computeKPIs(movements: FinancialMovement[]): KPIMetrics {
  let totalIncome = 0;
  let totalOutcome = 0;

  for (const m of movements) {
    if (m.operation_type === "income") {
      totalIncome += m.amount;
    } else {
      totalOutcome += m.amount;
    }
  }

  const profit = totalIncome - totalOutcome;
  const profitPercent = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

  return { totalIncome, totalOutcome, profit, profitPercent };
}

export function computeMonthlyData(
  movements: FinancialMovement[],
): MonthlyDataPoint[] {
  const monthlyMap: Record<string, { income: number; outcome: number }> = {};

  for (const m of movements) {
    const yearMonthKey = toYearMonthKey(m.create_date);
    if (!monthlyMap[yearMonthKey]) {
      monthlyMap[yearMonthKey] = { income: 0, outcome: 0 };
    }

    if (m.operation_type === "income") {
      monthlyMap[yearMonthKey].income += m.amount;
    } else {
      monthlyMap[yearMonthKey].outcome += m.amount;
    }
  }

  return Object.keys(monthlyMap)
    .sort()
    .map((yearMonthKey) => {
      const { income, outcome } = monthlyMap[yearMonthKey];
      const profit = income - outcome;
      const profitPercent = income > 0 ? (profit / income) * 100 : 0;
      return {
        month: formatMonthYearLabel(yearMonthKey),
        income,
        outcome,
        profitPercent,
      };
    });
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function calculateCategoryIncomeShares(
  topCategories: TopCategoryItem[],
  totalGroupIncome: number,
): CategoryIncomeShare[] {
  return topCategories.map((item) => ({
    ...item,
    percentage:
      totalGroupIncome > 0 ? (item.total_amount / totalGroupIncome) * 100 : 0,
  }));
}

export function completeCategoryIncomeShares(
  availableCategories: Category[],
  topCategories: TopCategoryItem[],
  totalGroupIncome: number,
  operationType: OperationType = "income",
): CategoryIncomeShare[] {
  const totalsByCategory = new Map(
    topCategories.map((item) => [item.category, item.total_amount]),
  );
  const allCategories: TopCategoryItem[] = availableCategories.map((category) => ({
    category,
    operation_type: operationType,
    total_amount: totalsByCategory.get(category) ?? 0,
  }));

  return calculateCategoryIncomeShares(allCategories, totalGroupIncome);
}
