# LabQuest Science Learning

A React-first prototype for senior-secondary practical science learning. It demonstrates school setup, student and teacher workspaces, guided virtual practicals, an interactive low-voltage circuit simulation, Environmental Science content, assessment authoring, grading, progress, and in-app activity alerts.

## Stack

- React 18 + Vite for the responsive client
- Express 5 as a same-origin API boundary
- Managed MySQL-compatible project database through `DATABASE_URL`, with idempotent additive schema setup
- `lucide-react` for interface icons

The React client is separated from the Express routes and database access so another client, including a React Native app, can later reuse the API and product concepts. Science content is stored in editable modules under `client/src/data/` and `server/sample-data.js`.

## Run in the project environment

```bash
pnpm install
pnpm dev
```

The server listens on port 3000. `pnpm build` creates the static client in `dist/`; `pnpm start` serves that build through Express.

## Prototype boundary

The role switcher and sample learners demonstrate the user experience; they are not authentication or authorization. School-code joining is not verified, and exam proctoring is not active. Do not enter real student information or use this prototype for a real school until identity, role checks, school-tenancy enforcement, production assessment security, and secure file-upload authorization are implemented. The practical resource library is a visual placeholder; file uploads and private resource delivery are not connected. In-app alerts are not email delivery. The managed database is shared across development and production, so current demo records persist there.
