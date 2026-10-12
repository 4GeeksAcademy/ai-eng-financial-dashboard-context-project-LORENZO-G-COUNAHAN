# Guía de funcionalidades y contratos API del dashboard

Esta guía permite a una nueva sesión de desarrollo entender las tres funcionalidades del frontend, las solicitudes que realiza y cómo interpretar sus respuestas y estados límite. Los contratos y restricciones descritos se contrastaron con el OpenAPI de FastAPI, visible en `/docs` cuando el backend está en marcha; la implementación fuente está en `backend/app/routes.py`.

## Convenciones comunes

- Las rutas se solicitan bajo `/api` (sin host fijo) para que funcionen con el proxy de Vite y Docker Compose.
- `start_date` y `end_date` son fechas de calendario `YYYY-MM-DD`, opcionales en los endpoints indicados y con límites inclusivos. Si se omite una fecha, ese extremo queda abierto.
- El backend acepta `operation_type=income|outcome`; `business_type=B2B|B2C`; y las categorías `suppliers|sales|operational|administrative|others`.
- Las fechas inválidas para el tipo OpenAPI `date`, los valores fuera de los literales y los parámetros fuera de sus restricciones numéricas se rechazan con HTTP 422.
- Las respuestas monetarias usan números JSON (`number` en TypeScript). No se promete precisión decimal contable.
- Tipos de respuesta y parámetros definidos como referencia: [`api-types.ts`](./api-types.ts) y [`param-types.ts`](./param-types.ts). Los tipos que usa la aplicación están en [`src/lib/financial-types.ts`](../src/lib/financial-types.ts); algunos modelos de UI (como porcentajes por categoría) se calculan en el frontend y no son campos de respuesta API.

## 1. Filtro de rango de fechas

### Funcionalidad

Dos fechas opcionales filtran los movimientos del dashboard, incluidas las fechas de inicio y fin. La respuesta de facets proporciona el rango disponible para mostrarlo junto al filtro. La interfaz no envía solicitudes con un rango invertido y muestra un aviso; un rango válido sin movimientos muestra un mensaje de ausencia de datos.

### Endpoints usados

| Endpoint | Uso | Parámetros relevantes | Respuesta TypeScript |
|---|---|---|---|
| `GET /api/metrics/facets` | Cargar fechas disponibles y opciones de filtro. No recibe parámetros. | — | `FacetsResponse` en `api-types.ts`, equivalente en la aplicación a `MetricsFacets` |
| `GET /api/metrics` | Cargar movimientos dentro del rango. | `start_date?`, `end_date?`; el endpoint también admite `category?` y `operation_type?`, aunque este filtro de UI solo envía las fechas. | `FinancialMovementsResponse` / `FinancialMovementResponse[]`; equivalente de aplicación `FinancialMovement[]` |

### Parámetros y modelos

- `DateRangeFilter` (`param-types.ts`): `start_date?: string`, `end_date?: string`, ambas con formato de fecha `YYYY-MM-DD` e inclusivas.
- `/api/metrics` permite además `category?: Category` y `operation_type?: OperationType`. `Category` acepta `suppliers`, `sales`, `operational`, `administrative`, `others`; `OperationType` acepta `income` o `outcome`.
- `FinancialMovementResponse` (`api-types.ts`) / `FinancialMovement` (`src/lib/financial-types.ts`): `{ create_date: string, amount: number, operation_type: OperationType, category: Category, business_type: BusinessType }`. `create_date` es una fecha ISO de calendario.
- `FacetsResponse` / `MetricsFacets`: `{ operation_types: OperationType[], business_types: BusinessType[], categories: Category[], min_date: string, max_date: string }`. Las fechas `min_date` y `max_date` se serializan como `YYYY-MM-DD`.

### Casos límite y comportamiento de UI

