# Project Blueprint — Campus Lost and Found Portal

> Single source of truth for this project. Updated at the end of every phase.
> **Status: Phases 0-5 complete. Frontend on mock API; integration (Phase 6) next.**

## 1. Project Overview

**Project:** Campus Lost and Found Portal
**Course:** IFT301
**Type:** PERN stack web application, functional academic prototype designed to be deployable
**Delivery mode:** demonstrated locally at `localhost`

Students report lost belongings, report found items, search for them, and recover
property through an admin-reviewed ownership claim.

## 2. Technology Stack (fixed)

| Layer | Technology | Job |
|---|---|---|
| Frontend | React (Vite) | Build the user interface |
| Styling | Tailwind CSS | Styling the interface |
| Routing | React Router | Page navigation without reloads |
| HTTP | Axios | Talk to the backend |
| Backend | Node.js + Express.js | Run the server, expose REST APIs |
| Auth | bcrypt + JWT | Hash passwords, authenticate users |
| Uploads | Multer | Receive image files |
| Database | PostgreSQL | Store all application data |
| DB driver | node-postgres (`pg`) | Connect Express to PostgreSQL |

## 3. Architecture

```
React (browser)  --HTTP/JSON-->  Express API  --SQL-->  PostgreSQL
                   <--JSON--
```

- React never talks to the database directly.
- Express is the only layer that knows SQL.
- PostgreSQL enforces data integrity; it holds no business logic.

## 4. Repository Layout

```
IFT301project/
├── frontend/          React + Vite frontend
├── backend/          Express backend
├── database/        SQL schema, seed, queries
└── docs/            blueprint.md, prd.md, ERD, diagrams
```

## 5. Environment

| Tool | Version | Status |
|---|---|---|
| Node.js | v26.4.0 | installed |
| npm | 11.17.0 | installed |
| git | 2.50.1 | installed |
| Homebrew | `/opt/homebrew` | installed |
| PostgreSQL | 16 | installed |

## 6. Decisions Log

| # | Decision | Reason |
|---|---|---|
| D1 | Build in `IFT301project`; leave `project-starter` untouched | Clean slate; original pack preserved |
| D2 | Do not adopt the `AGENTS.md` / 4-agent `RUNTIME.md` machinery | Unnecessary complexity for a mini project |
| D3 | One `docs/blueprint.md` plus `docs/prd.md` instead of a three-file management scaffold | Easy to maintain and defend |
| D4 | Two roles only: student and admin. No custodian role | Admin acts as the lost-and-found desk |
| D5 | Registration restricted by matric format and campus email domain (no email sending) | Cheap accountability; known limitation recorded |
| D6 | One seeded admin account, inserted by the seed file | No admin registration screen needed |
| D7 | Finder holds found items; `held_by` is the reporting student | Matches how campus recovery works |
| D8 | Ownership claim is the centrepiece feature | Only problem WhatsApp cannot solve |
| D9 | One photo per item, single `photo_path` column | Avoids a second table for no benefit |
| D10 | Fixed seeded category list | Clean filters; no spelling variants |
| D11 | One pending claim per item; item becomes `CLAIM_PENDING` | Makes admin review meaningful |
| D12 | Claim requires written proof (min 30 chars) + optional serial | Gives the centrepiece feature substance |
| D13 | Finder contact revealed only after approval | Closes the handover gap with a defensible privacy rule |
| D14 | Admin archives items rather than deleting | Preserves claim history |
| D15 | Reports lock after the first claim | Prevents tampering mid-review |
| D16 | Demo locally only | Removes deployment risk during defence |
| D17 | Matric number and campus email are read-only after registration | Prevents defeating the domain check (PRD v1.1) |
| D18 | One claim per student per item, permanently, enforced by a unique constraint | Prevents claim spam after a rejection (PRD v1.1) |
| D19 | The rejected-claim block has no UI to clear it | Avoids building an admin override; recorded as a limitation |

## 7. Approved Requirements

Full detail: [`prd.md`](./prd.md). Summary:

- **7 objectives** (O1–O7); notifications, admin user management, chat, email/SMS,
  expiry, mapping and deployment are explicitly out of scope.
- **33 functional requirements** (FR-01 to FR-33).
- **9 non-functional requirements** (NFR-01 to NFR-09).
- Success = an end-to-end journey: report found item → owner searches → owner claims
  with proof → admin approves → both parties see each other's contact details →
  item marked returned.

## 8. User Roles

| Role | Description |
|---|---|
| Guest | Browsing and search only. |
| Student | Registered user. Reports items, claims, manages own reports and claims. |
| Admin | One seeded account. Reviews claims, archives items. Never claims. |

Permission matrix: `prd.md` §4.1.

## 9. Status Lifecycles

```
ITEM
  OPEN --(claim submitted)--> CLAIM_PENDING
                                 |--(approved)--> RETURNED
                                 `--(rejected)--> OPEN
  any active state --(admin)--> ARCHIVED

CLAIM
  PENDING --(approved)--> APPROVED   (contacts revealed to both parties)
          `--(rejected)--> REJECTED   (written reason, mandatory)
```

