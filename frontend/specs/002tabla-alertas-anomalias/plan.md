# Plan de actuación: Tabla alertas de anomalías

## 1. Alcance técnico

El backend ya dispone de `GET /api/metrics/alerts`, que acepta `threshold`, `group_by`, `start_date` y `end_date`, y devuelve `period`, `outcome_total`, `baseline_average` e `increase_ratio`. La detección actual compara cada periodo con la media de todos los periodos anteriores disponibles, no necesariamente con los tres periodos inmediatamente anteriores. La interfaz actual no consume el endpoint de alertas. Por tanto, la tabla y la configuración del umbral requieren frontend; para cumplir la columna de media móvil de los tres periodos anteriores, es necesario alinear el cálculo del endpoint con ese requisito. El filtro de fechas ya está en el dashboard y el endpoint de alertas acepta esos parámetros.

## 2. Cambios previstos

### Rangos invertidos

No aplica como funcionalidad nueva: reutilizar el rango existente. Evitar solicitar alertas con un intervalo invertido, de acuerdo con el comportamiento vigente del filtro de fechas.

### Backend

- Revisar y ajustar la detección de alertas para calcular la media móvil con los tres periodos anteriores, en lugar de la media histórica acumulada.
- Restringir la validación de `threshold` al rango solicitado `0.01`–`1.0` y cambiar el valor por defecto a `0.03` si es compatible con el contrato existente.
- Añadir o actualizar pruebas para verificar el cálculo y los límites/default del endpoint.

Archivos previstos tras inspeccionar la implementación:
- `backend/app/routes.py`
- `backend/tests/test_routes.py`

### Frontend

- Añadir una tabla con periodo, outcome registrado, media móvil de los tres periodos anteriores e incremento porcentual, sin retirar los gráficos actuales.
- Añadir el input numérico con límites `0.01` y `1.0`, inicializado en `0.03`.
- Consumir `/api/metrics/alerts` pasando `threshold` y las fechas seleccionadas en el filtro existente.
- Mostrar «anomalía no detectada» cuando la respuesta no contenga filas.

Archivos previstos:
- `frontend/src/App.tsx`
- Nuevo componente visual de alertas bajo `frontend/src/components/dashboard/`.
- `frontend/src/lib/financial-types.ts` si hacen falta tipos de respuesta.

## 3. Orden recomendado de tareas

1. Ajustar y probar el contrato backend de alertas: media móvil de los tres periodos anteriores y umbral `0.01`–`1.0`, default `0.03`.
2. Crear tipos y componente frontend para la tabla y el control numérico, conservando los gráficos existentes.
3. Conectar la consulta de alertas al umbral y al rango de fechas seleccionado; manejar carga/error y respuesta vacía.
4. Ejecutar las pruebas y verificaciones existentes del backend y frontend.
5. Verificar uno por uno los criterios de aceptación de `spec.md` y registrar evidencia breve.

## 4. Verificación básica

- Backend: ejecutar `cd backend && pytest`, con pruebas para el resultado de alertas respecto de los tres periodos previos, validación de umbral y parámetros de rango.
- Frontend: ejecutar `cd frontend && npm test -- --run`, `npm run build` y `npm run lint`.
- Comprobación funcional: verificar gráficos presentes, columnas, umbral inicial y límites, peticiones al endpoint con threshold y fechas, filas dentro del rango y mensaje vacío.
- No añadir ni modificar configuración de herramientas de testing.

## 5. Riesgos para funcionalidad existente

- El endpoint ya existe, pero cambiar su referencia histórica al promedio móvil de tres periodos altera qué alertas devuelve a consumidores actuales.
- Validar el mínimo del umbral y modificar el default cambia el contrato del endpoint; mantener documentados y probados esos valores.
- La API devuelve `baseline_average`; la interfaz debe presentarlo como media de los tres periodos anteriores solo si el backend se actualiza como está previsto.
- La solicitud de alertas debe usar el mismo rango seleccionado que la consulta de movimientos para evitar que tabla y gráficos representen periodos distintos.
- Actualizar las alertas al cambiar rápidamente el rango o el umbral puede permitir respuestas antiguas sobrescribiendo resultados recientes; gestionar correctamente el ciclo de las solicitudes.
