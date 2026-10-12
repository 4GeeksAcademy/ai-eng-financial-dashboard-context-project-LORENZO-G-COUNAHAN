import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import { AnomalyAlertsTable } from "@/components/dashboard/anomaly-alerts-table";
import { BusinessIncomePanel } from "@/components/dashboard/business-income-panel";
import { BusinessIncomeComparisonChart } from "@/components/dashboard/business-income-comparison-chart";
import {
  type BusinessIncomeComparisonPoint,
  type BusinessType,
  type CategoryIncomeShare,
  type Category,
  type FinancialMovement,
  type KPIMetrics,
  type MetricsFacets,
  type MetricsAlert,
  type MonthlyDataPoint,
  type TopCategoryItem,
} from "@/lib/financial-types";
import {
  calculateCategoryIncomeShares,
  computeKPIs,
  computeMonthlyData,
} from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const EMPTY_MOVEMENTS: FinancialMovement[] = [];
const EMPTY_ALERTS: MetricsAlert[] = [];
const EMPTY_CATEGORY_SHARES: CategoryIncomeShare[] = [];
const EMPTY_COMPARISON_DATA: BusinessIncomeComparisonPoint[] = [];

async function fetchFinancialData(
  startDate: string,
  endDate: string,
  signal: AbortSignal,
): Promise<FinancialMovement[]> {
  const params = new URLSearchParams();
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);
  const query = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/api/metrics${query ? `?${query}` : ""}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

async function fetchTopIncomeCategories(
  businessType: BusinessType,
  startDate: string,
  endDate: string,
  signal: AbortSignal,
): Promise<TopCategoryItem[]> {
  const params = new URLSearchParams({
    operation_type: "income",
    limit: "5",
    business_type: businessType,
  });
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);
  const response = await fetch(
    `${API_BASE_URL}/api/metrics/categories/top?${params.toString()}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch ${businessType} top income categories: ${response.status}`);
  }
  return response.json();
}

async function fetchBusinessIncome(
  businessType: BusinessType,
  startDate: string,
  endDate: string,
  signal: AbortSignal,
): Promise<FinancialMovement[]> {
  const params = new URLSearchParams({ operation_type: "income" });
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);
  const response = await fetch(
    `${API_BASE_URL}/api/metrics/${businessType.toLowerCase()}?${params.toString()}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch ${businessType} income: ${response.status}`);
  }
  return response.json();
}

function buildComparisonData(
  b2bCategories: TopCategoryItem[],
  b2cCategories: TopCategoryItem[],
  availableCategories: Category[],
): BusinessIncomeComparisonPoint[] {
  const availableCategorySet = new Set<Category>(availableCategories);
  const categorySet = new Set(
    [...b2bCategories, ...b2cCategories]
      .map((item) => item.category)
      .filter((category) => availableCategorySet.has(category)),
  );
  const b2bTotals = new Map(b2bCategories.map((item) => [item.category, item.total_amount]));
  const b2cTotals = new Map(b2cCategories.map((item) => [item.category, item.total_amount]));
  return [...categorySet].map((category) => ({
    category,
    B2B: b2bTotals.get(category) ?? 0,
    B2C: b2cTotals.get(category) ?? 0,
  }));
}

