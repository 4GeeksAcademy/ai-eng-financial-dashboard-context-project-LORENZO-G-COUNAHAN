import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { MetricsAlert } from '@/lib/financial-types'
import { formatCurrency } from '@/lib/financial-utils'

interface AnomalyAlertsTableProps {
  alerts: MetricsAlert[]
  threshold: number
  onThresholdChange: (threshold: number) => void
  loading?: boolean
}

export function AnomalyAlertsTable({
  alerts,
  threshold,
  onThresholdChange,
  loading = false,
}: AnomalyAlertsTableProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base font-semibold">Alertas de anomalías</CardTitle>
          <CardDescription className="mt-1">
            Periodos en los que el gasto supera el umbral respecto a los tres periodos anteriores.
          </CardDescription>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Umbral</span>
          <input
            aria-label="Umbral de alerta"
            className="w-24 rounded-md border border-border bg-background px-3 py-2 text-foreground"
            type="number"
            min={0.01}
            max={1}
            step={0.01}
            value={threshold}
            onChange={(event) => {
              const value = event.currentTarget.valueAsNumber
              if (Number.isFinite(value) && value >= 0.01 && value <= 1) {
                onThresholdChange(value)
              }
            }}
          />
        </label>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p role="status" className="py-8 text-center text-sm text-muted-foreground">
            Cargando alertas…
          </p>
        ) : alerts.length === 0 ? (
          <p role="status" className="py-8 text-center text-sm text-muted-foreground">
            anomalía no detectada
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">
                Alertas de anomalías: periodos en los que el gasto supera el umbral configurado respecto a los tres periodos anteriores.
              </caption>
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-3">Periodo</th>
                  <th scope="col" className="px-3 py-3">Outcome registrado</th>
                  <th scope="col" className="px-3 py-3">Media móvil de los tres periodos anteriores</th>
                  <th scope="col" className="px-3 py-3">Incremento porcentual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {alerts.map((alert) => (
                  <tr key={alert.period}>
                    <td className="px-3 py-3 font-medium text-foreground">{alert.period}</td>
                    <td className="px-3 py-3 text-foreground">{formatCurrency(alert.outcome_total)}</td>
                    <td className="px-3 py-3 text-foreground">{formatCurrency(alert.baseline_average)}</td>
                    <td className="px-3 py-3 text-foreground">{(alert.increase_ratio * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
