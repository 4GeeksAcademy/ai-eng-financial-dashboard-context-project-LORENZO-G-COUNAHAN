# Contratos de componentes por funcionalidad

Este documento fija los contratos de datos y props de los componentes de las tres funcionalidades del frontend y resuelve decisiones de interfaz que el brief del PM dejaba abiertas. Está alineado con los tipos de API contrastados con OpenAPI en los commits `610278c` (`param-types.ts`) y `9933d81` (`api-types.ts`), y con los tipos de dominio de `src/lib/financial-types.ts`.

> Los tipos de los commits describen parámetros y respuestas del backend; los tipos de props describen datos ya preparados para renderizar. No tratar porcentajes de UI como campos de la API ni enviar props de componentes directamente como query params sin traducirlos.

## Decisiones compartidas

1. **El contenedor coordina; los componentes presentan.** `App.tsx` conserva la selección de fechas, estado de solicitudes, carga/error y llamadas API. Los componentes del dashboard reciben valores y callbacks controlados; no realizan `fetch` ni duplican estado de filtros.
2. **Un rango seleccionado compartido entre vistas.** Dashboard y comparativa usan el mismo `startDate`/`endDate` del contenedor. Cambiar de vista no borra el filtro. El control de fechas aparece en la vista activa; sus valores y filtros se aplican a todas las consultas pertinentes de esa funcionalidad.
3. **La UI representa fecha vacía con `""`; la API representa ausencia omitiendo la query.** Los callbacks del filtro reciben cadenas, incluidos `""`. Al construir query params, se omite cada límite vacío. Las fechas no se convierten a `Date`/timestamp: son fechas de calendario `YYYY-MM-DD`.
4. **Rango invertido se bloquea antes de consultar.** Si ambas fechas existen y `endDate < startDate`, el contenedor no inicia solicitudes dependientes del rango y muestra un aviso común. La validación visual no altera los contratos de los endpoints. Para `/api/metrics`, el backend devuelve 422 ante rango invertido; no asumir que todos los endpoints relacionados hacen esa validación.
5. **Los errores pertenecen al contenedor.** El padre muestra el error de API o de carga. `loading` en componentes solo representa una solicitud pendiente; `data: []` solo representa respuesta vacía completada. No confluir «cargando», «sin resultados» y «fallo». En el estado actual, el error global no borra los últimos arrays ya guardados; si se exige que no se vean datos anteriores junto al error, esa limpieza debe añadirse como cambio de implementación.
6. **Nombres y tipos API se mantienen literales.** `income|outcome`, `B2B|B2C` y las cinco categorías válidas están declaradas en tipos compartidos. Los datos de UI extendidos/calculados se describen en la sección de comparativa.

### Tipos de frontera API

Los tipos de parámetros se encuentran en [`param-types.ts`](./param-types.ts) y los tipos de respuesta en [`api-types.ts`](./api-types.ts). Contratos usados aquí:

- Fechas: `DateRangeFilter` (`start_date?`, `end_date?`), inclusivas y formato `YYYY-MM-DD`.
- Movimientos: `FinancialMovementResponse` y `FinancialMovementsResponse`.
- Facets: `FacetsResponse`.
- Alertas: `AlertParams`, `AlertsResponse` (`AletEntry`, con alias `AlertEntry`).
- Categorías top: `TopCategoriesParams`, `TopCategoriesResponse` (`CategoryEntry`).
- Valores de dominio: `OperationType`, `BusinessType`, `Category`, `AlertGroupBy`.

Los componentes consumen los tipos de aplicación en [`financial-types.ts`](../src/lib/financial-types.ts), que son equivalentes a los campos JSON cuando se indica abajo. El mapeo es estructural; TypeScript no valida automáticamente el JSON retornado por `fetch`.

---

## 1. Filtro de rango de fechas

### Componente

`DateRangeFilter` — `src/components/dashboard/date-range-filter.tsx`

### Contrato de props

```ts
interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
}
```

