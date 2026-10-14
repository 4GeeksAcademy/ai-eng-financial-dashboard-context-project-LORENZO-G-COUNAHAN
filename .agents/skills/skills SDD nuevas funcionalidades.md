# SKILLS — Protocolo para nuevas funcionalidades

## Propósito

Establecer un flujo obligatorio y secuencial para especificar, planificar, desglosar e implementar nuevas funcionalidades del proyecto. No se empieza la fase siguiente hasta completar la anterior. La documentación debe basarse en el alcance solicitado y en los archivos reales del repositorio: no se inventan requisitos, comportamiento, pruebas ni cambios de código.

## Convención de directorios

Para cada funcionalidad, crear un directorio bajo `specs/` con el número consecutivo y un nombre descriptivo, por ejemplo:

```text
specs/001nombre-de-la-funcionalidad/
```

El número y nombre forman un único componente de directorio (`001` + nombre), siguiendo la convención existente en el repositorio. No crear `specs/001/nombre-de-la-funcionalidad/` a menos que el proyecto adopte explícitamente esa estructura. Antes de asignar número, revisar los directorios existentes y usar el siguiente consecutivo disponible.

Dentro de ese directorio se crearán, en este orden, `spec.md`, `plan.md` y `tasks.md`.

## Fase 1 — Especificación (`spec.md`)

Primero crear `specs/001nombre-de-la-funcionalidad/spec.md`. Usar el nombre real del proyecto en el título y mantener estas secciones, en este orden:

Cabecera YAML obligatoria al inicio de `spec.md`:
```yaml
---
name: nombre de la funcionalidad a incorporar
description: breve descripción de la nueva funcionalidad, su tarea u objetivo a cubrir, disparadores y alcance.
---
```

```markdown
# [Nombre del proyecto]

## Objetivo

## Usuario

## Historia de usuario

## Requisitos funcionales

## Criterios de aceptación

## Casos de prueba

## Fuera de alcance
```

Reglas para redactar la especificación:

- Describir el objetivo y los requisitos expresados para la funcionalidad, sin ampliarlos con ideas no solicitadas.
- Especificar criterios de aceptación observables y casos de prueba que permitan comprobarlos.
- Identificar explícitamente lo que queda fuera del alcance cuando corresponda.
- No afirmar como existente una capacidad que no se haya comprobado en el código o la documentación.
- Revisar que los criterios y casos de prueba sean coherentes entre sí antes de pasar a la siguiente fase.

## Fase 2 — Plan de actuación (`plan.md`)

Solo después de completar y revisar `spec.md`, crear `specs/001nombre-de-la-funcionalidad/plan.md`. Usar `spec.md` de la funcionalidad y la documentación real del proyecto como fuentes. En este repositorio, el archivo de especificación se llama `spec.md`; si una instrucción menciona `specs.md`, verificar si existe antes de referenciarlo y no asumir que es otro documento.

El plan explica cómo abordar los requisitos; no implementa código ni agrega funcionalidades. Antes de proponer cambios, inspeccionar los componentes, endpoints, pruebas y configuración pertinentes. Distinguir las capacidades existentes de los cambios realmente necesarios. No inventar contratos, archivos, sistemas o verificaciones.

Usar esta estructura:

```markdown
# Plan de actuación: [nombre de la funcionalidad]

## 1. Alcance técnico

## 2. Cambios previstos

### Rangos invertidos

### Backend

### Frontend

## 3. Orden recomendado de tareas

## 4. Verificación básica

## 5. Riesgos para funcionalidad existente
```

Adaptación de la estructura:

- Mantener el apartado `Rangos invertidos` por compatibilidad con el formato solicitado; si no aplica a la funcionalidad, indicar brevemente que no aplica. No crear una política de rangos invertidos como requisito ajeno al alcance.
- En `Backend` y `Frontend`, describir solo los cambios pertinentes. Si un área no aplica, indicarlo sin proponer trabajo ficticio.
- La verificación debe nombrar comandos, pruebas o comprobaciones que existan y sean pertinentes. No afirmar que se ejecutaron si todavía no se han ejecutado.
- Los riesgos deben derivarse de la implementación observada y de los requisitos de la especificación.

Revisar que cada cambio previsto esté justificado por un requisito de `spec.md` y que el plan no extienda su alcance.

## Fase 3 — Tareas (`tasks.md`)

Solo después de completar y revisar `plan.md`, crear `specs/001nombre-de-la-funcionalidad/tasks.md` basándose en `spec.md` y `plan.md`.

Reglas:

1. Convertir el trabajo aprobado en tareas ejecutables, identificadas en orden como `T001`, `T002`, `T003`, etc. Usar Markdown estándar: `- [ ] **T001** ...`.
2. Cada tarea principal comienza sin completar (`- [ ]`). No usar `- [x]` al generar la lista.
3. Marcar una tarea como `- [x]` únicamente después de implementar **y verificar** esa tarea. Si la verificación falla o no se pudo ejecutar, dejarla sin completar e informar el bloqueo.
4. Crear como máximo 10 tareas principales.
5. Cada tarea debe describir un cambio concreto, verificable y suficientemente acotado.
6. Respetar el orden de dependencias del plan; completar y marcar una tarea antes de empezar la siguiente.
7. Agrupar por Backend, Frontend y Verificación solo si esa separación aplica; no crear grupos vacíos.
8. Incluir la verificación necesaria para los cambios. No marcar la tarea de verificación como completada hasta ejecutar y revisar el resultado.
9. No añadir ni modificar la configuración de herramientas de testing como parte de las tareas, salvo que el plan lo indique explícitamente.
10. No añadir tareas que no estén contempladas en `plan.md`. Si falta una tarea necesaria, actualizar y revisar primero el plan.
11. La última tarea debe verificar, uno por uno, los criterios de aceptación de `spec.md` y registrar el resultado con evidencia breve.

## Implementación y cierre

- Seguir `tasks.md` estrictamente en orden: no iniciar una tarea posterior mientras la anterior siga sin terminar.
- Mantener las casillas al día al completar cada tarea; la evidencia de verificación debe ser real y comprobable.
- Al final, comparar la implementación con cada criterio de aceptación de `spec.md`, uno por uno, y registrar `cumple` o `no cumple` con evidencia breve. No ocultar limitaciones ni pruebas no ejecutadas.
- Una vez implementada y verificada la funcionalidad, actualizar `memory-bank/memory-bank.md`, `README.md` y `README.es.md` para documentar el comportamiento realmente disponible. Mantener los README coherentes entre idiomas y no documentar como existente nada que no se haya verificado.
- La especificación inicial es la referencia aprobada y debe conservarse: no la reescribas ni cambies su alcance durante la implementación. Si se detecta una contradicción, carencia o necesidad de cambio, detén el trabajo relacionado e informa al usuario; continúa solo tras recibir autorización explícita. Cualquier cambio autorizado debe preservar la especificación inicial y dejar constancia de la modificación aprobada; luego alinea `plan.md` y `tasks.md` con ella antes de reanudar la implementación.
