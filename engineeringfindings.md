# Hallazgos de ingeniería

Hallazgos basados en la revisión del código y la configuración del repositorio.

## Convenciones observadas

| Categoría | Convención | Evidencia |
|---|---|---|
| **Arquitectura** | El frontend y el backend están separados; Vite reenvía las solicitudes `/api` al backend. La interfaz divide la pantalla en componentes. | [Compose](docker-compose.yml#L1), [proxy de Vite](frontend/vite.config.ts#L10), [App](frontend/src/App.tsx#L1) |
| **Testing** | Hay pruebas para las utilidades del frontend y pruebas de rutas y filtros del backend. En la revisión no se identificó un problema concreto de testing. | [Pruebas frontend](frontend/src/lib/financial-utils.test.ts#L1), [pruebas backend](backend/tests/test_routes.py#L1) |

En los hallazgos revisados no se identificó una convención concreta de **naming** ni de **documentación**.

## Patrones arriesgados

| Categoría | Patrón o hallazgo | Evaluación | Evidencia |
|---|---|---|---|
| **Arquitectura / estado compartido** | El generador establece la semilla mediante `random.seed(42)`, que modifica el estado aleatorio global del proceso. | Riesgo, prioridad media | [Generador](backend/app/routes.py#L94) |
| **Seguridad y configuración de despliegue** | CORS permite cualquier origen, método y encabezado, y habilita credenciales. | Riesgo si se publica en producción | [Configuración CORS](backend/app/main.py#L7) |
| **Configuración de despliegue / DX** | Los contenedores arrancan servidores en modo de desarrollo: Vite usa `npm run dev`, Uvicorn usa `--reload` y el backend inicia `debugpy`; Compose publica el puerto `5678`. | Riesgo si se publica en producción; conveniente durante el desarrollo | [Dockerfile frontend](frontend/Dockerfile#L12), [Dockerfile backend](backend/Dockerfile#L12), [Compose](docker-compose.yml#L14) |
| **Datos y presentación** | La interfaz siempre muestra “2024 - Full Year”, mientras que el generador determina los años a partir de la fecha actual. | Inconsistencia funcional potencial | [Etiqueta de periodo](frontend/src/App.tsx#L49), [generador de fechas](backend/app/routes.py#L65) |
| **Fechas / frontend** | Las fechas ISO se convierten a `Date` y luego se agrupan según el año y mes locales; según la zona horaria, una fecha al inicio del mes podría agruparse en el mes anterior. | Riesgo condicional a la zona horaria | [Agrupación mensual](frontend/src/lib/financial-utils.ts#L36) |
| **Cálculos monetarios** | Importes y sumas se representan con `float`, que puede introducir imprecisiones de punto flotante. | Riesgo para cálculos que requieran exactitud contable | [Modelo](backend/app/routes.py#L22), [cálculo del neto](backend/app/routes.py#L211) |
| **Dependencias / reproducibilidad** | Las dependencias de Python no tienen versiones fijadas; el Dockerfile frontend ejecuta `npm install` pese a que el proyecto incluye `package-lock.json`. | Riesgo de que las instalaciones no sean reproducibles | [requirements.txt](backend/requirements.txt#L1), [Dockerfile frontend](frontend/Dockerfile#L5) |
| **Validación de API** | La comparación exige fechas, pero no valida que la fecha final sea igual o posterior a la inicial. | Riesgo de resultados sin sentido ante rangos invertidos | [Parámetros de comparación](backend/app/routes.py#L305) |
| **Robustez de funciones** | `build_metrics_facets` usa el primer y último elemento de la lista sin comprobar si está vacía. | Riesgo condicional: la ruta actual genera datos antes de llamarla | [Función](backend/app/routes.py#L150) |
| **Estilo / DX** | En archivos del frontend se observan comillas simples y dobles; en la revisión no se encontró una configuración de formateo explícita. | Observación de mantenimiento, no defecto funcional comprobado | [App](frontend/src/App.tsx#L1), [cabecera](frontend/src/components/dashboard/dashboard-header.tsx#L1) |

## Reglas de codificación

Las reglas recomendadas se basan en la estructura y los riesgos observados arriba. La tabla distingue su alcance, motivo y guía aplicable a este repositorio. Las recomendaciones no implican que ya estén implementadas.

| Nombre de la regla | Alcance | Justificación | Guía específica del proyecto |
|---|---|---|---|
| Mantener la separación frontend/backend | Cambios que atraviesan la interfaz y la API. | El proyecto separa React/TypeScript y FastAPI; Vite reenvía `/api` al backend. | Conserva el flujo `/api` configurado en `frontend/vite.config.ts` y la separación de servicios de `docker-compose.yml`. |
| Mantener la interfaz organizada en componentes | Cambios de interfaz del dashboard. | La aplicación distribuye la interfaz en componentes. | Añade o modifica componentes bajo `frontend/src/components/dashboard/` cuando corresponda, en lugar de concentrar funcionalidad no relacionada en `frontend/src/App.tsx`. |
| Probar el comportamiento modificado | Cambios en utilidades financieras, rutas o filtros. | El repositorio ya contiene pruebas de utilidades del frontend y de rutas/filtros del backend. | Actualiza o añade pruebas en `frontend/src/lib/financial-utils.test.ts` o `backend/tests/test_routes.py`, según la capa afectada. |
| Validar rangos de fechas | Endpoints que reciben fechas inicial y final. | La comparación recibe fechas, pero no valida que la fecha final sea igual o posterior a la inicial. | Maneja explícitamente rangos invertidos en `backend/app/routes.py` y añade una prueba para ese caso. |
| Manejar listas vacías | Funciones que acceden al primer o último elemento de una colección. | `build_metrics_facets` usa extremos de la lista sin comprobar que no esté vacía. | Define el resultado o error esperado para lista vacía antes de acceder a sus elementos en `backend/app/routes.py`. |
| Agrupar fechas evitando cambios por zona horaria | Conversión de fechas ISO y agrupación mensual en frontend. | Convertir a `Date` y usar getters locales puede desplazar una fecha de calendario al mes anterior según la zona horaria. | Revisa la agrupación en `frontend/src/lib/financial-utils.ts` y prueba fechas cercanas al límite entre meses. |
| Usar precisión apropiada para importes | Cálculos monetarios que requieran exactitud contable. | El backend usa `float` para importes y sumas, lo que puede introducir imprecisiones de punto flotante. | No asumas exactitud decimal al usar `float` en `backend/app/routes.py`; usa una representación decimal cuando el requisito de cálculo lo exija. |
| Evitar efectos globales del generador aleatorio | Generación de datos mock y otros consumidores de aleatoriedad del proceso. | La llamada a `random.seed` modifica el estado aleatorio global. | En cambios a `generate_mock_movements` en `backend/app/routes.py`, evita alterar el estado aleatorio compartido del proceso. |
| Mantener periodo visible coherente con los datos | Generación de movimientos y presentación del periodo en el dashboard. | La interfaz muestra “2024 - Full Year”, mientras que el generador deriva los años de la fecha actual. | Si cambia el periodo de datos, actualiza la etiqueta de `frontend/src/App.tsx` y comprueba su correspondencia con `backend/app/routes.py`. |
| Restringir CORS en producción | Configuración del backend antes de publicarlo. | `backend/app/main.py` permite cualquier origen, método y encabezado, y habilita credenciales. | No trates esa configuración como adecuada para producción; limita orígenes, métodos y encabezados a los necesarios y revisa el uso de credenciales. |
| Reservar servidores de desarrollo y depuración para desarrollo | Configuración de contenedores y despliegue. | Los contenedores arrancan Vite en modo dev, Uvicorn con `--reload` y `debugpy`; Compose publica el puerto `5678`. | No consideres por sí solos `frontend/Dockerfile`, `backend/Dockerfile` y `docker-compose.yml` una configuración de producción. |
| Mantener instalaciones reproducibles | Dependencias Python y frontend. | `backend/requirements.txt` no fija versiones y el Dockerfile frontend ejecuta `npm install` aunque el repositorio incluye `package-lock.json`. | Fija versiones de Python y utiliza el lockfile npm para que las instalaciones del frontend sean reproducibles. |

### Convenciones no establecidas

La revisión encontró comillas simples y dobles en el frontend y no identificó configuración explícita de formateo, ni una convención concreta de naming o documentación. Por tanto, este documento no impone una regla de comillas, formateador, naming o documentación que no esté respaldada por una configuración o convención observada.
