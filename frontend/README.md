# Rationale Frontend

This is a Vite + React + TypeScript frontend scaffold for the Rationale project.

Theme: light blue accents on white background, black text.

Quick start:

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend API at `http://localhost:8080/api` by default. Override with `VITE_API_URL`.

Data fetching: this project uses React Query (`@tanstack/react-query`). The app is already wrapped with `QueryClientProvider` and the Devtools are enabled in development.

Example: the home page demonstrates a `useHealth` hook which fetches `GET /api/health`.
