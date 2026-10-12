# Financial Metrics Dashboard — Comparativa B2B vs B2C

## Objetivo

Añadir una página al dashboard para comparar el rendimiento de las líneas de negocio B2B y B2C mediante sus categorías de ingresos principales y una visualización comparativa.

## Usuario

Persona del equipo de finanzas que analiza el rendimiento de las líneas de negocio.

## Historia de usuario

Como usuario del equipo de finanzas, quiero comparar los ingresos de B2B y B2C por sus categorías principales en un rango de fechas, para identificar diferencias entre ambos grupos.

## Requisitos funcionales

- Crear una nueva página/vista del dashboard dedicada a comparar B2B y B2C.
- Presentar dos secciones en paralelo, una para B2B y otra para B2C.
- Cada sección presenta las cinco categorías principales de ingresos del grupo e incluye para cada categoría:
  - nombre de categoría;
  - total de ingresos;
  - porcentaje sobre el total de ingresos del grupo.
- Debajo de las dos secciones mostrar un único gráfico comparativo de ingresos B2B y B2C.
- Permitir filtrar la comparativa mediante un rango de fechas en formato `YYYY-MM-DD`.
- Obtener las categorías disponibles de `GET /api/metrics/facets`.
- Utilizar `GET /api/metrics/categories/top?operation_type=income&limit=5` para obtener las categorías principales.

## Criterios de aceptación

- Existe una nueva vista/página identificable de comparativa B2B vs B2C.
- La página muestra en paralelo una sección B2B y una B2C.
- Cada sección muestra hasta cinco categorías principales de ingresos, con nombre, total y porcentaje sobre los ingresos totales de su grupo.
- Hay un único gráfico debajo de ambas secciones que compara visualmente los ingresos de los dos grupos.
- El usuario puede seleccionar un rango de fechas y la comparativa refleja ese rango usando fechas `YYYY-MM-DD`.
- Las categorías disponibles de la interfaz se obtienen desde `/api/metrics/facets`.
- Las categorías principales se obtienen desde `/api/metrics/categories/top` con `operation_type=income` y `limit=5`.

## Casos de prueba

- Abrir la nueva vista y comprobar la presencia de las secciones B2B y B2C en paralelo.
- Comprobar que cada sección muestra como máximo cinco filas con nombre, total de ingresos y porcentaje del grupo.
- Comprobar que se presenta un único gráfico comparativo debajo de ambas secciones.
- Cambiar el rango de fechas y comprobar que las solicitudes relevantes incluyen `start_date` y `end_date` con fechas `YYYY-MM-DD`, y que los valores mostrados se actualizan.
- Comprobar que las categorías se cargan mediante `/api/metrics/facets`.
- Comprobar que se solicitan los top 5 usando `operation_type=income` y `limit=5` para cada línea de negocio.

## Fuera de alcance

- Modificar los datos fuente o la lógica con la que el backend genera y almacena movimientos.
- Añadir comparativas entre líneas de negocio distintas de B2B y B2C.
- Cambiar los gráficos existentes del dashboard principal.
