# Team Plan — Campus Lost & Found

Work breakdown for three people (Person A, B, C) across frontend, backend and
database. Person A and B also cover the database, which has two workstreams.

> **Assumption:** the same three people work frontend first, then backend. If the
> tracks use different people, only the per-track balance tables matter.

---

## 1. The rules that make parallel work possible

1. **One owner per file.** Every file in this plan has exactly one owner. If you
   need a change in a file you do not own, you ask the owner. You never edit it.
2. **Contracts are frozen before parallel work starts.** Sprint 0 of each track
   exists only to freeze interfaces (sections 5, 6, 7).
3. **Slices are vertical.** Person B owns the landing page end to end — markup,
   styles, state, data calls. Not "the components layer".
4. **Shared files change only through the owner.** `routes.jsx` and `app.js` are
   the two files everyone would otherwise edit. One owner each.
5. **A contract change is a document change first.** Edit the contract table, tell
   the team, then write the code. Never the other way round.
6. **Balance is measured in effort, not in screens.** A 1-point screen is a copy
   with different labels; a 3-point screen has a state machine in it.

---

## 2. Workload summary

### Frontend — 39.5 points, target 13 each

| Person | Scope | Points |
|---|---|---|
| A | App shell, routing, layouts, accounts, admin management | 12.5 |
| B | UI display kit, discovery, item reporting | 13.5 |
| C | Form/feedback kit, student activity, claims | 13.5 |

### Backend — 25 points, target 8.5 each

| Person | Scope | Points |
|---|---|---|
| A | Server foundation, security middleware, auth, users | 8.5 |
| B | Items, categories, uploads, search, admin items | 8.0 |
| C | Claims (student + admin), status transitions, contact release | 8.5 |

### Database — 7 points, target 3.5 each

| Person | Scope | Points |
|---|---|---|
| A | users, categories, items, indexes, reference seed, ERD | 3.5 |
| B | claims, all claim constraints, demo seed, constraint tests | 3.5 |

### Per-person totals

| Person | Frontend | Backend | Database | Total |
|---|---|---|---|---|
| A | 12.5 | 8.5 | 3.5 | 24.5 |
| B | 13.5 | 8.0 | 3.5 | 25.0 |
| C | 13.5 | 8.5 | — | 22.0 |

Person C carries less because C owns the end-to-end claim-flow test in Phase 6 and
acts as the demonstration driver. If C finishes early, C takes the mobile
breakpoint pass across all screens.

---

## 3. Frontend track

### 3.1 Sprint 0 — foundation, all three together (do not skip)

Nothing parallel can start until these exist. Roughly one working session.

| Owner | Deliverable | Files |
|---|---|---|
| A | Vite + React + Tailwind + Router scaffold, design tokens | `vite.config.js`, `src/index.css`, `src/main.jsx`, `src/App.jsx` |
| A | Route table and both layouts | `src/routes.jsx`, `src/components/layout/*` |
| A | API client with mock switch, formatters, constants | `src/lib/api.js`, `src/lib/format.js`, `src/lib/constants.js` |
| A | Mock data for users, items, claims, categories | `src/mocks/*` |
| B | Display kit: Card, Badge, StatusBadge, ItemCard, Skeleton, EmptyState, PhotoUploader | `src/components/ui/*` (owned list) |
| C | Control kit: Button, Input, Select, Textarea, Checkbox, Spinner, Toast, ConfirmDialog | `src/components/ui/*` (owned list) |
| C | Validation rules shared by every form | `src/lib/validation.js` |
| B | Search hooks used by both list pages | `src/lib/useFilters.js`, `src/lib/useDebounce.js` |

**Exit condition for Sprint 0:** a page that renders every kit component in every
state, and one page that fetches mock items through `lib/api.js`. Until both work,
nobody starts a screen.

### 3.2 Parallel slices

| Person A | Points | Person B | Points | Person C | Points |
|---|---|---|---|---|---|
| Register `/register` | 2 | Landing `/` | 3 | Student Dashboard `/dashboard` | 2 |
| Login `/login` | 1 | Lost `/lost` | 2 | My Reports `/my-reports` | 2 |
| Profile `/profile` | 2 | Found `/found` (shared with Lost, labels swapped) | 1 | My Claims `/my-claims` | 2 |
| Admin Dashboard `/admin` | 2 | Item Detail `/items/:id` | 3 | Submit Claim `/items/:id/claim` | 3 |
| Manage Items `/admin/items` | 2 | Report Item `/report` | 3 | Claim Review `/admin/claims/:id` | 3 |
| Not Found `*` | 0.5 | | | | |
| Sprint 0 foundation | 3 | Sprint 0 kit | 1.5 | Sprint 0 kit | 1.5 |
| **Total** | **12.5** | **Total** | **13.5** | **Total** | **13.5** |

