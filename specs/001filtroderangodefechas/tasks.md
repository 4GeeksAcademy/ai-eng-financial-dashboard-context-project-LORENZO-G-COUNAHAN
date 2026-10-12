# Tareas: filtro de rango de fechas

- [x] **T001** Confirmar el contrato existente de `GET /api/metrics/facets` (`min_date`, `max_date`) y de `GET /api/metrics` (`start_date`, `end_date`), incluidos los límites inclusivos.
- [x] **T002** Definir y documentar el comportamiento para un rango invertido: validación en la interfaz y si también se validará en `GET /api/metrics`.
- [x] **T003** Crear los campos opcionales de fecha de inicio y fecha de fin en la parte superior del dashboard. (`frontend/src/components/dashboard/date-range-filter.tsx`, opcional; `frontend/src/App.tsx`)
- [x] **T004** Obtener `min_date` y `max_date` de facets y mostrarlos junto a los campos como rango disponible. (`frontend/src/App.tsx`, `frontend/src/components/dashboard/date-range-filter.tsx`)
- [x] **T005** Conectar las fechas seleccionadas con la consulta a `/api/metrics`, enviándolas como `YYYY-MM-DD` y omitiendo los límites vacíos. (`frontend/src/App.tsx`)
- [x] **T006** Actualizar KPI, gráficos y periodo mostrado para que representen el mismo conjunto de movimientos filtrados. (`frontend/src/App.tsx`, `frontend/src/components/dashboard/dashboard-header.tsx`)
- [x] **T007** Mostrar un aviso si el rango es invertido y un estado vacío si el periodo no contiene movimientos. (`frontend/src/App.tsx`, `frontend/src/components/dashboard/date-range-filter.tsx`, según organización final)
- [x] **T008** Si se acuerda validar rangos invertidos en el backend, añadir la validación a `GET /api/metrics`. (`backend/app/routes.py`)
- [x] **T009** Si cambia el contrato backend, añadir o actualizar pruebas para fechas de inicio y fin, límites inclusivos y rango invertido. (`backend/tests/test_routes.py`)
- [ ] **T010** Ejecutar pruebas, build y lint del frontend; ejecutar pruebas backend si se modificó el backend. (`frontend/src/lib/financial-utils.test.ts` u otras pruebas frontend que se añadan; `backend/tests/test_routes.py`)
- [ ] **T011** Realizar una comprobación funcional manual para rango completo, ambos límites, un solo límite, sin fechas y periodo sin resultados; confirmar el rango disponible y la actualización de los datos visibles.