async function fetchFacets(signal: AbortSignal): Promise<MetricsFacets> {
  const response = await fetch(`${API_BASE_URL}/api/metrics/facets`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch financial date range: ${response.status}`);
  }
  return response.json();
}

async function fetchAlerts(
  threshold: number,
  startDate: string,
  endDate: string,
  signal: AbortSignal,
): Promise<MetricsAlert[]> {
  const params = new URLSearchParams({ threshold: String(threshold) });
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);
  const response = await fetch(
    `${API_BASE_URL}/api/metrics/alerts?${params.toString()}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch anomaly alerts: ${response.status}`);
  }
  return response.json();
}

function App() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [facets, setFacets] = useState<MetricsFacets | null>(null);
  const [view, setView] = useState<"overview" | "comparison">("overview");
  const [movements, setMovements] = useState<FinancialMovement[]>([]);
  const [alerts, setAlerts] = useState<MetricsAlert[]>([]);
  const [threshold, setThreshold] = useState(0.03);
  const [b2bCategories, setB2bCategories] = useState<CategoryIncomeShare[]>([]);
  const [b2cCategories, setB2cCategories] = useState<CategoryIncomeShare[]>([]);
  const [comparisonData, setComparisonData] = useState<BusinessIncomeComparisonPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requestState, setRequestState] = useState({
    movements: { key: "", loading: true },
    alerts: { key: "", loading: true },
    comparison: { key: "", loading: true },
  });

  const invertedRange = Boolean(startDate && endDate && endDate < startDate);
  const movementsKey = `${startDate}|${endDate}`;
  const alertsKey = `${threshold}|${startDate}|${endDate}`;
  const comparisonKey = `${startDate}|${endDate}|${facets ? "ready" : "pending"}`;

  useEffect(() => {
    const controller = new AbortController();
    fetchFacets(controller.signal)
      .then(setFacets)
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("No se pudo cargar el rango disponible desde la API.");
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (invertedRange) {
      return;
    }

    const controller = new AbortController();
    const requestKey = movementsKey;
    fetchFinancialData(startDate, endDate, controller.signal)
      .then(setMovements)
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(
            "No se pudo cargar la informacion financiera. Revisa la API de backend.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setRequestState((state) => ({ ...state, movements: { key: requestKey, loading: false } }));
        }
      });
    return () => controller.abort();
  }, [startDate, endDate, invertedRange, movementsKey]);

  useEffect(() => {
    if (invertedRange) {
      return;
    }

    const controller = new AbortController();
    const requestKey = alertsKey;
    fetchAlerts(threshold, startDate, endDate, controller.signal)
      .then(setAlerts)
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("No se pudieron cargar las alertas de anomalías.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setRequestState((state) => ({ ...state, alerts: { key: requestKey, loading: false } }));
        }
      });
    return () => controller.abort();
  }, [threshold, startDate, endDate, invertedRange, alertsKey]);

  useEffect(() => {
    if (invertedRange) {
      return;
    }
    if (!facets) {
      return;
    }

    const controller = new AbortController();
    const requestKey = comparisonKey;
    Promise.all([
      fetchTopIncomeCategories("B2B", startDate, endDate, controller.signal),
      fetchTopIncomeCategories("B2C", startDate, endDate, controller.signal),
      fetchBusinessIncome("B2B", startDate, endDate, controller.signal),
      fetchBusinessIncome("B2C", startDate, endDate, controller.signal),
    ])
      .then(([b2bTop, b2cTop, b2bMovements, b2cMovements]) => {
        const b2bTotal = b2bMovements.reduce((total, movement) => total + movement.amount, 0);
        const b2cTotal = b2cMovements.reduce((total, movement) => total + movement.amount, 0);
        setB2bCategories(calculateCategoryIncomeShares(b2bTop, b2bTotal));
        setB2cCategories(calculateCategoryIncomeShares(b2cTop, b2cTotal));
        setComparisonData(buildComparisonData(b2bTop, b2cTop, facets.categories));
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("No se pudo cargar la comparativa B2B vs B2C.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setRequestState((state) => ({ ...state, comparison: { key: requestKey, loading: false } }));
        }
      });
    return () => controller.abort();
  }, [startDate, endDate, invertedRange, facets, comparisonKey]);

  const loading = requestState.movements.key !== movementsKey || requestState.movements.loading;
  const alertsLoading = requestState.alerts.key !== alertsKey || requestState.alerts.loading;
  const comparisonLoading = requestState.comparison.key !== comparisonKey || requestState.comparison.loading;
  const visibleMovements = invertedRange ? EMPTY_MOVEMENTS : movements;
  const visibleAlerts = invertedRange ? EMPTY_ALERTS : alerts;
  const visibleB2bCategories = invertedRange ? EMPTY_CATEGORY_SHARES : b2bCategories;
  const visibleB2cCategories = invertedRange ? EMPTY_CATEGORY_SHARES : b2cCategories;
  const visibleComparisonData = invertedRange ? EMPTY_COMPARISON_DATA : comparisonData;

  const metrics: KPIMetrics | null = useMemo(
    () => (visibleMovements.length ? computeKPIs(visibleMovements) : null),
    [visibleMovements],
  );
  const monthlyData: MonthlyDataPoint[] = useMemo(
    () => computeMonthlyData(visibleMovements),
    [visibleMovements],
  );
  const period = startDate || endDate
    ? `${startDate || "…"} — ${endDate || "…"}`
    : facets
      ? `${facets.min_date} — ${facets.max_date}`
      : "";

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period={period} />

          <nav aria-label="Vistas del dashboard" className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-md border px-4 py-2 text-sm ${view === "overview" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}
              aria-current={view === "overview" ? "page" : undefined}
              onClick={() => setView("overview")}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`rounded-md border px-4 py-2 text-sm ${view === "comparison" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}
              aria-current={view === "comparison" ? "page" : undefined}
              onClick={() => setView("comparison")}
            >
              Comparativa B2B vs B2C
            </button>
          </nav>

          {view === "overview" ? (
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              minDate={facets?.min_date}
              maxDate={facets?.max_date}
            />
          ) : null}

          {view === "comparison" ? (
            <section aria-label="Filtro de fechas para comparativa">
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                minDate={facets?.min_date}
                maxDate={facets?.max_date}
              />
            </section>
          ) : null}

          {invertedRange ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
            >
              El rango no es válido: la fecha de fin debe ser igual o posterior a la fecha de inicio.
            </div>
          ) : null}

          {error ? (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : null}

          {view === "overview" && !loading && !error && !invertedRange && movements.length === 0 ? (
            <div role="status" className="rounded-lg border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
              No hay datos para mostrar en el periodo seleccionado.
            </div>
          ) : null}

          {view === "overview" ? (
            <>
              <section aria-label="Key performance indicators">
                <KPIRow metrics={metrics} loading={invertedRange ? false : loading} />
              </section>
              <section
                aria-label="Financial charts"
                className="grid grid-cols-1 gap-4 xl:grid-cols-2"
              >
                <IncomeOutcomeChart data={monthlyData} loading={invertedRange ? false : loading} />
                <ProfitPercentChart data={monthlyData} loading={invertedRange ? false : loading} />
              </section>
              <section aria-label="Anomaly alerts">
                <AnomalyAlertsTable
                  alerts={visibleAlerts}
                  threshold={threshold}
                  onThresholdChange={setThreshold}
                  loading={invertedRange ? false : alertsLoading}
                />
              </section>
            </>
          ) : (
            <>
              <header>
                <h2 className="text-2xl font-semibold">Comparativa B2B vs B2C</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ingresos principales por línea de negocio y porcentaje del total del grupo.
                </p>
              </header>
              <section aria-label="Categorías principales por negocio" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <BusinessIncomePanel businessType="B2B" categories={visibleB2bCategories} loading={invertedRange ? false : comparisonLoading} />
                <BusinessIncomePanel businessType="B2C" categories={visibleB2cCategories} loading={invertedRange ? false : comparisonLoading} />
              </section>
              <section aria-label="Gráfico comparativo de ingresos">
                <BusinessIncomeComparisonChart data={visibleComparisonData} loading={invertedRange ? false : comparisonLoading} />
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
