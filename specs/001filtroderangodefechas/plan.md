# Plan de actuación: filtro de rango de fechas

## 1. Alcance técnico

El backend ya ofrece `GET /api/metrics/facets`, que devuelve `min_date` y `max_date`, y `GET /api/metrics` ya acepta `start_date` y `end_date` con límites inclusivos. Por ello, la funcionalidad requiere principalmente conectar el frontend con capacidades existentes. Será necesario un cambio backend solo si se decide validar rangos invertidos en `GET /api/metrics`; actualmente esa validación está implementada para `/api/metrics/comparison`, no para la ruta de movimientos.

## 2. Cambios previstos

### Rangos invertidos

La interfaz mostrará un aviso y no enviará la consulta mientras `end_date` sea anterior a `start_date`. Además, `GET /api/metrics` rechazará el rango con HTTP 422 y el detalle `end_date must be on or after start_date`, para mantener el contrato seguro para clientes distintos de este frontend.

### Backend

- Reutilizar `GET /api/metrics/facets` para obtener y mostrar las fechas mínima y máxima del dataset.
- Revisar el comportamiento de `GET /api/metrics` ante rangos invertidos y, si se implementa el aviso requerido con una respuesta coherente de API, añadir su validación.

Archivos previstos si se requiere ese cambio:
- `backend/app/routes.py`
- `backend/tests/test_routes.py`

### Frontend

- Mostrar campos de fecha de inicio y fin en la parte superior del dashboard.
- Mostrar junto a ellos el rango disponible obtenido de facets.
- Solicitar movimientos usando las fechas definidas, sin enviar parámetros correspondientes a campos vacíos.
- Asegurar que KPI, gráficos y periodo visible representan los mismos resultados filtrados.
- Informar sobre un rango invertido y sobre la ausencia de resultados.

Archivos previstos:
- `frontend/src/App.tsx`
- `frontend/src/components/dashboard/dashboard-header.tsx`
- Nuevo `frontend/src/components/dashboard/date-range-filter.tsx` (si se separa el control visual en un componente).

Archivos opcionales, únicamente si se modifica o amplía lógica utilitaria:
- `frontend/src/lib/financial-utils.ts`
- `frontend/src/lib/financial-types.ts`
- `frontend/src/lib/financial-utils.test.ts`

## 3. Orden recomendado de tareas

1. Confirmar el contrato vigente de `facets` (`min_date`, `max_date`) y de `/api/metrics` (`start_date`, `end_date`), incluidos los límites inclusivos.
2. Definir el comportamiento esperado para un rango invertido y decidir si basta con impedirlo desde la interfaz o si también se valida en la ruta `/api/metrics`.
3. Añadir en frontend los campos de fecha en la parte superior y presentar la referencia del rango disponible.
4. Conectar la selección con la carga de `/api/metrics`, omitiendo los límites vacíos.
5. Comprobar que los KPI, los gráficos y el periodo mostrado se actualizan de forma consistente; completar mensajes de rango inválido y de resultados vacíos.
6. Ejecutar la verificación básica y corregir regresiones antes de integrar el cambio.

## 4. Verificación básica

- Backend, si se cambia: ejecutar `cd backend && pytest`; incluir cobertura de filtros por ambos límites, un solo límite y rango invertido si se agrega validación.
- Frontend: ejecutar `cd frontend && npm test -- --run`, `npm run build` y `npm run lint`.
- Verificación funcional manual: consultar sin fechas, con ambas fechas, con un solo límite, y un periodo sin resultados; confirmar inputs, rango disponible, formato `YYYY-MM-DD` y actualización de todos los datos visibles.

## 5. Riesgos para funcionalidad existente

- El endpoint de movimientos ya tiene filtros de fecha; la integración debe preservar su comportamiento cuando no se envían fechas y la inclusión de los límites.
- Si la carga de movimientos y facets se coordina incorrectamente, puede haber datos visibles sin su rango disponible, o controles que parezcan listos antes de tener la referencia.
- Cambiar el periodo visible de la cabecera puede reemplazar la etiqueta fija actual; debe evitarse que vuelva a indicar un periodo que no corresponda a los datos.
- Si se añade validación backend para rangos invertidos, clientes existentes que envíen rangos invertidos pasarán de recibir una lista (probablemente vacía) a recibir un error. El contrato debe quedar claro y la interfaz debe evitar solicitudes de ese tipo.
- No se esperan cambios en los cálculos de KPI o gráficos; el principal riesgo es que algún componente continúe usando datos sin filtrar en lugar de la misma respuesta filtrada.
