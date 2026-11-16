# Campus Lost and Found Portal

IFT305 course project. A web portal where students report lost or found items, claim items with proof, and an admin approves or rejects claims. Built on the PERN stack (PostgreSQL, Express, React, Node).

## Folders
| Folder | Contents |
|---|---|
| `frontend/` | React + Vite app (plain CSS, JavaScript) |
| `backend/` | Express REST API (JWT auth, multer uploads) |
| `database/` | `schema.sql`, `seed.sql` |
| `docs/` | `blueprint.md`, `prd.md`, `design.md` |

## Prerequisites
Node 20+, PostgreSQL 14+ (with `pgcrypto`), macOS/Linux shell.

## Setup (one time)
```bash
createdb campus_lost_found
psql campus_lost_found -f database/schema.sql
psql campus_lost_found -f database/seed.sql
cp backend/.env.example backend/.env        # then set JWT_SECRET
(cd backend && npm install)
(cd frontend && npm install)
```

## Run
```bash
(cd backend && npm run dev)     # API on http://localhost:5000
(cd frontend && npm run dev)    # App on http://localhost:5173
```
Admin login: `admin@campus.edu.ng` / `admin1234` (change it after first use).
Students register themselves with a matric number (e.g. `IFT/21/1042`) and a `@campus.edu.ng` email.

## Main flow
Student A reports a found item (photo optional) -> Student B claims it with proof (30+ characters) -> admin approves -> both students see each other's contact details and the item becomes RETURNED. If the admin rejects (reason required), the item goes back to OPEN and that student cannot claim it again.

## API
All routes are under `/api`, JSON, `Authorization: Bearer <token>`. Errors look like `{"error": "message"}`. The full list is in `docs/blueprint.md` section 11.

## Frontend data source
`frontend/src/lib/api.js` talks to the real API and reshapes responses for the UI. The old in-browser mock is kept in `frontend/src/lib/api.mock.backup.js`.

## Known limitations
See `docs/blueprint.md` section 15.
