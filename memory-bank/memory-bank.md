# Memory bank

**Proyecto:** Financial Metrics Dashboard  
**Revisión del código:** 2026-10-07

## Producto

Aplicación web que muestra indicadores de ingresos, egresos y rentabilidad, junto con gráficos mensuales. El backend genera movimientos de ejemplo; no hay una base de datos declarada en `docker-compose.yml`.

La pantalla del frontend consume `GET /api/metrics` y calcula los KPI y agregados mensuales. El backend también define rutas para facets, resúmenes, categorías principales, comparación, alertas y filtros B2B/B2C; no todas están conectadas a la interfaz.

## Stack

- **Frontend:** React, TypeScript, Vite, Recharts y Tailwind CSS.
- **Backend:** Python, FastAPI, Pydantic y Uvicorn.
- **Pruebas:** Vitest en frontend; pytest y TestClient en backend.
- **Ejecución local:** Docker Compose con servicios frontend y backend. Vite proxy `/api` hacia `backend:8000`.

Comando documentado para iniciar el proyecto:

```bash
docker compose up --build
```

## Estado actual

### Funcionalidades

- El frontend solicita movimientos, presenta estados de carga/error, calcula KPI y renderiza gráficos mensuales.
- El backend genera 360 movimientos de ejemplo ordenados; usa una instancia local `random.Random` para la semilla.
- La comparación rechaza intervalos donde `end_date` es anterior a `start_date` con HTTP 422.
- La agrupación mensual del frontend usa el año/mes de la fecha ISO sin depender de la zona horaria local.
- Hay pruebas para cálculos y fechas en frontend, y generación, filtros y endpoints en backend. La existencia de las pruebas no significa que se hayan ejecutado o pasado recientemente.

### Gaps observados

- Los datos son simulados y no se persisten.
- La etiqueta del dashboard es fija (`2024 - Full Year`), aunque el generador basa las fechas en el año actual.
- La configuración observada es de desarrollo: CORS abierto, servidores con reload/debug y puerto 5678 publicado; no debe considerarse lista para producción.
- Los importes usan `float` en backend y `number` en frontend; no se garantiza precisión contable decimal.
- `build_metrics_facets` accede al primer y último elemento sin definir comportamiento para una lista vacía.
- Las versiones en `backend/requirements.txt` no están fijadas. Existe `frontend/package-lock.json`; los hallazgos señalan que el Dockerfile frontend usa `npm install`.

### Próximas prioridades sugeridas

1. Definir si el periodo visible debe ser fijo o derivarse de las fechas devueltas, y mantener etiqueta y datos coherentes.
2. Separar configuración local y de producción; restringir CORS y retirar debug/reload y puerto de depuración en producción.
3. Mejorar la reproducibilidad de dependencias frontend/backend.
4. Definir comportamiento y pruebas para facets vacíos y rangos de fecha inválidos en todas las rutas pertinentes.
5. Acordar si los cálculos necesitan exactitud contable y actuar en consecuencia.
6. Decidir si la interfaz integrará las rutas analíticas existentes.

Estas prioridades son sugerencias derivadas de la revisión del repositorio, no compromisos de producto.
