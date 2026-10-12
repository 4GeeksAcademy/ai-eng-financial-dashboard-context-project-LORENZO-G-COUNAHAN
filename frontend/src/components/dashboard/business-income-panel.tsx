import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { BusinessCategoryComparisonRow, BusinessType } from '@/lib/financial-types'
import { formatCurrency } from '@/lib/financial-utils'

interface BusinessIncomePanelProps {
  businessType: BusinessType
  categories: BusinessCategoryComparisonRow[]
  loading?: boolean
}

export function BusinessIncomePanel({
  businessType,
  categories,
  loading = false,
}: BusinessIncomePanelProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{businessType}</CardTitle>
        <CardDescription>Ingresos y egresos por categoría</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p role="status" className="py-6 text-center text-sm text-muted-foreground">
            Cargando ingresos…
          </p>
        ) : categories.length === 0 ? (
          <p role="status" className="py-6 text-center text-sm text-muted-foreground">
            No hay movimientos para el periodo seleccionado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-3">Categoría</th>
                  <th scope="col" className="px-3 py-3 text-right">Ingresos</th>
                  <th scope="col" className="px-3 py-3 text-right">% ingresos</th>
                  <th scope="col" className="px-3 py-3 text-right">Egresos</th>
                  <th scope="col" className="px-3 py-3 text-right">% egresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {categories.map((item) => (
                  <tr key={item.category}>
                    <td className="px-3 py-3 font-medium capitalize text-foreground">{item.category}</td>
                    <td className="px-3 py-3 text-right text-foreground">{formatCurrency(item.income.total_amount)}</td>
                    <td className="px-3 py-3 text-right text-foreground">{item.income.percentage.toFixed(1)}%</td>
                    <td className="px-3 py-3 text-right text-foreground">{formatCurrency(item.outcome.total_amount)}</td>
                    <td className="px-3 py-3 text-right text-foreground">{item.outcome.percentage.toFixed(1)}%</td>
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