### 3.3 Frontend file ownership

```
client/src/
  App.jsx  main.jsx  routes.jsx  index.css        → A   (integrator, shared files)
  components/layout/**                            → A
  components/ui/Card.jsx  Badge.jsx  StatusBadge.jsx
  components/ui/ItemCard.jsx  Skeleton.jsx
  components/ui/EmptyState.jsx  PhotoUploader.jsx → B
  components/ui/Button.jsx  Input.jsx  Select.jsx
  components/ui/Textarea.jsx  Checkbox.jsx  Spinner.jsx
  components/ui/Toast.jsx  ConfirmDialog.jsx      → C
  lib/api.js  format.js  constants.js             → A
  lib/validation.js                               → C
  lib/useFilters.js  useDebounce.js               → B
  mocks/**                                        → A
  pages/auth/**                                   → A
  pages/admin/Dashboard.jsx  Items.jsx            → A
  pages/NotFound.jsx                              → A
  pages/Home.jsx                                  → B
  pages/items/**                                  → B
  pages/student/**                                → C
  pages/claims/**                                 → C
```

Person A is the frontend integrator because A owns the shared files. A merges the
other branches and is the only person who edits `routes.jsx`.

---

## 4. Backend track

### 4.1 Sprint 0 — foundation (Person A, while others read the contract)

| Owner | Deliverable | Files |
|---|---|---|
| A | Express app, server bootstrap, env config | `src/app.js`, `src/server.js`, `src/config/env.js` |
| A | PostgreSQL pool | `src/db/pool.js` |
| A | Central error handler and response helpers | `src/middleware/error.js`, `src/utils/response.js` |
| A | `.env.example`, npm scripts | `.env.example`, `package.json` |

**Exit condition:** `GET /api/health` returns `{ "ok": true }` and a deliberately
broken route returns the standard error shape. B and C start after that.

### 4.2 Parallel slices

| Person A | Points | Person B | Points | Person C | Points |
|---|---|---|---|---|---|
| Foundation (above) | 2.5 | Items CRUD | 3 | Claims: create, my claims | 2 |
| Auth middleware: `requireAuth`, `requireAdmin` | 1.5 | Search and filter query builder | 1.5 | Admin claim queue and detail | 2 |
| Auth routes: register, login, me | 3 | Multer upload + file validation | 1 | Approve / reject, status transitions, contact release | 2.5 |
| Users: update profile, change password | 1.5 | Categories | 0.5 | Claim block rules and validation | 1 |
| | | Admin items, archive, stats | 2 | End-to-end claim flow test | 1 |
| **Total** | **8.5** | **Total** | **8** | **Total** | **8.5** |

### 4.3 Backend file ownership

```
server/src/
  app.js  server.js  config/**  db/**             → A
  middleware/error.js  utils/response.js          → A
  middleware/auth.js                              → A
  modules/auth/**  modules/users/**               → A
  modules/items/**  modules/categories/**         → B
  middleware/upload.js                            → B
  modules/claims/**                               → C
  modules/admin/items.js  admin/stats.js          → C
server/uploads/                                   → git-ignored
```

### 4.4 Two cross-module rules that prevent real bugs

- **Only the claims service may change `items.status`.** Person B's item module
  never sets a status to `CLAIM_PENDING` or `RETURNED`; it may only set `ARCHIVED`.
  Otherwise two modules fight over one column.
- **Approving a claim is one transaction.** Updating the claim and the item in two
  separate statements leaves the database inconsistent if the second fails. Person C
  owns that transaction.

---

## 5. Database track

Two workstreams, one shared schema. Numbered files prevent the two people from
editing the same file.

| Person A | Points | Person B | Points |
|---|---|---|---|
| `01_users_categories_items.sql` — three tables, keys, checks | 1.5 | `02_claims.sql` — claims table, keys, checks | 1 |
| Item indexes for search and filter columns | 0.5 | Claim constraints: one pending claim per item, one claim per student per item | 1 |
| `03_seed_reference.sql` — the eight categories | 0.5 | `04_seed_demo.sql` — demo users, items, claims across every state | 0.5 |
| `database/README.md` — how to create, reset, seed | 0.5 | `05_verify_constraints.sql` — proves each constraint rejects bad data | 0.5 |
| ERD diagram and explanation | 0.5 | | |
| **Total** | **3.5** | **Total** | **3.5** |

**The two constraints that carry the design** (Person B owns both):