## 10. Pages and Screens

Approved in Phase 2. Full detail: [`design.md`](./design.md).

| Route | Page |
|---|---|
| `/` | Landing |
| `/lost` | Lost Items list |
| `/found` | Found Items list |
| `/items/:id` | Item Detail |
| `/items/:id/claim` | Submit Claim |
| `/login` | Login |
| `/register` | Register |
| `/dashboard` | Student Dashboard |
| `/report` | Report Item (Lost/Found switch) |
| `/my-reports` | My Reports |
| `/my-claims` | My Claims |
| `/profile` | Profile |
| `/admin` | Admin Dashboard |
| `/admin/claims/:id` | Claim Review |
| `/admin/items` | Manage Items |
| `*` | Not Found |

Design system: Campus Lost & Found wordmark, Inter, primary `#1E40AF`, verified
AA contrast throughout. Navigation: top bar for public and student pages, sidebar
for admin.

## 11. API Specification

All routes under `/api`, JSON, JWT in `Authorization: Bearer`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | /auth/register | Guest | Validate matric + campus email, hash password, return JWT |
| POST | /auth/login | Guest | Return JWT and user |
| GET | /auth/me | Auth | Current user |
| PATCH | /users/me | Student | Update name, phone, password (matric/email read-only, D17) |
| GET | /categories | Public | Category list |
| GET | /items | Public | List items; query: type, category, q, status; hides ARCHIVED |
| GET | /items/:id | Public | Detail; contacts only after approval (D13) |
| POST | /items | Student | Report item (multipart `photo`) |
| GET | /items/mine | Student | My reports |
| PATCH | /items/:id | Owner | Edit; 409 once a claim exists (D15) |
| POST | /items/:id/claims | Student | Submit claim {proof_text, serial_number?} |
| GET | /claims/mine | Student | My claims |
| GET | /claims/:id | Claimant/Admin | Claim detail; finder contact if APPROVED |
| GET | /admin/claims | Admin | Review queue; query: status |
| PATCH | /admin/claims/:id/approve | Admin | Claim APPROVED, item RETURNED |
| PATCH | /admin/claims/:id/reject | Admin | {reason} required; claim REJECTED, item OPEN |
| GET | /admin/items | Admin | All items incl. archived |
| PATCH | /admin/items/:id/archive | Admin | Set ARCHIVED (D14) |

Errors: `{ "error": "message" }` with 400, 401, 403, 404 or 409.
Claim submit, approve and reject run in transactions.

## 12. Database Schema

Implemented in `database/schema.sql`, seeded by `database/seed.sql`.

Tables: `users`, `categories`, `items`, `claims`.
- `claims` has UNIQUE (item_id, claimant_id) for D18, a partial unique index
  allowing one PENDING claim per item for D11, and a CHECK requiring a
  rejection reason when status is REJECTED.
- `items.held_by` is set only for FOUND items (D7).
- Seed: 8 categories and one admin account (admin@campus.edu.ng).

## 13. Phase Status

| Phase | Name | Status |
|---|---|---|
| 0 | Existing project inspection | COMPLETE |
| 1 | Planning and requirements | COMPLETE — approved |
| 2 | UI/UX design | COMPLETE — approved |
| 3 | Frontend development | COMPLETE (mock API) |
| 4 | Backend development | COMPLETE |
| 5 | Database design and implementation | COMPLETE |
| 6 | Integration, testing, debugging | Next |
| 7 | Documentation | Not started |

## 14. Documents

| File | Purpose |
|---|---|
| `docs/blueprint.md` | This file — decisions, status, architecture |
| `docs/prd.md` | Approved requirements, roles, journeys, success criteria |
| `docs/design.md` | Brand identity, sitemap, navigation, wireframes, UX rules |

## 15. Known Limitations (final)
1. No email or SMS: finder and claimant contact details are shown in the app only after approval.
2. No pagination: lists load every item (fine for a campus demo, not for large data).
3. Registration is restricted by matric format and campus email domain only; the email address is not verified (D5).
4. Matric number and email cannot be changed after registration.
5. A rejected claim is permanent: that student cannot claim the same item again and there is no admin override (D19).
6. Reports lock after the first claim; there is no delete-report (admins archive instead) and no unarchive.
7. The Edit button can appear on a report that already had a claim; the server refuses with 409.
8. No change-password screen backend; passwords are changed only via the database.
9. Photos are stored on the server's local disk (max 5 MB, images only); no cloud storage.
10. JWT lasts 7 days with no refresh or revocation.
11. No automated tests; verification was manual end-to-end (register, report, claim, approve, reject).
12. Local demonstration only: no HTTPS, rate limiting, or production hardening.

## 16. Phase Status Update
- Phase 6 (integration, testing, debugging): frontend switched from mock to real API through an adapter in `frontend/src/lib/api.js`; wrap/overflow CSS fixes; DATE timezone fix in `backend/db.js`.
- Phase 7 (documentation): README, `.env.example`, limitations (this section).