| Prop | Contrato / significado |
|---|---|
| `startDate`, `endDate` | Controlados por el padre. `""` significa sin límite; si no está vacío, fecha `YYYY-MM-DD`. No declarar estos props como `Date` ni como opcionales: el input necesita un `value` controlado. |
| `onStartDateChange`, `onEndDateChange` | Reciben el `value` textual del input `type="date"`; el padre actualiza el estado. El componente no valida orden ni consulta API. |
| `minDate`, `maxDate` | Valores opcionales `FacetsResponse.min_date` y `.max_date`, en formato `YYYY-MM-DD`, mostrados como rango disponible. Son información contextual, no restricciones `min`/`max` de los inputs. |

### Flujo de tipos y decisión funcional

- Lee `GET /api/metrics/facets` → `FacetsResponse` (`min_date`, `max_date`).
- Controla filtros usados por `GET /api/metrics` (`MetricsParams`) y por los endpoints de alertas/comparativa descritos abajo.
- El frontend aplica el mismo control de fechas tanto en overview como en comparativa. Aunque el brief hablaba de filtro «en la parte superior del dashboard», se concreta que la comparativa también expone el filtro, con el mismo estado compartido, para que sus datos puedan filtrarse sin cambiar la vista principal.
- Cada extremo es independiente y opcional. Si se completa solo uno, se envía solo ese parámetro. Ambos extremos son inclusivos según el backend.
- Si el rango está invertido, no se debe usar el filtro como señal para borrar las fechas: se preservan para permitir que el usuario corrija el extremo y se presenta el error de rango en el padre.

### Estados límite

- Sin `minDate` o `maxDate` durante la carga de facets: el componente omite el texto del rango disponible.
- Fecha vacía: input vacío y parámetro correspondiente omitido en solicitudes.
- Ningún movimiento en rango válido: filtro no cambia su presentación; el contenedor muestra el estado «No hay datos para mostrar en el periodo seleccionado.»

---

## 2. Tabla de alertas de anomalías

### Componente

`AnomalyAlertsTable` — `src/components/dashboard/anomaly-alerts-table.tsx`

### Contrato de props

```ts
interface AnomalyAlertsTableProps {
  alerts: MetricsAlert[];
  threshold: number;
  onThresholdChange: (threshold: number) => void;
  loading?: boolean;
}
```

| Prop | Contrato / significado |
|---|---|
| `alerts` | Lista final de `MetricsAlert[]` para el rango/umbral activo. Sus campos reflejan `AletEntry`: `period`, `outcome_total`, `baseline_average`, `increase_ratio`. No pasar `null`; mientras no haya respuesta, usar `loading`. |
| `threshold` | Ratio decimal controlado entre `0.01` y `1.0`, incluyendo ambos límites; inicial `0.03`. `0.03` significa 3%, no 0.03%. |
| `onThresholdChange` | Se invoca solo si el valor numérico nuevo es finito y está dentro del rango admitido. El padre conserva el valor y lo pasa a la solicitud como `threshold`. |
| `loading` | Opcional; si se omite equivale a `false`. Mientras es `true`, se muestra «Cargando alertas…» y no el estado vacío aunque `alerts` esté vacío. |

### Flujo API y política de presentación

- Solicitud: `GET /api/metrics/alerts` con `AlertParams`. La UI envía siempre `threshold` y añade `start_date`/`end_date` solo cuando no están vacías.
- No añadir selector de `group_by` ni de `business_type`: son parámetros válidos en OpenAPI (`AlertGroupBy`, `BusinessType`) pero no forman parte del control solicitado ni de la UI actual. Al omitirlos, el backend usa `group_by="month"` y agrega ambas líneas de negocio.
- Respuesta: array `AlertsResponse` → modelo de aplicación `MetricsAlert[]`. `increase_ratio` es ratio; la tabla lo multiplica por 100 para mostrar porcentaje. `period` se presenta como lo devuelve el API, cuyo formato depende de `group_by`.
- `baseline_average` se etiqueta como promedio de los tres periodos previos porque el backend mantiene una ventana móvil de tres outcomes. No recalcular el baseline en el componente.
- El fallo HTTP se muestra en el área de error de `App`; no debe representarse como «anomalía no detectada».

### Estados límite