```sql
-- One claim per student per item, forever (FR-34)
CREATE UNIQUE INDEX claims_one_per_student_per_item
  ON claims (item_id, claimant_id);

-- Only one claim may be pending on an item at a time (FR-20)
CREATE UNIQUE INDEX claims_one_pending_per_item
  ON claims (item_id) WHERE status = 'PENDING';
```

A partial unique index is the correct tool here: it enforces the rule in the
database, so no application bug can break it. This is the kind of detail worth
explaining in Chapter Three.

---

## 6. Frozen contract 1 — the REST API

Authoritative for both backend and frontend. All paths prefixed `/api`.
All requests and responses are JSON except item creation (multipart).

| Method | Path | Auth | Purpose | Success |
|---|---|---|---|---|
| GET | `/health` | none | Liveness | 200 `{ok:true}` |
| POST | `/auth/register` | none | Create student account | 201 `{user, token}` |
| POST | `/auth/login` | none | Log in | 200 `{user, token}` |
| GET | `/auth/me` | student | Current user | 200 `{user}` |
| PATCH | `/users/me` | student | Update name, department, phone | 200 `{user}` |
| PATCH | `/users/me/password` | student | Change password | 204 |
| GET | `/categories` | none | The eight categories | 200 `[{id,name,slug}]` |
| GET | `/items` | none | List, search, filter | 200 `{items, total}` |
| GET | `/items/:id` | none | Detail with viewer flags | 200 `{item, is_owner, my_claim, can_claim}` |
| POST | `/items` | student | Create item, multipart photo | 201 `{item}` |
| PATCH | `/items/:id` | owner | Edit while `OPEN` and unclaimed | 200 `{item}` |
| DELETE | `/items/:id` | owner | Delete while `OPEN` and unclaimed | 204 |
| POST | `/items/:id/claims` | student | Submit claim | 201 `{claim}` |
| GET | `/claims/mine` | student | My claims | 200 `[{claim, item, contact?}]` |
| GET | `/admin/claims` | admin | Queue, `?status=` | 200 `[{claim, item, claimant}]` |
| GET | `/admin/claims/:id` | admin | Review detail | 200 `{claim, item, claimant, claim_count}` |
| PATCH | `/admin/claims/:id` | admin | `{action:"approve"\|"reject", reason?}` | 200 `{claim}` |
| GET | `/admin/items` | admin | All items, `?include_archived=` | 200 `{items, total}` |
| PATCH | `/admin/items/:id` | admin | `{archived:true\|false}` | 200 `{item}` |
| GET | `/admin/stats` | admin | Dashboard counters | 200 `{open_items, pending_claims, returned}` |

**Item query parameters:** `type`, `q`, `category_id`, `location`, `date_from`,
`date_to`, `status`, `include_archived` (admin only).

**Every error, without exception:**

```json
{ "error": { "code": "CLAIM_ALREADY_EXISTS", "message": "You have already claimed this item.", "fields": { "proof": "..." } } }
```

| Status | Meaning in this project |
|---|---|
| 400 | Validation failed |
| 401 | Missing, invalid or expired token |
| 403 | Logged in but not allowed (student hitting an admin route) |
| 404 | Not found, or an archived item viewed publicly |
| 409 | Rule conflict (claim already exists, item already claimed) |
| 500 | Unexpected server error |

**Contact release rule:** `contact` appears in a claim response **only** when that
claim's status is `APPROVED` and the requester is a party to it. Never on a public
endpoint.

---

## 7. Frozen contract 2 — the UI kit

Person B and C build these in Sprint 0. After that, the props are frozen.

| Component | Owner | Props |
|---|---|---|
| `Button` | C | `variant` primary/secondary/ghost/danger, `size` sm/md/lg, `loading`, `disabled` |
| `Input` | C | `label`, `hint`, `error`, `required`, native input props |
| `Select` | C | `label`, `options[{value,label}]`, `error`, `required` |
| `Textarea` | C | `label`, `hint`, `error`, `maxLength`, `showCount` |
| `Checkbox` | C | `label`, `hint`, `error` |
| `Spinner` | C | `size` |
| `Toast` + `useToast()` | C | `toast.success(msg)`, `toast.error(msg)` |
| `ConfirmDialog` | C | `open`, `title`, `description`, `confirmLabel`, `tone`, `onConfirm`, `onCancel` |
| `Card` | B | `padded`, children |
| `Badge` | B | `tone`, children |
| `StatusBadge` | B | `status` — the single source of truth for status wording and colour |
| `ItemCard` | B | `item`, `showStatus` |
| `Skeleton` | B | `variant` card/row/text, `count` |
| `EmptyState` | B | `title`, `description`, `action` |
| `PhotoUploader` | B | `value`, `onChange`, `maxSizeMB` |

