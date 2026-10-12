# Tareas: comparativa B2B vs B2C

## Frontend

- [x] **T001** Definir los tipos y cálculos de presentación requeridos para datos top por grupo y porcentaje sobre el total de ingresos B2B/B2C. Evidencia: tipos `MetricsFacets`, `TopCategoryItem` y `CategoryIncomeShare`; cálculo en `calculateCategoryIncomeShares` cubierto para total > 0 y total 0. El analizador del editor no reporta errores en los archivos tocados.
- [x] **T002** Crear los componentes de dos secciones paralelas que muestren hasta cinco categorías de ingresos por grupo, con categoría, total y porcentaje. Evidencia: `BusinessIncomePanel` presenta tabla, usa `slice(0, 5)` y expone columnas de categoría, ingresos y porcentaje; análisis del editor sin errores.
- [x] **T003** Añadir debajo de las secciones un único gráfico que compare visualmente los ingresos B2B y B2C. Evidencia: `BusinessIncomeComparisonChart` implementa un gráfico de barras con series B2B y B2C; análisis del editor sin errores.
- [x] **T004** Añadir navegación/acceso a la nueva vista y conectar facets, las consultas top por negocio y los totales de ingresos, aplicando el mismo rango `YYYY-MM-DD` a todas las solicitudes y evitando consultas con rango invertido. Evidencia: `App.tsx` ofrece navegación a la vista y consulta facets; ambas llamadas top fijan `operation_type=income`, `limit=5` y `business_type`; llamadas de top e ingresos comparten `start_date`/`end_date` en formato de `<input type="date">`; `invertedRange` impide iniciar/reutilizar las consultas y limpia sus resultados.

## Verificación

- [x] **T005** Ejecutar las pruebas backend y frontend, build y lint definidos en el plan; resolver fallos atribuibles a los cambios sin modificar la configuración de las herramientas de testing. Evidencia: `cd backend && pytest` pasó (22 tests). En frontend, `npm ci` y las verificaciones se ejecutaron en `/tmp/financial-dashboard-frontend` porque el `node_modules` del workspace pertenece a `root` y bloquea escrituras: `npm test -- --run` pasó (8 tests), `npm run build` pasó y `npm run lint` pasó. Se corrigieron hallazgos de lint en `App.tsx` evitando actualizaciones síncronas de estado dentro de efectos. Build informa solo una advertencia de chunk >500 kB. No se cambió la configuración de testing.
- [x] **T006** Verificar uno por uno los criterios de aceptación de `spec.md` y registrar para cada uno `cumple` o `no cumple` con evidencia breve. Evidencia por revisión del código, pruebas automatizadas, build y lint (la comprobación manual en navegador queda pendiente):
	- **Cumple** — Vista identificable: botón «Comparativa B2B vs B2C» cambia a la vista dedicada en `App.tsx`.
	- **Cumple** — Secciones en paralelo: `BusinessIncomePanel` B2B y B2C se renderizan en una grilla de dos columnas desde breakpoint `lg`.
	- **Cumple** — Hasta cinco categorías con nombre, ingresos y porcentaje: panel limita con `slice(0, 5)` y presenta esas columnas; porcentajes se calculan con total del grupo y manejan total cero.
	- **Cumple** — Único gráfico bajo las secciones: un único `BusinessIncomeComparisonChart` se monta después de ambas tablas.
	- **Cumple** — Rango compartido en formato de fecha: filtro usa controles `type="date"` y las peticiones top y de ingresos reciben los mismos valores `start_date` y `end_date`.
	- **Cumple** — Facets: `fetchFacets` consulta `/api/metrics/facets` y sus categorías se utilizan para limitar las categorías del gráfico.
	- **Cumple** — Top por línea de negocio: se solicitan las categorías para B2B y B2C desde `/api/metrics/categories/top` con `operation_type=income`, `limit=5` y el `business_type` correspondiente.