1. `loading === true`: mostrar mensaje de carga.
2. Carga terminada y `alerts.length === 0`: mostrar exactamente «anomalía no detectada».
3. `threshold` igual a `0.01` o `1.0`: aceptar. Fuera de esos límites: no cambiar estado ni hacer una petición con valor inválido; el backend también impone esos límites (422 fuera de rango).
4. Rango invertido: el padre bloquea la consulta y muestra el aviso común; pasa una lista de alertas vacía y `loading=false`, de modo que la tabla puede mostrar su mensaje vacío. El aviso de rango, no el mensaje vacío de tabla, es la explicación primaria.

---

## 3. Comparativa B2B vs B2C

### Componentes

- `BusinessIncomePanel` — `src/components/dashboard/business-income-panel.tsx`
- `BusinessIncomeComparisonChart` — `src/components/dashboard/business-income-comparison-chart.tsx`

Los nombres existentes se conservan por compatibilidad aunque el panel y el gráfico muestran tanto ingresos como egresos.

### Contratos de props

```ts
interface BusinessIncomePanelProps {
  businessType: BusinessType;
  categories: BusinessCategoryComparisonRow[];
  loading?: boolean;
}

interface BusinessIncomeComparisonChartProps {
  data: BusinessIncomeComparisonPoint[];
  loading?: boolean;
}
```

| Prop | Contrato / significado |
|---|---|
| `businessType` | Literal `"B2B"` o `"B2C"`; identifica el panel, no es un parámetro que el propio panel envíe. |
| `categories` | Una fila por cada `Category` disponible en facets. Cada fila contiene totales y porcentajes ya calculados de `income` y `outcome` para el `businessType` de ese panel. |
| `data` | Un punto por categoría para el gráfico con las cuatro series monetarias `B2BIncome`, `B2BOutcome`, `B2CIncome`, `B2COutcome`. |
| `loading` | Opcional y `false` por defecto. En `true`, reemplaza tabla/gráfico por su presentación de carga. |

Tipos que componen los props (`financial-types.ts`):

```ts
interface BusinessCategoryComparisonRow {
  category: Category;
  income: CategoryIncomeShare;
  outcome: CategoryIncomeShare;
}

interface CategoryIncomeShare extends TopCategoryItem {
  percentage: number; // 0–100, calculado en frontend
}

interface BusinessIncomeComparisonPoint {
  category: Category;
  B2BIncome: number;
  B2BOutcome: number;
  B2CIncome: number;
  B2COutcome: number;
}
```

`TopCategoryItem` se alinea con `CategoryEntry` de API (`category`, `operation_type`, `total_amount`). `percentage` y `BusinessIncomeComparisonPoint` son modelos derivados del frontend; no aparecen en las respuestas OpenAPI.

### Flujo de datos

Para el rango actual, el contenedor:

1. Lee las categorías con `GET /api/metrics/facets` → `FacetsResponse.categories`.
2. Pide cuatro rankings a `GET /api/metrics/categories/top` (`TopCategoriesParams`): combinaciones `business_type=B2B|B2C` y `operation_type=income|outcome`, siempre `limit=5`, con fechas si existen. El OpenAPI valida `limit` como entero `1..20`; `operation_type` admite `income|outcome`; `business_type`, `B2B|B2C`.
3. Pide movimientos por `GET /api/metrics/b2b` y `/api/metrics/b2c` filtrados por `operation_type` y fechas (dos operaciones por cada ruta) para obtener denominadores. Estas rutas no aceptan `business_type`; la ruta determina la línea. Sus otros filtros opcionales son fechas, categoría y operación.
4. Completa cada operación con todas las categorías de facets; para categorías no devueltas por `categories/top` asigna `total_amount=0`.
5. Calcula cada porcentaje con el total de movimientos de esa línea y operación, no con la suma de los elementos top: `total_amount / total_operación * 100`. Si el denominador es cero, asigna porcentaje `0`.
6. Combina las filas de ingreso/egreso para los dos paneles y construye `BusinessIncomeComparisonPoint[]` para el gráfico.

### Ambigüedades del brief resueltas

