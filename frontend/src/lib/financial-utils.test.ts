import { describe, expect, it } from "vitest";

import {
  computeKPIs,
  computeMonthlyData,
  calculateCategoryIncomeShares,
  completeCategoryIncomeShares,
  formatCurrency,
  formatPercent,
} from "./financial-utils";
import type { FinancialMovement } from "./financial-types";
import type { TopCategoryItem } from "./financial-types";

const sampleMovements: FinancialMovement[] = [
  {
    create_date: "2024-01-10",
    amount: 1000,
    operation_type: "income",
    category: "sales",
    business_type: "B2B",
  },
  {
    create_date: "2024-01-15",
    amount: 250,
    operation_type: "outcome",
    category: "suppliers",
    business_type: "B2B",
  },
  {
    create_date: "2024-02-01",
    amount: 500,
    operation_type: "income",
    category: "sales",
    business_type: "B2C",
  },
];

describe("computeKPIs", () => {
  it("calculates totals and profit values", () => {
    const metrics = computeKPIs(sampleMovements);

    expect(metrics).toEqual({
      totalIncome: 1500,
      totalOutcome: 250,
      profit: 1250,
      profitPercent: (1250 / 1500) * 100,
    });
  });

  it("returns 0 profitPercent when there is no income", () => {
    const onlyOutcomes: FinancialMovement[] = [
      {
        create_date: "2024-03-05",
        amount: 350,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
    ];

    const metrics = computeKPIs(onlyOutcomes);
    expect(metrics.profitPercent).toBe(0);
  });
});

describe("computeMonthlyData", () => {
  it("returns chronological year-month points with aggregated totals", () => {
    const unsortedCrossYearMovements: FinancialMovement[] = [
      {
        create_date: "2026-01-08",
        amount: 300,
        operation_type: "income",
        category: "sales",
        business_type: "B2C",
      },
      {
        create_date: "2025-12-05",
        amount: 200,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
      {
        create_date: "2025-12-03",
        amount: 1000,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
    ];
    const monthlyData = computeMonthlyData(unsortedCrossYearMovements);

    expect(monthlyData).toHaveLength(2);
    expect(monthlyData[0]).toEqual({
      month: "Dec 2025",
      income: 1000,
      outcome: 200,
      profitPercent: 80,
    });
    expect(monthlyData[1]).toEqual({
      month: "Jan 2026",
      income: 300,
      outcome: 0,
      profitPercent: 100,
    });
  });

  it("keeps the calendar month for ISO dates on month boundaries", () => {
    const boundaryMovements: FinancialMovement[] = [
      {
        create_date: "2025-03-01",
        amount: 100,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
      {
        create_date: "2025-02-28",
        amount: 25,
        operation_type: "outcome",
        category: "suppliers",
        business_type: "B2B",
      },
    ];

    expect(computeMonthlyData(boundaryMovements).map(({ month }) => month)).toEqual([
      "Feb 2025",
      "Mar 2025",
    ]);
  });
});

describe("formatters", () => {
  it("formats currency without decimals", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });

  it("formats percent with one decimal", () => {
    expect(formatPercent(15.555)).toBe("15.6%");
  });
});

describe("calculateCategoryIncomeShares", () => {
  const topCategories: TopCategoryItem[] = [
    { category: "sales", operation_type: "income", total_amount: 250 },
    { category: "others", operation_type: "income", total_amount: 50 },
  ];

  it("calculates each top category as a share of all group income", () => {
    expect(calculateCategoryIncomeShares(topCategories, 1000)).toEqual([
      { ...topCategories[0], percentage: 25 },
      { ...topCategories[1], percentage: 5 },
    ]);
  });

  it("uses zero shares when the group has no income", () => {
    expect(calculateCategoryIncomeShares(topCategories, 0).map((item) => item.percentage)).toEqual([
      0,
      0,
    ]);
  });
});

describe("completeCategoryIncomeShares", () => {
  it("includes all facet categories and assigns zero to categories outside the top list", () => {
    const categories = ["administrative", "operational", "others", "sales", "suppliers"] as const;
    const topCategories: TopCategoryItem[] = [
      { category: "sales", operation_type: "income", total_amount: 250 },
      { category: "others", operation_type: "income", total_amount: 50 },
    ];

    expect(completeCategoryIncomeShares(categories.slice(), topCategories, 1000)).toEqual([
      { category: "administrative", operation_type: "income", total_amount: 0, percentage: 0 },
      { category: "operational", operation_type: "income", total_amount: 0, percentage: 0 },
      { category: "others", operation_type: "income", total_amount: 50, percentage: 5 },
      { category: "sales", operation_type: "income", total_amount: 250, percentage: 25 },
      { category: "suppliers", operation_type: "income", total_amount: 0, percentage: 0 },
    ]);
  });

  it("completes outcome categories and calculates their share against outcome total", () => {
    const categories = ["administrative", "operational", "others", "sales", "suppliers"] as const;
    const topCategories: TopCategoryItem[] = [
      { category: "suppliers", operation_type: "outcome", total_amount: 75 },
    ];

    expect(completeCategoryIncomeShares(categories.slice(), topCategories, 300, "outcome")).toEqual([
      { category: "administrative", operation_type: "outcome", total_amount: 0, percentage: 0 },
      { category: "operational", operation_type: "outcome", total_amount: 0, percentage: 0 },
      { category: "others", operation_type: "outcome", total_amount: 0, percentage: 0 },
      { category: "sales", operation_type: "outcome", total_amount: 0, percentage: 0 },
      { category: "suppliers", operation_type: "outcome", total_amount: 75, percentage: 25 },
    ]);
    expect(completeCategoryIncomeShares(categories.slice(), topCategories, 0, "outcome")
      .every((item) => item.percentage === 0)).toBe(true);
  });
});
