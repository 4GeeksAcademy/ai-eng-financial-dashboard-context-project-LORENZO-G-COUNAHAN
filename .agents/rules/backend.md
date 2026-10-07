# Reglas de backend

- **Nombre:** Preservar contratos de API y aislar la lógica de datos.
- **Alcance:** FastAPI, modelos y funciones en `backend/app/routes.py`, middleware en `backend/app/main.py` y pruebas en `backend/tests/`.
- **Justificación:** Los endpoints están tipados, comparten filtros y devuelven modelos explícitos. Los hallazgos identificaron rangos de comparación invertidos sin validar, acceso a listas vacías en facets, semilla aleatoria global, CORS abierto y configuración de debug propia de desarrollo.
- **Guía específica del proyecto:** Conserva `/health` y los prefijos `/api/metrics`. Usa anotaciones de tipos, `Literal`, `Query` y `response_model` donde ya se sigue ese patrón. Al añadir filtros, mantenlos coherentes entre endpoints relacionados y prueba combinaciones relevantes en `backend/tests/test_routes.py`. Rechaza `end_date < start_date` en comparación y fija el status/message en pruebas. No asumas que `build_metrics_facets` acepta listas vacías: define primero el contrato. Usa `random.Random(seed)` local para datos reproducibles sin mutar el estado aleatorio compartido. Mantén `float` solo mientras la precisión requerida lo permita; si se exige exactitud contable, planifica una migración `Decimal` incluyendo API/serialización.

## Ejemplos

**Correcto — rango inválido:**

```python
if end_date < start_date:
    raise HTTPException(
        status_code=422,
        detail="end_date must be on or after start_date",
    )
```

La prueba debe llamar la ruta con `start_date=2025-03-31` y `end_date=2025-03-01`, y comprobar el 422 y el detalle acordado.

**Incorrecto:** devolver métricas de periodo comparativo cuando las fechas están invertidas como si fueran una consulta válida.

**Correcto — reproducibilidad aislada:** crear `rng = random.Random(seed)` y usar esa instancia en todos los sorteos del generador; probar mismo resultado con igual semilla y que el estado global no cambia.

**Incorrecto:** invocar `random.seed(seed)` desde la función generadora compartida.

**Correcto — nueva ruta:** tipar y validar parámetros, reutilizar funciones de filtro/orden pertinentes, declarar el modelo de respuesta y cubrir status, esquema y filtros con `TestClient`.

## Configuración de producción

`backend/app/main.py` permite cualquier origen/método/header y credenciales; Compose publica el puerto debug `5678`, y el Dockerfile backend usa Uvicorn con reload/debug. Son opciones de desarrollo, no una configuración de producción. Antes de publicar, limita CORS a orígenes necesarios, desactiva debug/reload y no publiques el puerto del depurador. La configuración local debe seguir siendo funcional.

## Validación con tarea real

Se implementaron y probaron dos cambios respaldados por estos hallazgos:

1. `generate_mock_movements` usa `Random` local; `test_generate_mock_movements_does_not_mutate_global_random_state` comprueba que no altera el PRNG del proceso. La prueba existente mantiene la verificación de 360 elementos ordenados.
2. `GET /api/metrics/comparison` rechaza fechas invertidas con 422; `test_metrics_comparison_rejects_inverted_date_range` verifica el contrato, junto con la prueba existente del esquema de éxito.

Ejecuta la validación real con `cd backend && pytest` y comunica su resultado; no des por aprobada la suite sin ejecutarla.
