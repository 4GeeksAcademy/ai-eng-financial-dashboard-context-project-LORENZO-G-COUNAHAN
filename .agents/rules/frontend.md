# Reglas de frontend

- **Nombre:** Mantener interfaz, métricas y fechas coherentes.
- **Alcance:** `frontend/src/App.tsx`, `frontend/src/components/dashboard/`, `frontend/src/lib/`, estilos y consumo de API.
- **Justificación:** La interfaz organiza KPIs y gráficos en componentes, obtiene datos desde `/api/metrics` y calcula métricas en utilidades. `create_date` representa una fecha ISO de calendario; convertirla en un instante local puede cambiar el mes según zona horaria.
- **Guía específica del proyecto:** Conserva `/api` para usar el proxy de `frontend/vite.config.ts`. Mantén lógica reutilizable en `src/lib/` y piezas visuales bajo `src/components/dashboard/`, en vez de concentrar cálculos en `App.tsx`. Agrupa `YYYY-MM-DD` por su fecha calendario; no uses getters locales sobre `new Date(isoDate)` para clasificar el mes. Añade o ajusta pruebas Vitest en `src/lib/financial-utils.test.ts` cuando cambie un cálculo. No impongas estilo de comillas/formateo: el proyecto no fija una convención única.

## Ejemplos

**Correcto — nueva métrica:** implementar la transformación en `financial-utils.ts`, probarla con movimientos de ejemplo y pasar el resultado como prop al componente que la presenta.

**Incorrecto:** sumar importes directamente en el JSX de `App.tsx` o llamar `http://localhost:8000` desde el navegador, saltándose el proxy `/api`.

**Correcto — fechas límite:** incluir movimientos `2025-02-28` y `2025-03-01`, y comprobar que se presentan en febrero y marzo, respectivamente. La agrupación mensual actual extrae año/mes de la cadena ISO para ser independiente de zona horaria.

## Validación con tarea real

Se aplicó la regla en `frontend/src/lib/financial-utils.ts`: se reemplazó el parseo local de `Date` por agrupación desde ISO y se agregó una prueba de cruce febrero/marzo. La prueba existente también cubre diciembre 2025/enero 2026. Validar con:

```bash
cd frontend
npm test -- --run
npm run build
npm run lint
```

Ejecuta los comandos relevantes al cambio e informa el resultado real.
