Repository: StudyPliot — Copilot instructions

Quick commands
- Frontend (StudyPliot/frontend)
  - install: npm ci
  - dev: npm run dev
  - build: npm run build
  - lint: npm run lint
  - preview: npm run preview
- Backend (StudyPliot/backend)
  - install: npm ci
  - start (dev): npm run start  (uses nodemon)
- Tests
  - No test scripts configured. If adding a test runner, run a single test with your runner’s “-- <path/to/test>” syntax (e.g., npm test -- tests/login.test.js).

High-level architecture
- Monorepo with two primary packages:
  - frontend/: React + Vite app (Tailwind CSS, ESLint). Routes: /login, /main, /about (react-router).
  - backend/: Express server (server.js) talking to MySQL via mysql package.
- Runtime behavior:
  - Backend listens on process.env.PORT || 3000. CORS enabled.
  - Frontend login POSTs to http://localhost:3000/login (see src/components/LoginPage.jsx).
  - DB: backend/server.js connects to database DESIGNLogin on port 3307 by default.

Key conventions & repository specifics
- API surface: single-auth endpoint /login (POST) implemented in backend/server.js; returns 200 for success, 401 for failure.
- DB credentials are hard-coded in backend/server.js — update to environment variables before deployment.
- Ports: backend default 3000; MySQL configured 3307. Frontend Vite default port (5173) — no proxy configured.
- Linting: frontend uses ESLint; .eslintrc.cjs located in frontend/.
- Styling: Tailwind is used (tailwind.config.js and postcss.config.js in frontend).
- Important files to check for behavior changes:
  - backend/server.js (DB, routes)
  - frontend/src/components/LoginPage.jsx (login flow + endpoint)
  - frontend/src/App.jsx (routing)
  - frontend/vite.config.js, tailwind.config.js
- Secrets: repository currently stores DB creds in server.js. Treat as sensitive and remove before publishing.

Assistant/AI config scan
- No AI assistant config files detected in repo root or project subfolders (checked for CLAUDE.md, .cursorrules, AGENTS.md, .windsurfrules, CONVENTIONS.md, AIDER_CONVENTIONS.md, .clinerules).

How Copilot sessions should start
- Open the project root, then:
  - Start backend: cd StudyPliot/backend && npm ci && npm run start
  - Start frontend: cd StudyPliot/frontend && npm ci && npm run dev
- Useful first queries for Copilot:
  - “Where is the login endpoint implemented?”
  - “Show where DB credentials are configured”
  - “List routes and components involved in login flow”
- When suggesting code changes, prefer:
  - Replacing hard-coded secrets with env variables
  - Adding a proxy or environment-based API URL in frontend
  - Adding tests (Vitest/Jest) and a test script to package.json

Maintenance notes (for humans, short)
- Add automated tests and CI; none exist now.
- Move DB credentials to env vars and document in README or .env.example.
