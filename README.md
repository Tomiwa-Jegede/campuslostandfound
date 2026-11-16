# Campus Lost & Found

An IFT305 software engineering project: a lost-and-found portal for a university campus,
built on the **PERN stack** (PostgreSQL, Express, React, Node.js).

The centrepiece is **verified ownership**: a student claims a found item privately, an
administrator compares the claim with the report, and only after approval do the two
people see each other's contact details.

## Current state

| Phase | What it covers | Status |
|---|---|---|
| 0 | Environment and workspace inspection | done |
| 1 | Requirements (`docs/prd.md`) | approved |
| 2 | UI/UX design (`docs/design.md`, `design/`) | approved |
| 3 | React frontend | built, running on mock data |
| 4 | Express API | not started |
| 5 | PostgreSQL database | not started |
| 6 | Testing | not started |
| 7 | Documentation | not started |

The frontend currently talks to an in-browser **mock API** so every screen and rule can be
demonstrated before the server exists. `client/src/lib/api.js` has a single `USE_MOCK`
switch; flipping it to `false` points the same UI at the Express API from Phase 4.

## Run the frontend

```bash
cd client
npm install
npm run dev
```

Then open <http://localhost:5173>.

Demo accounts (mock data only, passwords are stored in plain text on purpose and will be
hashed with bcrypt on the real server):

| Role | Email | Password |
|---|---|---|
| Student | `ada.okafor@campus.edu.ng` | `password123` |
| Student | `tunde.bello@campus.edu.ng` | `password123` |
| Administrator | `admin@campus.edu.ng` | `admin1234` |

## Repository layout

```
client/            React app (Vite, JavaScript)
  src/lib/         api.js (mock + real client), validation, formatting, config
  src/data/        seed data for the mock API
  src/components/  shared UI components
  src/pages/       one file per screen, admin screens in pages/admin/
  src/layouts/     public/student top bar, admin sidebar
docs/              prd.md, design.md, blueprint.md, team plan
design/            HTML mockups and the design PDF
```

## Documentation

- `docs/prd.md` — problem, users, functional and non-functional requirements
- `docs/design.md` — brand, sitemap, wireframes, UX rules
- `docs/blueprint.md` — decisions log and phase tracker
- `docs/team-plan.pdf` — the three-person work plan

## Known limitations

- Accounts are checked by matric-number format and email domain, not by mailbox verification.
- Claims are reviewed by a staff member; ownership is not proven automatically.
- No pagination, so very long lists would be slow.
- A rejected claim blocks that student from claiming the same item again, with no override screen.
- No public deployment: this is a local demonstration.