- **«Categorías principales» frente a «todas las categorías»:** el requisito aprobado para la vista prevalece: los paneles y gráfico incluyen todas las categorías de facets; el endpoint top aporta importes para las categorías que devuelve y el frontend añade las ausentes con cero. Hoy el schema enumera cinco categorías y `limit=5` las cubre. Si facets crece por encima de cinco, actualizar coordinadamente el límite solicitado/estrategia API y los tipos, sin omitir filas.
- **Porcentaje del total:** se entiende como porcentaje del total de la misma operación dentro de la misma línea de negocio y rango; son cuatro denominadores independientes. No mezclar ingreso con egreso ni B2B con B2C, y no calcular el denominador a partir del ranking limitado.
- **Cero movimientos y estado vacío:** con facets cargadas se conserva la fila por cada categoría, importe y porcentaje en cero. No mostrar un estado vacío separado en el panel en ese caso. El mensaje «No hay movimientos para el periodo seleccionado.» que existe en el componente solo se alcanza si `categories` llega vacío (por ejemplo, aún no se dispone de facets); los fallos de facets/solicitudes se informan como error del contenedor.
- **Qué significa «un gráfico comparativo»:** un único gráfico de barras agrupadas con las cuatro series indicadas, categorías en el eje X e importes, no cuatro gráficos ni porcentajes. El gráfico y los paneles utilizan el mismo rango seleccionado.
- **Orden de categorías:** usar el orden de `facets.categories` para tablas y puntos de gráfico, sin reordenar cada grupo por sus rankings independientes; así las categorías se comparan en la misma posición.
- **Vista y filtro:** la comparativa es una vista seleccionable del dashboard existente, no reemplaza el overview. Usa el filtro compartido; conservar filtros al alternar las vistas.

### Estados límite

1. Categoría ausente en ranking pero presente en facets → fila y punto de gráfico con cero.
2. Denominador de una operación igual a cero → porcentajes de esa operación en cero, evitando `NaN`/infinito.
3. Sin movimientos para B2B o B2C, pero facets disponibles → ese negocio mantiene todas sus filas en cero; la otra línea calcula normalmente.
4. Rango invertido → el contenedor no consulta endpoints comparativos, muestra el aviso común y entrega datos vacíos al gráfico; no reutilizar resultados previos como si pertenecieran al rango inválido.
5. Error de cualquiera de las solicitudes de `Promise.all` → tratar la carga comparativa como fallida y mostrar el error del contenedor; no presentar la respuesta fallida como si fuese una lista vacía. **Limitación actual:** el `catch` de `App.tsx` fija el error, pero no limpia las categorías/gráfico previos, por lo que datos del filtro anterior pueden permanecer visibles; si el criterio es ocultarlos al fallar, limpiar esos estados al iniciar/fallar la carga.

## Matriz rápida: endpoint → tipo de frontera → props

| Funcionalidad | Respuesta API (commit `9933d81`) | Tipos de props/dominio |
|---|---|---|
| Fechas | `FacetsResponse`, `FinancialMovementsResponse` | `DateRangeFilterProps`; `FinancialMovement[]` para cálculos superiores |
| Alertas | `AlertsResponse` / `AletEntry` (`AlertEntry`) | `MetricsAlert[]`, `threshold: number`, `loading?: boolean` |
| Comparativa | `FacetsResponse`, `TopCategoriesResponse` / `CategoryEntry`, `FinancialMovementsResponse` | `BusinessCategoryComparisonRow[]`, `BusinessIncomeComparisonPoint[]`, `BusinessType` |

## Fuentes de verificación

- Commits de tipos OpenAPI: `610278c` (`types: parámetros verificados contra OpenAPI`) y `9933d81` (`types: respuestas verificadas contra OpenAPI`).
- Contratos y casos funcionales: [`README.md`](./README.md) y los tres `spec.md` bajo esta carpeta.
- Implementación de props: `src/components/dashboard/date-range-filter.tsx`, `anomaly-alerts-table.tsx`, `business-income-panel.tsx`, `business-income-comparison-chart.tsx`.
- Orquestación, solicitudes, estados y cálculos derivados: [`src/App.tsx`](../src/App.tsx), [`src/lib/financial-types.ts`](../src/lib/financial-types.ts) y [`src/lib/financial-utils.ts`](../src/lib/financial-utils.ts).
