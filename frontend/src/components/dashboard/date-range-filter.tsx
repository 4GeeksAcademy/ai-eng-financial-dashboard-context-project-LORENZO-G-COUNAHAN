interface DateRangeFilterProps {
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  minDate?: string
  maxDate?: string
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
}: DateRangeFilterProps) {
  return (
    <section
      aria-label="Filtro de rango de fechas"
      className="rounded-xl border border-border/60 bg-card p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          Fecha de inicio
          <input
            aria-label="Fecha de inicio"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          Fecha de fin
          <input
            aria-label="Fecha de fin"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            type="date"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
          />
        </label>
      </div>
      {minDate && maxDate ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Rango disponible: {minDate} — {maxDate}
        </p>
      ) : null}
    </section>
  )
}
