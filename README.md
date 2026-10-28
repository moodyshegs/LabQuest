# LabQuest Science Learning

A science lab on the go. LabQuest is a React-first prototype for senior-secondary practical science learning in Nigerian schools. The public landing page introduces the practical-first approach and links to an openly accessible sample dashboard. It demonstrates school setup, student and teacher workspaces, guided virtual practicals, an interactive low-voltage circuit simulation, Environmental Science content, assessment authoring, grading, progress, and in-app activity alerts.

## Stack

- React 18 + Vite for the responsive client
- Express 5 as a same-origin API boundary
- Managed MySQL-compatible project database through `DATABASE_URL`, with idempotent additive schema setup
- `lucide-react` for interface icons

The React client is separated from the Express routes and database access so another client, including a React Native app, can later reuse the API and product concepts. Science content is stored in editable modules under `client/src/data/` and `server/sample-data.js`.

## Run locally

```bash
npm install
npm run dev
```

The server listens on port 3000. `npm run build` creates the static client in `dist/`; `npm start` serves that build through Express.

## Deploy to Render

This project is ready for a Render web service using the included `render.yaml` configuration.

1. Push this repository to GitHub.
2. Log in to Render and select New > Web Service.
3. Connect the GitHub repository.
4. Render will use the configuration in `render.yaml` automatically.
5. The application will build with `npm install --include=dev && npm run build` and start with `npm start`.

The service health check points at `/api/health`, and the app is designed to serve the Vite build from the Express server in production.

## Prototype boundary

The role switcher and sample learners demonstrate the user experience; they are not authentication or authorization. School-code joining is not verified, and exam proctoring is not active. Do not enter real student information or use this prototype for a real school until identity, role checks, school-tenancy enforcement, production assessment security, and secure file-upload authorization are implemented. The practical resource library is a visual placeholder; file uploads and private resource delivery are not connected. In-app alerts are not email delivery. The managed database is shared across development and production, so current demo records persist there.
