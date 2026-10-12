# Tareas: filtro de rango de fechas

- [x] **T001** Confirmar el contrato existente de `GET /api/metrics/facets` (`min_date`, `max_date`) y de `GET /api/metrics` (`start_date`, `end_date`), incluidos los límites inclusivos.
- [x] **T002** Definir y documentar el comportamiento para un rango invertido: validación en la interfaz y si también se validará en `GET /api/metrics`.
- [ ] **T003** Añadir los campos de fecha de inicio y fin opcionales en la parte superior y mostrar junto a ellos `min_date` y `max_date` obtenidos de facets. (`frontend/src/App.tsx`, `frontend/src/components/dashboard/date-range-filter.tsx`)
- [ ] **T004** Enviar las fechas no vacías a `/api/metrics` en formato `YYYY-MM-DD` y actualizar KPI, gráficos y periodo visible usando el mismo conjunto filtrado. (`frontend/src/App.tsx`, `frontend/src/components/dashboard/dashboard-header.tsx`)
- [ ] **T005** Informar del rango invertido en la interfaz y validar `end_date < start_date` en `GET /api/metrics` con la prueba de contrato correspondiente. (`frontend/src/App.tsx`, `backend/app/routes.py`, `backend/tests/test_routes.py`)
- [ ] **T006** Mostrar un estado vacío cuando el periodo seleccionado no contiene movimientos. (`frontend/src/App.tsx`)
- [ ] **T007** Ejecutar la verificación básica indicada en el plan: pruebas, build y lint frontend y pruebas backend al haber cambiado el backend; realizar la comprobación funcional de rango completo, ambos límites, límite único, sin fechas y periodo sin resultados.
- [ ] **T008** Verificar uno por uno todos los criterios de aceptación de `spec.md` y registrar para cada uno `cumple` o `no cumple` junto con evidencia breve.
