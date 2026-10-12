# Plan de actuación: comparativa B2B vs B2C

## 1. Alcance técnico

El backend ya dispone de `GET /api/metrics/facets`, que expone categorías disponibles y tipos de negocio, y de `GET /api/metrics/categories/top`, que admite `operation_type`, `limit`, `start_date`, `end_date` y `business_type`. Por lo tanto, en principio la nueva funcionalidad puede consumir las rutas existentes sin cambios backend. La vista comparativa será nueva en el frontend; hay componentes visuales y Recharts existentes que pueden orientar su implementación.

El endpoint top categories devuelve `category`, `operation_type` y `total_amount`, pero no devuelve el porcentaje del total del grupo. Será necesario calcular el denominador usando los movimientos de ingresos del grupo dentro del mismo rango. `/api/metrics` no admite un filtro `business_type`; para mantener el alcance sin cambiar backend, utilizar `/api/metrics/b2b` y `/api/metrics/b2c` con `operation_type=income` y las fechas seleccionadas, y calcular en frontend los totales y porcentajes.

## 2. Cambios previstos

### Rangos invertidos

No se requiere establecer una política nueva. Reutilizar la validación del filtro de fechas existente en el dashboard: la interfaz actual detecta rangos invertidos y evita la consulta de movimientos. Para la nueva página, mantener el mismo comportamiento visible; comprobar si los endpoints invocados validan rangos invertidos antes de depender de ese comportamiento.

### Backend

- No se prevén cambios de backend: los endpoints existentes aceptan negocio, operación, límite y fechas.
- Verificar los contratos de facets, categorías top y movimientos por filtros mediante pruebas existentes o nuevas solo si se detecta una insuficiencia frente a la especificación.

### Frontend

- Añadir una página/vista específica para comparativa B2B vs B2C y una forma de acceder desde el dashboard actual sin eliminar la pantalla existente.
- Consumir `/api/metrics/facets` para las categorías y opciones disponibles.
- Para cada negocio, consultar `/api/metrics/categories/top` con `operation_type=income`, `limit=5`, fechas elegidas y `business_type=B2B` o `B2C`.
- Consultar `/api/metrics/b2b` y `/api/metrics/b2c`, cada uno filtrado por `operation_type=income` y el mismo rango, para obtener el total de ingresos de cada grupo usado en denominadores y porcentajes. No enviar `business_type` a `/api/metrics`, ya que ese parámetro no está soportado por esa ruta.
- Calcular porcentaje de cada categoría sobre el ingreso total de su grupo; manejar un total de grupo igual a cero evitando división inválida.
- Presentar dos secciones lado a lado con las cinco categorías principales, y debajo de ambas un único gráfico que compare las dos líneas de negocio. El gráfico debe utilizar la información de ingresos de los grupos en el rango seleccionado.
- Reutilizar el filtro de fechas existente o un control equivalente con valor serializado `YYYY-MM-DD`; propagar el rango coherentemente a todas las consultas.
- Archivos previstos tras inspeccionar la estructura actual: `frontend/src/App.tsx` o un componente de navegación equivalente, un nuevo componente de comparativa bajo `frontend/src/components/dashboard/`, y tipos/utilidades frontend si resultan necesarios. No cambiar la configuración de testing.

## 3. Orden recomendado de tareas

1. Confirmar el contrato de los endpoints de facets, top categories y movimientos, incluyendo parámetros de negocio, operación y fechas, y los filtros invertidos.
2. Definir tipos/utilidades frontend para respuestas y porcentajes a partir del total del grupo.
3. Crear los bloques B2B y B2C en paralelo con nombres de categoría, total y porcentaje sobre ingresos de cada negocio.
4. Crear el único gráfico comparativo debajo de ambas secciones.
5. Añadir acceso a la nueva página y conectar facets, top categories, totales y rango de fechas, coordinando solicitudes y cancelación al cambiar filtros.
6. Ejecutar las pruebas, build y lint existentes; corregir regresiones relacionadas sin modificar la configuración de testing.
7. Contrastar uno por uno los criterios de aceptación y registrar evidencia por criterio.

## 4. Verificación básica

- Backend: `cd backend && pytest`; comprobar facets y que `/api/metrics/categories/top` acepta `operation_type=income`, `limit=5`, `business_type` y límites de fecha. Comprobar `/api/metrics` con filtros equivalentes para el total de cada negocio.
- Frontend: `cd frontend && npm test -- --run`, `npm run build` y `npm run lint` usando los scripts existentes.
- Verificación funcional: abrir la nueva vista, verificar las dos secciones paralelas, cinco categorías máximo, importes y porcentajes por grupo, un único gráfico y filtros de fechas `YYYY-MM-DD`; observar las peticiones para confirmar los parámetros de negocio, ingresos, limit y fechas.

## 5. Riesgos para funcionalidad existente

- `/api/metrics/categories/top` devuelve el monto por categoría, pero no el total completo de ingresos del grupo; el porcentaje debe usar un denominador correcto, no la suma solo de las cinco categorías.
- Todas las consultas de una vista deben compartir el mismo rango para evitar comparaciones incongruentes.
- El generador actual solo asigna categoría `sales` a la mayoría de movimientos de ingreso y `others` a una fracción pequeña; la API puede devolver menos de cinco categorías distintas si el conjunto filtrado no tiene cinco categorías de ingreso.
- El dashboard hoy renderiza una sola pantalla; la nueva vista necesita una ruta, pestaña o navegación clara sin ocultar ni reemplazar indebidamente la vista existente. El mecanismo concreto debe ajustarse a la estructura real tras inspección.
- Rangos parciales y fechas invertidas deben mantener un comportamiento coherente con el filtro ya existente; no se debe introducir una segunda interpretación de fechas.
