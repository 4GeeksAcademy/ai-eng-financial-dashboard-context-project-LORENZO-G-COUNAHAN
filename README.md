# Financial Metrics Dashboard

<!-- hide -->

By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) at [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_Estas instrucciones están [disponibles en español](./README.es.md)._

**Before you start**: 📗 [Read the instructions](https://4geeks.com/lesson/how-to-start-a-project) on how to start a coding project.

<!-- endhide -->

---

_Financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend._

## Recommended steps

1. Fork this repository to your account.
2. Open your fork in GitHub Codespaces or clone it and run it in your local environment.
3. Run your AI agent to inspect both frontend and backend.
4. Document the proposed rules and memory bank in your fork.
5. Refine and validate the rules until they fit the project's real workflow.

## Expected agents directory structure

```text
./.agents
└─ /rules
   └─ <rule-name>.md
└─ /skills
   └─ /<skill-name>
      └─ /SKILL.md
```

## Test-driven development skill

The repository includes the TDD skill from `mattpocock/skills` at `.agents/skills/tdd/SKILL.md`. To install or update it, run:

```bash
npx skills add https://github.com/mattpocock/skills --skill tdd
```

The skill is also recorded in `skills-lock.json`. When applying it, agree on the public behavior seams before writing tests, then work in small red-green slices. Tests should verify behavior through public interfaces rather than implementation details. Frontend tests run with `cd frontend && npm test -- --run`.

## How to run locally

```bash
docker compose up --build
```

The frontend uses the Vite proxy for `/api` by default, so no extra environment variables are required in local development or Codespaces.
If you need to target a different backend origin, copy `frontend/.env.example` to `.env` and set `VITE_API_BASE_URL`.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API documentation: http://localhost:8000/docs

## Accesibilidad

Se aplicaron mejoras de accesibilidad WCAG en el frontend:

| Mejora | Archivos modificados | Criterio WCAG |
|---|---|---|
| Skip-to-content link y `lang="es"` | `frontend/index.html` | 2.4.1, 3.1.1 |
| Regiones ARIA, `aria-live` y `aria-current` | `frontend/src/App.tsx` | 4.1.3, 4.1.2 |
| `aria-hidden` en iconos decorativos | `dashboard-header.tsx`, `kpi-card.tsx` | 1.1.1 |
| `<caption>` en tablas de datos | `anomaly-alerts-table.tsx`, `business-income-panel.tsx` | 1.3.1 |

Consulta `memory-bank/memory-bank.md` para el detalle completo.

## Rendimiento (Vercel React Best Practices)

Optimizaciones aplicadas siguiendo las guías de Vercel Engineering:

| Mejora | Archivo modificado | Regla | Prioridad |
|---|---|---|---|
| Pre-bundle de barrel imports | `frontend/vite.config.ts` | `bundle-barrel-imports` | CRÍTICA |
| Combinar iteraciones en `computeKPIs` | `frontend/src/lib/financial-utils.ts` | `js-combine-iterations` | MEDIA |
| Cachear `Intl.NumberFormat` | `frontend/src/lib/financial-utils.ts` | `js-hoist-regexp` | MEDIA |
| Lazy state initialization | `frontend/src/App.tsx` | `rerender-lazy-state-init` | MEDIA |
| `React.memo` en KPICard | `frontend/src/components/dashboard/kpi-card.tsx` | `rerender-memo` | MEDIA |

---

This and many other projects are built by students as part of the [Career Programs](https://4geeksacademy.com/compare-programs) at [4Geeks Academy](https://4geeksacademy.com). By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors). Find out more about [AI Engineering](https://4geeksacademy.com/en/coding-bootcamps/ai-engineering), [Data Science & Machine Learning](https://4geeksacademy.com/en/coding-bootcamps/data-science-ml), [Cybersecurity](https://4geeksacademy.com/en/coding-bootcamps/cybersecurity) and [Full-Stack Software Developer with AI](https://4geeksacademy.com/en/coding-bootcamps/full-stack-developer).
