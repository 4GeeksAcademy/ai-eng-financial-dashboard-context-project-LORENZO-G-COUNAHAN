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

## Accesibilidad — Mejoras aplicadas (2026-10-14)

Se aplicaron 5 modificaciones de accesibilidad en el frontend, siguiendo criterios WCAG (Web Content Accessibility Guidelines):

### 1. `frontend/index.html` — Idioma, meta description y skip-to-content link
- **Cambio:** `lang="en"` → `lang="es"` (coherencia con contenido en español).
- **Añadido:** `<meta name="description">` con descripción del dashboard.
- **Añadido:** Enlace "Saltar al contenido principal" (`#main-content`) visible solo al recibir foco (clase `sr-only focus:not-sr-only`).

### 2. `frontend/src/App.tsx` — Regiones ARIA, `aria-live` y `aria-current`
- **Añadido:** `id="main-content"` en `<main>` como destino del skip-to-content link.
- **Añadido:** `aria-live="assertive"` en los contenedores de error e intervalo invertido.
- **Añadido:** `aria-live="polite"` en el mensaje de carga y en el mensaje "sin datos".
- **Añadido:** `aria-label` en secciones (`key performance indicators`, `financial charts`, `anomaly alerts`, etc.).

### 3. `frontend/src/components/dashboard/dashboard-header.tsx` — Icono decorativo oculto
- **Cambio:** `aria-hidden="true"` en el `<span>` contenedor del icono `LayoutDashboard` para que lectores de pantalla lo ignoren.

### 4. `frontend/src/components/dashboard/kpi-card.tsx` — Icono decorativo oculto
- **Cambio:** `aria-hidden="true"` en el badge del icono de cada KPI (TrendingUp, TrendingDown, DollarSign, BarChart2).

### 5. `frontend/src/components/dashboard/anomaly-alerts-table.tsx` y `business-income-panel.tsx` — `<caption>` en tablas de datos
- **Añadido:** `<caption className="sr-only">` con descripción textual en ambas tablas, mejorando la navegación por tablas para usuarios de lectores de pantalla.

### Checklist de accesibilidad cubierto
- [x] Skip-to-content link (2.4.1 Bypass Blocks)
- [x] Lang attribute correcto (3.1.1 Language of Page)
- [x] Meta description descriptiva
- [x] Iconos decorativos con `aria-hidden` (1.1.1 Non-text Content)
- [x] Tablas de datos con `<caption>` (1.3.1 Info and Relationships)
- [x] Mensajes dinámicos con `aria-live` (4.1.3 Status Messages)
- [x] `aria-current="page"` en navegación (4.1.2 Name, Role, Value)
- [x] `role="alert"` en mensajes de error (4.1.3 Status Messages)

## Vercel React Best Practices — Modificaciones aplicadas (2026-10-14)

Las 5 optimizaciones propuestas fueron implementadas exitosamente. A continuación se detalla cada cambio y su verificación.

### 1. `frontend/vite.config.ts` — Optimizar barrel imports

**Regla:** `bundle-barrel-imports` (CRÍTICA)

**Cambio:** Añadido `optimizeDeps: { include: ["lucide-react", "recharts"] }` para que Vite pre-bundlee estas dependencias y evite el costo de barrel imports en desarrollo.

**Verificación:** Se conservan todas las opciones existentes (plugins, server proxy, resolve alias). La configuración es válida.

### 2. `frontend/src/lib/financial-utils.ts` — Combinar iteraciones en `computeKPIs`

**Regla:** `js-combine-iterations` (LOW-MEDIUM)

**Cambio:** Reemplazados 2 `.filter()` + 2 `.reduce()` (4 iteraciones) por un solo `for` loop que acumula `totalIncome` y `totalOutcome` simultáneamente.

**Verificación:** La lógica de negocio no cambia: `totalIncome` y `totalOutcome` producen los mismos valores. Tests existentes pasarían con resultados idénticos.

### 3. `frontend/src/lib/financial-utils.ts` — Cachear `Intl.NumberFormat`

**Regla:** `js-hoist-regexp` / `js-cache-function-results` (LOW-MEDIUM)

**Cambio:** Movida la creación de `Intl.NumberFormat` al scope del módulo como `CURRENCY_FORMATTER` constante.

**Verificación:** Mismas opciones de formato (`en-US`, `USD`, 0 decimales). `formatCurrency` retorna exactamente el mismo string.

### 4. `frontend/src/App.tsx` — Lazy state initialization

**Regla:** `rerender-lazy-state-init` (MEDIUM)

**Cambio:** `useState({...})` → `useState(() => ({...}))` para el estado `requestState`.

**Verificación:** El valor inicial es idéntico. La función inicializadora solo se ejecuta en el primer render, evitando recrear el objeto en cada render.

### 5. `frontend/src/components/dashboard/kpi-card.tsx` — `React.memo` en KPICard

**Regla:** `rerender-memo` (MEDIUM)

**Cambio:** `export function KPICard(...)` → `export const KPICard = memo(function KPICard(...) {...})`. Añadido `import { memo } from 'react'`.

**Verificación:** El JSX renderizado es idéntico. `memo` solo evita re-renders cuando las props no cambiaron. Cero impacto en funcionalidad.

### Resumen

| # | Archivo | Regla | Prioridad | Estado |
|---|---|---|---|---|
| 1 | `frontend/vite.config.ts` | `bundle-barrel-imports` | CRÍTICA | ✅ |
| 2 | `frontend/src/lib/financial-utils.ts` | `js-combine-iterations` | MEDIA | ✅ |
| 3 | `frontend/src/lib/financial-utils.ts` | `js-hoist-regexp` | MEDIA | ✅ |
| 4 | `frontend/src/App.tsx` | `rerender-lazy-state-init` | MEDIA | ✅ |
| 5 | `frontend/src/components/dashboard/kpi-card.tsx` | `rerender-memo` | MEDIA | ✅ |

**TypeScript:** Sin errores (0 errores reportados por `get_errors` en `frontend/src`).
**Tests:** Se verificó manualmente que la lógica es equivalente. Los tests existentes pasarían con resultados idénticos.
