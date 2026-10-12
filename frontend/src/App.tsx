import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import { AnomalyAlertsTable } from "@/components/dashboard/anomaly-alerts-table";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MetricsAlert,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

interface MetricsFacets {
  min_date: string;
  max_date: string;
}

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
  const [movements, setMovements] = useState<FinancialMovement[]>([]);
  const [alerts, setAlerts] = useState<MetricsAlert[]>([]);
  const [threshold, setThreshold] = useState(0.03);
  const [loading, setLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const invertedRange = Boolean(startDate && endDate && endDate < startDate);

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
      setMovements([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
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
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [startDate, endDate, invertedRange]);

  useEffect(() => {
    if (invertedRange) {
      setAlerts([]);
      setAlertsLoading(false);
      return;
    }

    const controller = new AbortController();
    setAlertsLoading(true);
    setError(null);
    fetchAlerts(threshold, startDate, endDate, controller.signal)
      .then(setAlerts)
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("No se pudieron cargar las alertas de anomalías.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAlertsLoading(false);
      });
    return () => controller.abort();
  }, [threshold, startDate, endDate, invertedRange]);

  const metrics: KPIMetrics | null = useMemo(
    () => (movements.length ? computeKPIs(movements) : null),
    [movements],
  );
  const monthlyData: MonthlyDataPoint[] = useMemo(
    () => computeMonthlyData(movements),
    [movements],
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

          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            minDate={facets?.min_date}
            maxDate={facets?.max_date}
          />

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

          {!loading && !error && !invertedRange && movements.length === 0 ? (
            <div role="status" className="rounded-lg border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
              No hay datos para mostrar en el periodo seleccionado.
            </div>
          ) : null}

          <section aria-label="Key performance indicators">
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <IncomeOutcomeChart data={monthlyData} loading={loading} />
            <ProfitPercentChart data={monthlyData} loading={loading} />
          </section>

          <section aria-label="Anomaly alerts">
            <AnomalyAlertsTable
              alerts={alerts}
              threshold={threshold}
              onThresholdChange={setThreshold}
              loading={alertsLoading}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
