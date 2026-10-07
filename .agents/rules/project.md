# Reglas del proyecto

- **Nombre:** Trabajar con el diseño y las prácticas reales del dashboard.
- **Alcance:** Todo el repositorio: documentación, commits, frontend/backend, dependencias y configuración de contenedores.
- **Justificación:** El proyecto separa React/TypeScript y FastAPI; Vite envía `/api` al backend. Los hallazgos en `engineeringfindings.md` también señalan riesgos de CORS/despliegue, reproducibilidad, fechas e importes. No hay una convención única de comillas, formateo, naming ni documentación configurada.
- **Guía específica del proyecto:** Consulta `engineeringfindings.md` y las reglas específicas de `frontend.md` o `backend.md` según el área. Conserva el flujo local `docker compose up --build` y el proxy `/api`. Documenta únicamente comportamientos verificados; distingue recomendaciones de funcionalidades ya existentes. No impongas convenciones de estilo no configuradas.

## Documentación y commits

- Si una instrucción de ejecución cambia, comprueba `README.md` y `README.es.md`; usa los scripts existentes en `frontend/package.json` (`dev`, `build`, `lint`, `test`).
- Antes de un commit, revisa `git status --short` y el diff. Selecciona explícitamente los archivos y mantén un solo propósito por commit.

**Ejemplo de commit específico:**

```bash
git add -- .agents/rules/project.md
git commit --only -m "docs: documenta reglas del proyecto" -- .agents/rules/project.md
```

No uses `git add .` cuando hay cambios ajenos a la tarea.

## Configuración y seguridad

- La configuración actual es de desarrollo: Vite/Uvicorn ejecutan servidores de desarrollo, Uvicorn recarga, `debugpy` está habilitado y Compose publica `5678`.
- `backend/app/main.py` permite CORS amplio y credenciales. Antes de publicar, limita orígenes, métodos y encabezados según el uso real, y deshabilita depuración/recarga y el puerto de debug.
- Para builds frontend reproducibles, respeta `package-lock.json` (por ejemplo, `npm ci`). Fijar versiones Python requiere actualizar y mantener `backend/requirements.txt` deliberadamente.

**Ejemplo:** conserva el compose para desarrollo local; configura producción por separado, sin puerto 5678 ni `--reload` y con CORS limitado.

## Validación en este repositorio

Las reglas se contrastaron con cambios reales, no solo con recomendaciones:

1. **Documentación y commits:** `engineeringfindings.md` y `verification.md` tienen commits independientes (`01d1126`, `57fe97b`), con un archivo por commit.
2. **Frontend:** se modificó la agrupación mensual para que la fecha ISO `YYYY-MM-DD` mantenga su mes calendario sin depender de la zona horaria local; se agregó una prueba con fechas de fin de febrero e inicio de marzo. Ejecutar `cd frontend && npm test -- --run` y `npm run build`.
3. **Backend:** `generate_mock_movements` utiliza un `random.Random(seed)` local y se probó que no altera el PRNG global. `GET /api/metrics/comparison` rechaza rangos invertidos con HTTP 422; se agregó una prueba de contrato. Ejecutar `cd backend && pytest`.
4. **Configuración/UI:** se revisaron los componentes del dashboard, `vite.config.ts`, ambos Dockerfiles, `docker-compose.yml` y dependencias para redactar pautas alineadas con el estado real.

Los puntos 2 y 3 son tareas implementadas y cubiertas por pruebas; no se afirma que las suites hayan pasado hasta ejecutarlas. Los puntos 1 y 4 se comprobaron inspeccionando commits y archivos existentes.
