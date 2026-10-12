import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { BusinessIncomeComparisonPoint } from '@/lib/financial-types'
import { formatCurrency } from '@/lib/financial-utils'

interface BusinessIncomeComparisonChartProps {
  data: BusinessIncomeComparisonPoint[]
  loading?: boolean
}

export function BusinessIncomeComparisonChart({
  data,
  loading = false,
}: BusinessIncomeComparisonChartProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Comparativa de ingresos B2B vs B2C</CardTitle>
        <CardDescription>Ingresos por categoría dentro del periodo seleccionado</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div role="status" className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Cargando comparación…
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No hay ingresos para comparar en el periodo seleccionado.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.6} />
              <XAxis dataKey="category" tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                tickFormatter={(value: number) => formatCurrency(value)}
                width={88}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="B2B" name="B2B" fill="var(--chart-income)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="B2C" name="B2C" fill="var(--chart-profit)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
