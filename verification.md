# Mapa del producto

## Producto

Panel de métricas financieras. El frontend muestra indicadores clave (KPI) y gráficos; el backend proporciona movimientos financieros y análisis. El backend genera movimientos de ejemplo en el código en lugar de leerlos de una base de datos ([generador](backend/app/routes.py#L94)).

## Servicios

| Servicio | Responsabilidad | Puerto local | Evidencia |
| --- | --- | --- | --- |
| `frontend` | Aplicación React servida por Vite; redirige las solicitudes `/api` al backend mediante un proxy. | `5173` | [Compose](docker-compose.yml#L2), [Dockerfile del frontend](frontend/Dockerfile#L12), [configuración de Vite](frontend/vite.config.ts#L11) |
| `backend` | Aplicación FastAPI servida por Uvicorn. El puerto `5678` se expone para `debugpy`. | `8000` (`5678` para depuración) | [Compose](docker-compose.yml#L14), [Dockerfile del backend](backend/Dockerfile#L12), [configuración de la aplicación](backend/app/main.py#L6) |

Compose declara que el frontend depende del backend. No define ningún servicio de base de datos ([definición de servicios](docker-compose.yml#L1)).

## Cómo ejecutarlo

Desde la raíz del repositorio, inicia ambos servicios con:

```bash
docker compose up --build
```

Direcciones documentadas para el entorno local:

- Panel frontend: `http://localhost:5173`
- API backend: `http://localhost:8000`
- Documentación interactiva de la API: `http://localhost:8000/docs`

Evidencia: [instrucciones para ejecutar localmente](README.es.md#L42).

## Flujo de ejecución

```text
Navegador
  -> frontend (Vite, puerto 5173)
  -> proxy de /api/* hacia backend:8000
  -> router de FastAPI
  -> generación de movimientos de ejemplo y análisis
  -> respuesta JSON al frontend
  -> cálculos de KPI y gráficos
```

El frontend solicita `/api/metrics` y calcula los KPI y los datos mensuales de los gráficos a partir de la respuesta ([solicitud](frontend/src/App.tsx#L15), [cálculos](frontend/src/App.tsx#L32)). Vite reenvía `/api` a `http://backend:8000` ([proxy](frontend/vite.config.ts#L11)).

## Puntos de entrada

| Punto de entrada | Función | Evidencia |
| --- | --- | --- |
| `docker-compose.yml` | Define los contenedores del frontend y el backend, y sus asignaciones de puertos. | [Servicios de Compose](docker-compose.yml#L1) |
| `frontend/index.html` | Documento del navegador que carga el módulo del frontend. | [Módulo HTML](frontend/index.html#L10) |
| `frontend/src/main.tsx` | Crea la raíz de React y renderiza `App`. | [Montaje de React](frontend/src/main.tsx#L3) |
| `frontend/src/App.tsx` | Carga los movimientos financieros y compone el panel. | [Solicitud de datos](frontend/src/App.tsx#L15), [panel](frontend/src/App.tsx#L49) |
| `backend/app/main.py` | Crea la aplicación FastAPI y registra el router. | [Aplicación y router](backend/app/main.py#L6) |
| `backend/app/routes.py` | Define los endpoints HTTP de estado y métricas. | [Primera ruta](backend/app/routes.py#L243) |
| `backend/tests/test_routes.py` | Crea un cliente de pruebas y comprueba las rutas del backend. | [Cliente de pruebas](backend/tests/test_routes.py#L3) |

## Endpoints de la API

- `GET /health`
- `GET /api/metrics`
- `GET /api/metrics/facets`
- `GET /api/metrics/summary`
- `GET /api/metrics/categories/top`
- `GET /api/metrics/comparison`
- `GET /api/metrics/alerts`
- `GET /api/metrics/b2b`
- `GET /api/metrics/b2c`

Estas rutas están registradas en [backend/app/routes.py](backend/app/routes.py#L243). El panel actual solicita directamente `/api/metrics`; esto no significa que la pantalla también invoque los demás endpoints ([solicitud del frontend](frontend/src/App.tsx#L16)).

## Verificación del resumen

✅ = comprobado en el código o la configuración del repositorio. ❌ = no comprobado o contradicho por la implementación. ❓ = requiere ejecutar el proyecto para verificarlo.

| Estado | Afirmación | Evidencia y resultado |
| --- | --- | --- |
| ✅ | El producto muestra KPI y gráficos financieros. | `App.tsx` renderiza la fila de KPI y los dos gráficos ([pantalla](frontend/src/App.tsx#L58)). |
| ✅ | El backend genera movimientos de ejemplo. | `generate_mock_movements` genera los movimientos y las rutas usan esa función ([generador](backend/app/routes.py#L94), [ruta de métricas](backend/app/routes.py#L248)). |
| ✅ | Compose define `frontend` y `backend`; el frontend depende del backend y no hay un servicio de base de datos declarado. | [Servicios y dependencia en Compose](docker-compose.yml#L1). |
| ✅ | Frontend: Vite en el puerto `5173`; backend: FastAPI/Uvicorn en `8000`; `5678` se usa para `debugpy`. | [Dockerfile frontend](frontend/Dockerfile#L12), [Dockerfile backend](backend/Dockerfile#L12), [aplicación FastAPI](backend/app/main.py#L6). |
| ✅ | Vite reenvía `/api` a `backend:8000`; la pantalla solicita `/api/metrics` y calcula los KPI en el frontend. | [Proxy](frontend/vite.config.ts#L11), [solicitud y cálculos](frontend/src/App.tsx#L15). |
| ✅ | Los puntos de entrada web y de API descritos existen. | El HTML carga `main.tsx` ([HTML](frontend/index.html#L10)); React monta `App` ([montaje](frontend/src/main.tsx#L3)); FastAPI registra el router ([API](backend/app/main.py#L6)). |
| ✅ | Las nueve rutas enumeradas están registradas en el backend. | [Rutas HTTP](backend/app/routes.py#L243). |
| ❌ | La pantalla actual consume también las rutas de resumen, comparación, alertas, categorías, B2B o B2C. | No hay evidencia de esas llamadas: el frontend solo contiene una solicitud HTTP, dirigida a `/api/metrics` ([llamada](frontend/src/App.tsx#L16)). Las otras rutas existen en el backend, pero no se invocan desde la pantalla actual. |
| ❓ | `docker compose up --build` inicia correctamente los servicios y las URLs responden en el entorno actual. | El comando y las direcciones están documentados ([README](README.es.md#L42)) y los puertos están declarados ([Compose](docker-compose.yml#L2)), pero no se ejecutaron los contenedores para comprobar disponibilidad real. |
| ❓ | La documentación interactiva responde en `http://localhost:8000/docs`. | El README publica esa dirección ([README](README.es.md#L50)); su respuesta en ejecución no se comprobó. |