# Plan de actuación: comparativa B2B vs B2C

## 1. Alcance técnico

El backend ya dispone de `GET /api/metrics/facets`, que expone categorías disponibles y tipos de negocio, y de `GET /api/metrics/categories/top`, que admite `operation_type`, `limit`, `start_date`, `end_date` y `business_type`. Por lo tanto, en principio la nueva funcionalidad puede consumir las rutas existentes sin cambios backend. La vista comparativa será nueva en el frontend; hay componentes visuales y Recharts existentes que pueden orientar su implementación.

El endpoint top categories devuelve `category`, `operation_type` y `total_amount`, pero no devuelve el porcentaje del total del grupo. Se consultarán top categories por cada operación y negocio, y los movimientos de `/api/metrics/b2b` y `/api/metrics/b2c` se pedirán por separado con `operation_type=income` y `operation_type=outcome` para calcular los cuatro denominadores. `/api/metrics` no admite un filtro `business_type`; no se utilizará para estos totales.

La aclaración aprobada durante la implementación amplía el alcance inicialmente income-only: cada uno de los dos paneles debe mostrar ingresos y egresos en cada categoría disponible. Se conserva la especificación original para los demás requisitos. El nombre de categoría se corrige a `suppliers`, coincidente con el contrato real de facets/backend.

## 2. Cambios previstos

### Rangos invertidos

No se requiere establecer una política nueva. Reutilizar la validación del filtro de fechas existente en el dashboard: la interfaz actual detecta rangos invertidos y evita la consulta de movimientos. Para la nueva página, mantener el mismo comportamiento visible; comprobar si los endpoints invocados validan rangos invertidos antes de depender de ese comportamiento.

### Backend

- No se prevén cambios de backend: los endpoints existentes aceptan negocio, operación, límite y fechas.
- Verificar los contratos de facets, categorías top y movimientos por filtros mediante pruebas existentes o nuevas solo si se detecta una insuficiencia frente a la especificación.

### Frontend

- Añadir una página/vista específica para comparativa B2B vs B2C y una forma de acceder desde el dashboard actual sin eliminar la pantalla existente.
- Consumir `/api/metrics/facets` para las categorías y opciones disponibles.
- Para cada negocio y operación, consultar `/api/metrics/categories/top` con `operation_type=income` o `operation_type=outcome`, `limit=5`, fechas elegidas y `business_type=B2B` o `B2C`.
- Consultar `/api/metrics/b2b` y `/api/metrics/b2c` por cada tipo de operación con el mismo rango, para obtener los totales que se usarán como denominadores. No enviar `business_type` a `/api/metrics`, ya que ese parámetro no está soportado por esa ruta.
- Completar todas las categorías procedentes de facets para cada operación, asignando cero cuando la API top no devuelva una categoría; calcular porcentajes contra el total correspondiente al mismo grupo y operación, con cero seguro si el denominador es cero.
- Presentar dos secciones lado a lado; cada categoría mostrará importe y porcentaje de ingresos y egresos. Debajo mostrar un único gráfico con cuatro series (ingreso/egreso para B2B/B2C) por categoría.
- Reutilizar el filtro de fechas existente o un control equivalente con valor serializado `YYYY-MM-DD`; propagar el rango coherentemente a todas las consultas.
- Archivos previstos tras inspeccionar la estructura actual: `frontend/src/App.tsx` o un componente de navegación equivalente, un nuevo componente de comparativa bajo `frontend/src/components/dashboard/`, y tipos/utilidades frontend si resultan necesarios. No cambiar la configuración de testing.

## 3. Orden recomendado de tareas

1. Confirmar el contrato de los endpoints de facets, top categories y movimientos, incluyendo parámetros de negocio, operación y fechas, y los filtros invertidos.
2. Definir tipos/utilidades frontend para categorías completas y porcentajes independientes por grupo y operación.
3. Actualizar cada panel B2B/B2C para mostrar todas las categorías con ingreso y egreso (importe y porcentaje).
4. Actualizar el único gráfico comparativo para mostrar ingreso y egreso de ambos grupos.
5. Conectar facets, top categories para ambas operaciones, cuatro totales y rango de fechas a la vista; coordinar solicitudes y cancelación al cambiar filtros.
6. Ejecutar las pruebas, build y lint existentes; corregir regresiones relacionadas sin modificar la configuración de testing.
7. Contrastar uno por uno los criterios de aceptación y registrar evidencia por criterio.

## 4. Verificación básica

- Backend: `cd backend && pytest`; comprobar facets y que `/api/metrics/categories/top` acepta `operation_type=income`/`outcome`, `limit=5`, `business_type` y límites de fecha. Comprobar `/api/metrics/b2b` y `/api/metrics/b2c` con ambos tipos de operación y fechas.
- Frontend: `cd frontend && npm test -- --run`, `npm run build` y `npm run lint` usando los scripts existentes.
- Verificación funcional: abrir la nueva vista, verificar dos secciones paralelas, todas las categorías de facets, ingresos y egresos con importes/porcentajes, un único gráfico de cuatro series y filtros `YYYY-MM-DD`; observar peticiones para confirmar negocio, operación, límite y fechas.

## 5. Riesgos para funcionalidad existente

- `/api/metrics/categories/top` devuelve el monto por categoría, pero no el total completo de ingresos del grupo; el porcentaje debe usar un denominador correcto, no la suma solo de las cinco categorías.
- Todas las consultas de una vista deben compartir el mismo rango para evitar comparaciones incongruentes.
- La API top puede omitir categorías sin movimientos en una operación; el frontend debe completar esas categorías con ceros y usar el total de movimientos de esa operación como denominador.
- El dashboard hoy renderiza una sola pantalla; la nueva vista necesita una ruta, pestaña o navegación clara sin ocultar ni reemplazar indebidamente la vista existente. El mecanismo concreto debe ajustarse a la estructura real tras inspección.
- Rangos parciales y fechas invertidas deben mantener un comportamiento coherente con el filtro ya existente; no se debe introducir una segunda interpretación de fechas.
