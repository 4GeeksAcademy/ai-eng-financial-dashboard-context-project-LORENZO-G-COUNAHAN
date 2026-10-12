# Tareas: comparativa B2B vs B2C con ingresos y egresos

## Frontend

- [x] **T001** Generalizar tipos y utilidades para completar categorías por operación y calcular porcentajes contra el total del mismo grupo y operación; añadir pruebas unitarias, incluyendo denominador cero. Evidencia: prueba Vitest de categorías outcome verifica porcentaje 75/300 y cero seguro para total cero; prueba existente cubre las cinco categorías income.
- [x] **T002** Actualizar las consultas de la vista para solicitar ingresos y egresos top para B2B y B2C, así como los cuatro conjuntos de movimientos usados para los denominadores; mantener rango de fechas común. Evidencia: `App.tsx` hace ocho solicitudes de comparación (4 top con operación, negocio y limit 5; 4 de movimientos con operación y mismas fechas) y backend pytest pasó 22 pruebas.
- [x] **T003** Actualizar cada panel para mostrar, por cada categoría de facets, importe y porcentaje de ingresos y egresos, con cero para categorías ausentes. Evidencia: cada panel recorre filas combinadas desde `facets.categories` y muestra columnas ingreso, % ingreso, egreso y % egreso; utilidades completan categorías ausentes con cero.
- [x] **T004** Actualizar el gráfico único para comparar ingresos y egresos de B2B y B2C por categoría. Evidencia: un `BusinessIncomeComparisonChart` sigue montándose debajo de los dos paneles y contiene las cuatro series B2B/B2C × ingreso/egreso.

## Verificación

- [x] **T005** Ejecutar backend pytest y frontend tests, build y lint existentes; resolver fallos causados por el cambio sin modificar configuración de pruebas. Si una limitación de permisos impide ejecutar dentro del workspace, documentar el método alternativo. Evidencia: backend `pytest`: 22 passed; en `/tmp/financial-dashboard-frontend`, frontend `npm test -- --run`: 10 passed, `npm run build`: pasó (advertencia existente de chunk >500 kB) y `npm run lint`: pasó. No se modificó configuración de pruebas.
- [x] **T006** Verificar individualmente cada criterio de aceptación actualizado en `spec.md` y registrar `cumple`/`no cumple` con evidencia breve, indicando si no se pudo hacer comprobación manual en navegador.

	- **Cumple** — Vista identificable B2B vs B2C: navegación y vista condicional en `frontend/src/App.tsx`.
	- **Cumple** — Dos secciones B2B/B2C en paralelo: ambos `BusinessIncomePanel` están en grilla de dos columnas desde `lg`.
	- **Cumple** — Todas las categorías disponibles con importe y porcentaje de ambas operaciones, y cero para ausentes: filas derivadas de `facets.categories`; `completeCategoryIncomeShares` conserva operación y calcula porcentaje con su denominador separado; Vitest cubre income, outcome y total cero.
	- **Cumple** — Un único gráfico inferior compara ingreso y egreso para B2B y B2C: una instancia con cuatro series por categoría.
	- **Cumple** — Rango compartido ISO: filtro `type=date`; funciones de consulta serializan `start_date`/`end_date` compartidos en `YYYY-MM-DD`; lógica existente bloquea rango invertido.
	- **Cumple** — Categorías de facets: `fetchFacets` consulta `/api/metrics/facets`, y `facets.categories` determina filas y datos del gráfico.
	- **Cumple** — Top por operación y grupo: se construyen solicitudes para `income` y `outcome`, `limit=5`, negocio B2B/B2C y rango seleccionado.
	- **No comprobado manualmente** — No se hizo inspección visual/interactiva en navegador; la evidencia anterior procede de código, pruebas, build y lint.
