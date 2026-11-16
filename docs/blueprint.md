# Project Blueprint — Campus Lost and Found Portal

> Single source of truth for this project. Updated at the end of every phase.
> **Status: Phase 1 complete and approved. Phase 2 not started.**

## 1. Project Overview

**Project:** Campus Lost and Found Portal
**Course:** IFT305
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
IFT305project/
├── client/          React + Vite frontend
├── server/          Express backend
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
| PostgreSQL | — | NOT installed — required from Phase 5 |

## 6. Decisions Log

| # | Decision | Reason |
|---|---|---|
| D1 | Build in `IFT305project`; leave `project-starter` untouched | Clean slate; original pack preserved |
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

_Not yet defined. Phase 4._

## 12. Database Schema

_Not yet defined. Phase 5._

## 13. Phase Status

| Phase | Name | Status |
|---|---|---|
| 0 | Existing project inspection | COMPLETE |
| 1 | Planning and requirements | COMPLETE — approved |
| 2 | UI/UX design | COMPLETE — approved |
| 3 | Frontend development | Not started |
| 4 | Backend development | Not started |
| 5 | Database design and implementation | Not started |
| 6 | Integration, testing, debugging | Not started |
| 7 | Documentation | Not started |

## 14. Documents

| File | Purpose |
|---|---|
| `docs/blueprint.md` | This file — decisions, status, architecture |
| `docs/prd.md` | Approved requirements, roles, journeys, success criteria |
| `docs/design.md` | Brand identity, sitemap, navigation, wireframes, UX rules |
