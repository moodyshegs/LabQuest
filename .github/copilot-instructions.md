# Copilot instructions for LabQuest

## Project snapshot

This repository is a Vite + React 18 frontend with an Express 5 server and a MySQL-compatible managed data layer. The app is a prototype science-learning experience for Nigerian schools, not a production auth system.

- Frontend: `client/src/` (React views, components, styles, data modules)
- Server/API: `server/index.js` and `server/db.js`
- Data/content sources: `client/src/data/`, `server/sample-data.js`, and the SQL schema in `server/schema.sql`
- Production entrypoints: `pnpm dev` for the local app and `pnpm build` / `pnpm start` for the built app

## Build, test, and lint commands

Use the repo scripts defined in `package.json`:

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm preview
```

Notes:
- `pnpm dev` runs the Express server on port 3000; the Vite middleware serves the React app via the same origin.
- `pnpm build` is the main validation/build command for the app.
- `pnpm start` serves the built app through Express in production mode.
- There are currently no `test` or `lint` scripts in `package.json`, so there is no single-test or lint command to standardize on in this repo today. If tests are added later, prefer running the specific relevant file or case instead of the whole suite.

## High-level architecture

The app intentionally separates the public landing page from the prototype dashboard:

- `client/src/App.jsx` manages the top-level `landing`/`dashboard` view state and the sample-role switcher.
- `client/src/pages/HomePage.jsx` is the public marketing page; it should stay welcoming and informative, and it should clearly describe the dashboard as a demo prototype.
- `client/src/pages/Pages.jsx` and the dashboard components under `client/src/components/` implement the classroom, practical, assessment, and progress experience.
- `client/src/data/content.js` and `client/src/data/interactivePracticals.js` are the editable content sources for the sample dashboard and the 30 interactive practical activities.
- `server/index.js` exposes the `/api/*` endpoints (bootstrap, practical completion, assessment submission, school creation, alerts, reviews), and it falls back to sample data when the managed database is unavailable.
- `server/db.js` initializes a MySQL-compatible pool from `DATABASE_URL`, applies `server/schema.sql`, and seeds sample records if the database is available.
- `client/src/lib/api.js` centralizes front-end calls to the same-origin API and normalizes request failures to a safe demo state.

This repository relies on a single-page client with a same-origin API boundary, not a separate backend service or SPA-only data layer. Keep that boundary intact unless the task explicitly requires a deeper backend change.

## Key conventions and repository-specific patterns

- Keep the prototype warning visible and do not imply real authentication, authorization, or school verification. The README explicitly calls this out as a demo prototype.
- Prefer sample-data fallbacks over introducing a new persistence layer for demo work. The server APIs are designed to degrade gracefully when `DATABASE_URL` is not set.
- Treat `client/src/data/` and `server/sample-data.js` as editable source content. New teaching content, practicals, and assessments should be added there rather than hard-coded across multiple components.
- The app uses a same-origin API boundary. Front-end changes should call `/api/*` routes through `client/src/lib/api.js` rather than reaching directly into the database or bypassing the Express server.
- Keep page-level navigation and project messaging consistent with the landing-page-to-dashboard flow. The public home page is the default entry point; the dashboard remains a demo workspace, not a real sign-in experience.
- When modifying the interactive experiments, follow the shared `InteractiveLab` pattern: input controls on the left, live model/graph in the center, measurement output on the right, and catalog definitions in the data layer rather than ad hoc component logic.
- Maintain a clear separation between UI components, page-level routing, and data definitions. This project is intentionally structured so future production data services can replace the sample layer without a full rewrite of the interface.

## Helpful context from the project docs

- The landing page and dashboard entry were intentionally redesigned in `plan.md` as a public prototype entry experience.
- `TODO.md` confirms the product direction: there are sample school onboarding flows, role-based dashboards, practical content, and assessment review functionality, but the app is still intentionally a prototype and not a production school platform.
- `README.md` is the clearest source for product boundaries and local-run instructions; follow its warnings about real student data and production enforcement features.

## Editing guidance

- Prefer surgical changes that fit the existing React + Express architecture instead of adding new libraries or frameworks unless the task explicitly requires them.
- Keep demo/prototype semantics intact when changing behavior, especially around role switching, school onboarding, or data persistence.
- When you add new content or API behavior, update the data shape or sample data in the same style as existing modules so the dashboard and server stay aligned.
- Favor edits that preserve the current root-page experience and the same-origin API boundary rather than reworking the app into a different architecture.