**Rule:** `StatusBadge` is the only place item status becomes text and colour. If a
screen hardcodes "RETURNED" and a green pill, it is a bug.

---

## 8. Frozen contract 3 — mock data shapes

Person A writes `src/mocks/` so B and C can build screens with no backend. Shapes
must match the REST contract exactly, or the swap in Sprint 2 breaks.

```js
item     = { id, type: 'lost'|'found', title, category_id, category_name,
             description, occurred_on, location, photo_url,
             status: 'OPEN'|'CLAIM_PENDING'|'RETURNED'|'ARCHIVED',
             reporter: { id, full_name }, created_at }

claim    = { id, item_id, status: 'PENDING'|'APPROVED'|'REJECTED',
             proof, serial_reference, rejection_reason, created_at,
             item: { ...item }, claimant: { ...user }, contact?: { full_name, phone, email } }

user     = { id, full_name, matric_no, department, email, phone, role: 'student'|'admin' }
```

Seed the mocks to cover every state in the design: an `OPEN` item, a
`CLAIM_PENDING` item, a `RETURNED` item with an approved claim, and a `REJECTED`
claim with a reason. Screens must be built against all four, not just the happy one.

---

## 9. Integration plan

### 9.1 Order

```
Sprint 0   Database schema frozen  +  Frontend foundation  +  Backend foundation
Sprint 1   Three parallel slices per track (frontend on mocks)
Sprint 2   Merge database  →  backend against real database  →  swap mocks for API
Sprint 3   End-to-end test of the full journey (Phase 6)
```

The database must be frozen before backend coding starts. If backend people write
SQL against a schema that is still moving, they will rewrite their queries twice.

### 9.2 Git workflow

```
main                          integration only, always working
  db/a  db/b                  database workstreams
  be/a  be/b  be/c            backend slices
  fe/a  fe/b  fe/c            frontend slices
```

1. `git init` once, then everyone clones.
2. Each person works only on their own branch and only in their own files.
3. Merge order: `db/*` → `be/*` → `fe/*`.
4. The foundation owner of each track merges that track's branches.
5. Never merge your own branch into `main`. Someone else merges it — this is the
   cheapest possible code review.

### 9.3 The integration checklist

Run this at every merge. It catches almost everything.

| # | Check |
|---|---|
| 1 | `npm run dev` starts with no console errors on both client and server |
| 2 | The person merging reads the diff and confirms no file outside the owner's list changed |
| 3 | Every new endpoint answers with the exact status code and JSON shape from section 6 |
| 4 | Every new screen renders in all four states: loading, empty, error, populated |
| 5 | Each screen checked at 390px, 768px and 1440px |
| 6 | A student token is rejected with 403 on every `/admin` route |
| 7 | The claim flow runs end to end with mocks off |

### 9.4 Definition of done — per slice

**Frontend:** matches `design/mockups.html` · all four states implemented · mobile
checked · keyboard reachable with visible focus · no console errors · runs on mocks
alone · reviewed by one other person.

**Backend:** matches section 6 exactly · input validated · errors use the standard
shape · checked with no token, a student token and an admin token · SQL fully
parameterised · evidence captured (Postman screenshots go straight into Chapter Four).

**Database:** runs from empty on a fresh machine · `05_verify_constraints.sql`
proves each constraint rejects bad data · ERD matches the actual tables.

---

## 10. Risks and mitigations

| Risk | Why it bites | Mitigation |
|---|---|---|
| Schema changes mid-build | Backend queries get rewritten | Freeze the schema in Sprint 0; only DB owners edit SQL |
| Interface drift | Frontend calls fields the API does not send | Sections 6–8 are authoritative; change the document first |
| Merge conflicts in shared files | Wasted hours and lost work | One owner per file; `routes.jsx` and `app.js` each have a single owner |
| Three different visual styles | Looks assembled, not designed | The UI kit is frozen in Sprint 0; no new components without the owner |
| Uneven effort | Two people idle while one drowns | Point tables; rebalance at the sprint boundary, not mid-sprint |
| "Works on my machine" | Integration day discovers missing setup | Shared `.env.example`; everyone runs the full app before submitting |
| Frontend blocked by backend | Frontend sits idle for days | Mocks first; never wait for an endpoint |
| Coordination overhead exceeds the gain | Three people are slower than two | Sprint 0 and the contracts are the whole mitigation — do not skip them |

**Honest note:** three people on fifteen screens costs more coordination than it
saves. The plan above is what keeps that cost from turning into rework. If your
course allows it, two people on the frontend would finish faster.