1. **Solo fecha inicial o solo fecha final:** la fecha restante se omite de la URL; se muestran movimientos desde el inicio o hasta el fin, respectivamente.
2. **Rango invertido (`end_date < start_date`):** la interfaz no realiza solicitudes de movimientos, alertas ni comparativa; presenta el aviso «El rango no es válido: la fecha de fin debe ser igual o posterior a la fecha de inicio.» El endpoint `/api/metrics`, si se invoca directamente con ese rango, responde 422.
3. **Rango válido sin movimientos:** la interfaz muestra «No hay datos para mostrar en el periodo seleccionado.»
4. **Fechas iguales:** al ser inclusivos ambos límites, se consulta un único día y se muestran únicamente movimientos de esa fecha; si no hay, se aplica el estado vacío anterior.

## 2. Tabla de alertas de anomalías

### Funcionalidad

La tabla muestra cada periodo que supera el umbral de aumento de egresos con respecto a la media de los tres periodos anteriores. El filtro de fechas compartido se envía a la API. `group_by` y `business_type` también están disponibles en el contrato, pero la UI actual no los envía (se aplican los valores predeterminados del backend).

### Endpoint usado

`GET /api/metrics/alerts`

Parámetros enviados actualmente: `threshold` siempre; `start_date` y `end_date` solo si están definidos. Otros parámetros admitidos: `group_by` y `business_type`.

### Parámetros y respuesta

- `AlertParams` (`param-types.ts`):
  - `threshold?: number`: inclusivo `0.01`–`1.0`; predeterminado `0.03`. Se expresa como ratio (por ejemplo, `0.03` equivale a 3%). La UI inicia en `0.03` y no actualiza el estado si el nuevo número está fuera del rango.
  - `start_date?`, `end_date?`: fechas `YYYY-MM-DD`, inclusivas.
  - `group_by?: AlertGroupBy`: `day`, `week` o `month`; predeterminado `month`.
  - `business_type?: BusinessType`: `B2B` o `B2C`; si se omite, no se filtra por línea de negocio.
- `AlertsResponse` es un arreglo JSON de `AletEntry` (también exportado como `AlertEntry`) en `api-types.ts`; la aplicación consume el mismo esquema como `MetricsAlert[]`:

  ```ts
  interface MetricsAlert {
    period: string;
    outcome_total: number;
    baseline_average: number;
    increase_ratio: number;
  }
  ```

  `period` sigue la agrupación: `YYYY-MM-DD` (día), `YYYY-Www` (semana ISO) o `YYYY-MM` (mes). `increase_ratio` es un ratio, convertido a porcentaje por la tabla (`ratio * 100`).

### Casos límite y comportamiento de UI

1. **Arreglo de alertas vacío:** la tabla muestra exactamente «anomalía no detectada»; un resultado vacío es válido y no es un error HTTP.
2. **Umbral en los límites:** `0.01` y `1.0` son válidos y la UI los envía; valores inferiores o superiores no se aplican desde el input. En una llamada directa, el backend rechaza valores fuera del rango con 422.
3. **Rango de fechas invertido:** antes de llamar al endpoint, la UI aplica la validación común del filtro y muestra el aviso de rango inválido; la tabla se presenta vacía en ese estado. No confiar en que la ruta de alertas valide por sí sola el orden: el backend no declara esa validación explícita.
4. **Cargando:** mientras la solicitud está pendiente, la tabla comunica «Cargando alertas…» en lugar de interpretar la falta temporal de resultados como lista vacía.

## 3. Comparativa B2B vs B2C

### Funcionalidad

La vista de comparativa presenta paneles B2B y B2C con todas las categorías disponibles, importes de ingresos y egresos y sus porcentajes sobre el total de la misma operación y línea de negocio. Un gráfico único compara ambas líneas. El rango de fechas es compartido con el filtro del dashboard.

### Endpoints usados

