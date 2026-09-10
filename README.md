# Marketing CRM

Full-stack CRM con React/TS + Vite (frontend) e Express + TypeScript (backend), MySQL, Socket.IO.

## Struttura

```
src/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Server entry point
│   │   ├── lib/
│   │   │   ├── db.ts         # MySQL connection + schema init
│   │   │   └── db-client.ts  # Prisma-like adapter (clientModel, taskModel, getDashboard)
│   │   └── routes/
│   │       ├── index.ts      # Socket.IO mount + health
│   │       └── crm.ts        # CRUD routes: /api/clients, /api/tasks, /api/dashboard/stats
│   ├── .env                  # DB creds (DB_PASSWORD vuoto per localhost)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Routes (Clients, Tasks, Dashboard)
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   └── Navbar.tsx
│   │   ├── hooks/
│   │   │   └── useData.ts    # useClients, useTasks, useDashboard
│   │   ├── lib/
│   │   │   ├── api.ts        # Axios (baseURL: "/api")
│   │   │   └── api-context.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── vite-env.d.ts
│   │   └── pages/
│   │       ├── ClientsPage.tsx
│   │       ├── TasksPage.tsx
│   │       └── DashboardPage.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts        # Proxy /api → http://localhost:3000
├── package.json              # Workspaces + concurrently
└── .gitignore
```

## Sviluppo

```bash
npm run dev        # Backend (port 3000) + Frontend (port 5173)
npm run build      # Compila entrambi
```

## API

- `GET  /api/clients`           — lista clienti
- `POST /api/clients`           — nuovo cliente
- `GET  /api/tasks`             — lista task
- `POST /api/tasks`             — nuovo task
- `GET  /api/dashboard/stats`   — statistiche dashboard
- `GET  /health`                — health check
