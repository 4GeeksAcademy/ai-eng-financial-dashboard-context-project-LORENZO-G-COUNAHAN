# Financial Metrics Dashboard — Tabla alertas de anomalías

## Objetivo

Añadir al dashboard una tabla que identifique periodos en los que el gasto aumentó de forma inesperada, complementando los gráficos existentes.

## Usuario

Persona del equipo de finanzas que consulta el dashboard.

## Historia de usuario

Como usuario del equipo de finanzas, quiero ver en una tabla los periodos con aumentos inesperados del gasto, con su referencia de periodos anteriores, para identificar anomalías financieras.

## Requisitos funcionales

- La nueva tabla se integra en el frontend y conserva los gráficos existentes.
- La tabla presenta cuatro columnas: periodo, outcome registrado, media móvil de los tres periodos anteriores e incremento porcentual.
- El usuario puede configurar el umbral de alerta mediante un input numérico entre `0.01` y `1.0`; el valor por defecto es `0.03`.
- Cuando no se detecten anomalías, se muestra explícitamente el mensaje «anomalía no detectada».
- Las alertas respetan el rango de fechas seleccionado en la funcionalidad `001filtroderangodefechas`.
- La funcionalidad consume el endpoint `GET /api/metrics/alerts?threshold=<ratio>`.

## Criterios de aceptación

- Los gráficos actuales siguen presentes al añadir la tabla.
- La tabla muestra las columnas periodo, outcome registrado, media móvil de los tres periodos anteriores e incremento porcentual.
- El umbral puede configurarse con un valor de `0.01` a `1.0` y se inicia en `0.03`.
- Cambiar el umbral actualiza las alertas solicitadas al endpoint.
- Las filas mostradas corresponden al rango de fechas seleccionado en el filtro existente.
- Si no se reciben alertas, aparece exactamente el mensaje «anomalía no detectada».

## Casos de prueba

- Comprobar que los gráficos existentes permanecen visibles junto con la nueva tabla.
- Comprobar los cuatro encabezados de la tabla.
- Comprobar que el control numérico inicia en `0.03` y limita la selección al rango `0.01`–`1.0`.
- Cambiar el umbral y comprobar que la consulta a `/api/metrics/alerts` lo envía como `threshold`.
- Seleccionar un rango de fechas y comprobar que las alertas corresponden solo a ese rango.
- Simular una respuesta de alertas vacía y comprobar el texto «anomalía no detectada».

## Fuera de alcance

- Cambiar los gráficos existentes.
- Modificar la generación o almacenamiento de los datos financieros.
- Añadir filtros adicionales a los ya especificados para rango de fechas y umbral.