| Endpoint | Uso | Parámetros enviados por la UI | Respuesta TypeScript |
|---|---|---|---|
| `GET /api/metrics/facets` | Fuente de categorías disponibles y fechas máximas/mínimas. | Ninguno | `FacetsResponse` / `MetricsFacets` |
| `GET /api/metrics/categories/top` | Obtener totales por categoría para cada combinación B2B/B2C e ingreso/egreso (cuatro solicitudes). | `business_type=B2B|B2C`, `operation_type=income|outcome`, `limit=5`, y fechas opcionales | `TopCategoriesResponse` / `CategoryEntry[]`, equivalente en aplicación a `TopCategoryItem[]` |
| `GET /api/metrics/b2b` y `GET /api/metrics/b2c` | Obtener movimientos filtrados para calcular los denominadores de porcentaje (cuatro solicitudes: una por negocio y operación). | `operation_type=income|outcome`, fechas opcionales | `FinancialMovementsResponse` / `FinancialMovementResponse[]`; equivalente de aplicación `FinancialMovement[]` |

La UI combina los resultados para ingresos y egresos en ambas líneas. `limit=5` cubre las cinco categorías del contrato actual. Las rutas de movimientos de negocio también admiten `category`; no se envía en esta vista.

### Parámetros y modelos

- `TopCategoriesParams` (`param-types.ts`):
  - `operation_type?: OperationType`: `income` o `outcome`; predeterminado `outcome`.
  - `limit?: number`: entero entre 1 y 20, inclusivo; predeterminado 5. La UI fija `5`.
  - `business_type?: BusinessType`: `B2B` o `B2C`.
  - `start_date?`, `end_date?`: fechas `YYYY-MM-DD`, inclusivas.
- `/api/metrics/b2b` y `/api/metrics/b2c` aceptan `start_date?`, `end_date?`, `category?` (las cinco categorías permitidas) y `operation_type?` (`income|outcome`). Cada endpoint filtra implícitamente por el negocio de su ruta.
- `TopCategoriesResponse` es un arreglo de objetos `CategoryEntry`: `{ category: Category, operation_type: OperationType, total_amount: number }`.
- `BusinessCategoryComparisonRow` (`financial-types.ts`) modela el resultado de UI de una categoría y sus objetos `income` y `outcome` (`CategoryIncomeShare`). Cada objeto contiene los campos de `TopCategoryItem` y `percentage: number`.
- `BusinessIncomeComparisonPoint` (`financial-types.ts`) es el punto del gráfico: `{ category, B2BIncome, B2BOutcome, B2CIncome, B2COutcome }`, todos los importes como números.

Los porcentajes no llegan como campo API. El frontend obtiene el total de cada operación y negocio sumando los movimientos y calcula `total_amount / total_de_esa_operación * 100`.

### Casos límite y comportamiento de UI

1. **Categoría sin movimientos, pero sí hay otros movimientos en el grupo:** el frontend completa la categoría desde facets con importe `0` y porcentaje `0`; la fila y el punto de gráfico permanecen presentes.
2. **Total de una operación igual a cero:** la división se evita y los porcentajes de esa operación se muestran como `0`, sin `NaN` ni infinito.
3. **Ningún movimiento para una línea de negocio en el rango:** la UI sigue mostrando todas las categorías de facets con importes y porcentajes en cero. No muestra el estado «No hay movimientos…», porque `completeCategoryIncomeShares` rellena las categorías antes de renderizar el panel.
4. **Rango invertido:** no se hacen las solicitudes de comparativa; se muestra el aviso común de rango inválido y la UI no presenta datos de categorías/gráfico para ese rango.

## Referencias de implementación

- Integración de solicitudes, filtros y estados: [`src/App.tsx`](../src/App.tsx).
- Cálculo de importes y porcentajes, incluido el relleno de categorías con cero: [`src/lib/financial-utils.ts`](../src/lib/financial-utils.ts).
- Modelos usados por los componentes: [`src/lib/financial-types.ts`](../src/lib/financial-types.ts).
- Especificaciones funcionales originales: [001 — filtro de fechas](./001filtroderangodefechas/spec.md), [002 — alertas](./002tabla-alertas-anomalias/spec.md), [003 — comparativa](./003comparativa-b2b-vs-b2c/spec.md).
