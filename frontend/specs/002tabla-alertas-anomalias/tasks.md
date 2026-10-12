# Tareas: Tabla alertas de anomalías

## Backend

- [x] **T001** Ajustar el endpoint `/api/metrics/alerts` para usar la media móvil de los tres periodos anteriores y aceptar `threshold` entre `0.01` y `1.0`, con default `0.03`.
- [x] **T002** Añadir o actualizar pruebas backend para el promedio de los tres periodos previos, los límites y default del umbral y la aplicación de las fechas.

## Frontend

- [x] **T003** Añadir los tipos y el componente de tabla de alertas con las cuatro columnas requeridas, el input numérico `0.01`–`1.0` por defecto `0.03`, y conservar visibles los gráficos existentes.
- [x] **T004** Consultar `/api/metrics/alerts` enviando el umbral y las fechas seleccionadas en el filtro existente; mostrar la respuesta en la tabla y «anomalía no detectada» si está vacía.

## Verificación

- [ ] **T005** Ejecutar las pruebas backend y frontend, build y lint indicados en el plan; resolver fallos atribuibles a los cambios sin modificar configuración de herramientas de testing. Backend: pytest `22 passed`; frontend bloqueado porque falta Vitest y npm ci reporta EACCES en frontend/node_modules.
- [ ] **T006** Verificar uno por uno los criterios de aceptación de `spec.md` y registrar para cada criterio `cumple` o `no cumple` con evidencia breve.

## Estado de verificación actual

- Implementación backend verificada con pytest en un entorno temporal de dependencias: `22 passed`; se observa un warning deprecado de Starlette/httpx. T001 y T002 completadas.
- Frontend: el analizador de errores del editor no informa errores para los archivos modificados. No se pudieron ejecutar Vitest/build/lint: `vitest` no está instalado y `npm ci` falla con `EACCES` creando `frontend/node_modules/@babel`. El intento de instalación en prefijo temporal también se bloqueó porque el repositorio no contiene lockfile requerido por `npm ci`.
- T003 y T004 implementadas; aún requieren validación ejecutable de frontend cuando estén disponibles sus dependencias.
- T005 permanece pendiente por bloqueo de dependencias/permisos del entorno. No se modificó la configuración de testing.
- T006 pendiente; debe registrar evidencia criterio por criterio luego de completar las verificaciones disponibles.
