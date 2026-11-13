# Student Resource Hub

A student-friendly directory for discovering learning resources by subject, difficulty, and format. The app now uses an Express backend and a local SQLite database instead of loading its resource list directly from a JSON file.

## Features

- Search by keyword across titles, descriptions, subjects, and tags
- Filter resources by subject, difficulty, and format
- SQLite persistence, automatically initialized and seeded from `data/resources.json` on first run
- REST API for reading resources and admin-protected create, update, and delete operations
- Responsive, accessible frontend with no frontend build step

## Requirements

- Node.js 20 or later
- npm

## Run locally

```bash
npm install
npm start
```

Open <http://localhost:3000>. On first start, the app creates `data/resources.db` and imports the sample resources from `data/resources.json`. The SQLite database is ignored by Git.

For automatic server restarts while developing, run `npm run dev`.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/resources` | List resources; supports `q`, `subject`, `difficulty`, and `type` query parameters |
| `GET` | `/api/resources/:id` | Get one resource |
| `POST` | `/api/resources` | Create a resource (admin key required) |
| `PUT` | `/api/resources/:id` | Replace a resource (admin key required) |
| `DELETE` | `/api/resources/:id` | Delete a resource (admin key required) |

Example read request:

```bash
curl 'http://localhost:3000/api/resources?q=python&difficulty=Beginner'
```

Write endpoints require an `x-admin-key` header. Set a private key in your shell before starting the server; do not commit it or put it in frontend code.

```bash
# macOS/Linux
export ADMIN_API_KEY='choose-a-long-random-secret'
npm start
```

```powershell
# Windows PowerShell
$env:ADMIN_API_KEY = 'choose-a-long-random-secret'
npm start
```

Example create request:

```bash
curl -X POST http://localhost:3000/api/resources \
  -H 'Content-Type: application/json' \
  -H 'x-admin-key: choose-a-long-random-secret' \
  -d '{"title":"Example course","subject":"Programming","difficulty":"Beginner","type":"Course","description":"A short description.","url":"https://example.com","tags":["coding"]}'
```

The API validates required fields, URL protocols, and tag limits. Admin write routes return `503` until `ADMIN_API_KEY` is configured.

## Configuration

- `PORT`: web server port (default `3000`)
- `DATABASE_PATH`: SQLite file path (default `data/resources.db`)
- `ADMIN_API_KEY`: secret required for resource create, update, and delete operations

The default SQLite file is suitable for local development and persistent disks. For hosting on platforms with an ephemeral filesystem, configure a persistent volume or use a managed database before relying on data surviving redeployments.

## Project structure

```text
student-resource-hub/
├── app.js
├── database.js
├── server.js
├── index.html
├── styles.css
├── script.js
├── data/
│   └── resources.json  # initial seed data
└── README.md
```

## License

MIT. See [LICENSE](LICENSE).
