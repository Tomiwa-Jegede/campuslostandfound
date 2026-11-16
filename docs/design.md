# Design Document — Campus Lost & Found

> Phase 2 artefact. Turns the approved PRD into a visual and structural design.
> **Status: brand identity approved. Sitemap and wireframes in progress.**

## 1. Brand identity

### 1.1 Name

**Campus Lost & Found** (wordmark). The formal report title remains
"Campus Lost and Found Portal".

### 1.2 Direction

Calm, institutional, legible — closer to a university service than a startup app.
The product's claim is *verified ownership*, so the interface must look like
something an official would trust with a student's property, while remaining
usable by an 18-year-old on a phone.

Rejected directions: playful/vibrant consumer styling (undermines credibility),
serif "parchment and mahogany" typography (readability and tone mismatch),
gradient-heavy AI aesthetics, decorative animation.

### 1.3 Colour tokens

All text-bearing pairs verified against WCAG 2.1 AA (minimum 4.5:1).

| Token | Hex | Use | Contrast on white |
|---|---|---|---|
| `--primary` | `#1E40AF` | Buttons, links, active nav | 8.72:1 |
| `--primary-strong` | `#1E3A8A` | Headings, hover | 10.36:1 |
| `--found` | `#15803D` | Found badges, success | 5.02:1 |
| `--lost` | `#B45309` | Lost badges, warnings | 5.02:1 |
| `--muted-text` | `#475569` | Secondary text, dates | 7.58:1 |
| `--background` | `#EFF6FF` | Page tint | — |
| `--card` | `#FFFFFF` | Cards, forms, tables | — |
| `--border` | `#BFDBFE` | Dividers, input borders | — |
| `--danger` | `#DC2626` | Errors, destructive actions | — |

The lighter 500-level shades (e.g. `#16A34A`) are **not** used for text because
they fall below 4.5:1. Only the 700/800 shades carry words.

### 1.4 Semantic status colours

One colour per state, identical on every page. Never mixed or reused for another
meaning.

| Status | Colour | Reason |
|---|---|---|
| `OPEN` lost item | Amber `#B45309` | Attention without implying error |
| `OPEN` found item | Green `#15803D` | Someone has it |
| `CLAIM_PENDING` | Blue `#1E40AF` | Neutral, in process |
| `RETURNED` | Slate `#475569` | Finished |
| `ARCHIVED` | Light grey | Removed, low emphasis |

A user can distinguish a lost from a found item before reading any text.

### 1.5 Typography

Single family: **Inter** (variable, weights 400–700). One download, one decision.

| Role | Size | Line height | Weight |
|---|---|---|---|
| Page title | 30px | 1.2 | 700 |
| Section heading | 20px | 1.3 | 600 |
| Body | 16px | 1.6 | 400 |
| Label | 14px | 1.4 | 500 |
| Caption / meta | 13px | 1.4 | 400 |

Nothing below 13px. Hierarchy comes from weight and size, not from extra families.

### 1.6 Logo

Inline SVG glyph — a tag combined with a magnifier, stroke `--primary` — placed
beside the wordmark set in Inter 700. Hand-written SVG (no image file), so it
cannot be lost and scales cleanly in screenshots.

No emoji is used as an icon anywhere in the interface.

## 2. Sitemap

### 2.1 Structure

```
Public
  /                     Landing
  /lost                 Lost Items list
  /found                Found Items list
  /items/:id            Item Detail
  /login                Login
  /register             Register

Student (login required)
  /dashboard            Overview: open reports, claim statuses
  /report               Report an item (Lost/Found switch)
  /my-reports           My Reports (edit, delete while OPEN)
  /my-claims            My Claims (status and rejection reason)
  /items/:id/claim      Submit Ownership Claim
  /profile              Profile

Admin (admin role required)
  /admin                Dashboard: counters and pending claims
  /admin/claims/:id     Claim Review
  /admin/items          Manage Items (archive)

System
  *                     Not Found
```

### 2.2 Requirements mapping

| Page | Route | Requirements |
|---|---|---|
| Landing | `/` | Entry point, search, both primary actions |
| Lost Items | `/lost` | FR-11, FR-12, FR-13 |
| Found Items | `/found` | FR-11, FR-12, FR-13 |
| Item Detail | `/items/:id` | FR-14, FR-17 |
| Login | `/login` | FR-04 |
| Register | `/register` | FR-01, FR-02, FR-07 |
| Student Dashboard | `/dashboard` | Personal summary: open reports, claim status |
| Report Item | `/report` | FR-08, FR-09, FR-10 |
| My Reports | `/my-reports` | FR-15, FR-16 |
| My Claims | `/my-claims` | FR-21 |
| Submit Claim | `/items/:id/claim` | FR-18, FR-19, FR-20, FR-22 |
| Profile | `/profile` | FR-06 |
| Admin Dashboard | `/admin` | FR-24 |
| Claim Review | `/admin/claims/:id` | FR-25, FR-26, FR-27 |
| Manage Items | `/admin/items` | FR-28, FR-29 |
| Not Found | `*` | Handles bad URLs |

### 2.3 Structural decisions

- Lost and Found are separate routes, not one page with a toggle: users think in
  "I lost something" / "I found something", and a found report is shareable by link.
- One report form with a Lost/Found switch rather than two near-identical forms.
- Dashboard shows a summary; full lists live on `/my-reports` and `/my-claims`.
- Claim writing is a separate page, not a modal: long proof text needs room and
  works better on a phone.
- Claim review is a dedicated page so item photo, description, claimant and proof
  can be compared side by side.

## 3. Navigation

### 3.1 Public and student layout (top bar)

| Element | Behaviour |
|---|---|
| Logo + wordmark | Always links to `/` |
| Lost / Found | Links to `/lost` and `/found`; active page shown with a 2px primary underline |
| Report an item | Primary button, pre-selects the Lost/Found switch via query parameter |
| Account (guest) | "Log in" text link and "Sign up" button |
| Account (student) | Menu: Dashboard, My Reports, My Claims, Profile, Log out |
| Account (admin) | Same menu plus "Admin" entry |

On screens below 768px the links collapse into a full-width menu panel opened by a
menu button. Menu items are at least 44px tall.

### 3.2 Admin layout (sidebar)

| Element | Behaviour |
|---|---|
| Left sidebar | Dashboard, Claims, Items; current page marked with a left border and tinted background |
| Top bar | Wordmark, "View site" link back to public pages, account menu |
| Below 768px | Sidebar becomes a horizontal scrollable tab row under the top bar |

The admin entry point is only rendered for admin accounts. Hiding it is not the
security control — the API rejects non-admin tokens with 403 regardless.

### 3.3 Orientation aids

- Detail and review pages show a back link to the list they came from.
- Every page title is a real `<h1>`.
- Destructive actions (delete report, archive item) require a confirmation step.

## 4. Wireframes

### Batch 1 — approved

**Landing `/`** — top bar, headline, search (above the buttons), two primary actions,
three-step "how it works", four recent found items, footer. Mobile stacks; cards
scroll horizontally.

**Register `/register`** — narrow single column (max 480px). Fields: full name,
matric number (helper: format), department, campus email (helper: domain), phone
(helper: "shown only after a claim is approved"), password, confirm password.
Errors sit under the offending field, never only at the top.

**Login `/login`** — email, password, submit, link to register. Invalid credentials
return one generic message ("Email or password is incorrect") so registered emails
cannot be enumerated.

**Lost `/lost` and Found `/found`** — heading with open count and a report button,
search input, category select, Filters button, active filter chips with "Clear all",
grid of photo-first cards (4:3 photo, status badge, title, category, location).
No pagination in the prototype.

States required for every list:

| State | Content |
|---|---|
| Loading | 3–6 skeleton cards of identical size, no layout shift |
| Empty, no data | Explanation plus a button to report an item |
| Empty, filters too narrow | "No items match these filters." plus "Clear all" |

Approved list decisions: search above the buttons; filters open in a slide-up drawer
with an active-filter count on phones; photo-first cards; no pagination (recorded as
a limitation).

### Batch 2 — approved

**Item Detail `/items/:id`** — two columns on desktop (photo left, facts right),
description and action area full width below; single column on mobile. Action area
is state-driven:

| Viewer and state | Action area |
|---|---|
| Guest | "Log in to claim this item" |
| Owner, `OPEN` | Edit · Delete |
| Owner, `CLAIM_PENDING` | "A claim is under review" |
| Other student, `OPEN` | Claim button |
| Other student, `CLAIM_PENDING` | Disabled: "A claim is under review" |
| The claimant | "Your claim is pending review" |
| `RETURNED`, approved claimant | Contact block |
| `RETURNED`, anyone else | "This item has been returned" |

Reporter phone and email never appear on this page, because browsing is public.

**Submit Claim `/items/:id/claim`** — item summary card stays visible beside the
form. Proof textarea (6 rows, 30–1000 characters with counter), optional serial
reference, "I confirm this is my property" checkbox, submit and cancel, and a
"What happens next" panel explaining admin review and contact release.

**Report Item `/report`** — segmented Lost/Found switch at the top; fields: title,
category, description, date, location, photo. The switch changes four strings only:

| Element | Lost | Found |
|---|---|---|
| Date label | Date lost | Date found |
| Location label | Where did you last see it? | Where did you find it? |
| Location placeholder | Library, 2nd floor | Cafeteria table |
| Submit button | Publish lost report | Publish found report |

A warning sits under the description field: do not describe features you would use
to prove ownership, because anyone browsing can read them.

**Student Dashboard `/dashboard`** — "Needs your attention" banner first (claim
decisions appear here because notifications are out of scope), then three counters,
then recent reports and recent claims, then two quick-action buttons.

### Batch 3 — approved

**My Reports `/my-reports`** — filter chips (All, Lost, Found, Open, Returned), then
dense rows on desktop (thumbnail, title, type badge, status badge, claim count, date,
actions) collapsing to cards on mobile. Once a claim exists, Edit and Delete become
a disabled "( locked )" control with the reason on hover.

**My Claims `/my-claims`** — one row per claim: item thumbnail and title, status
badge, submission time, the proof the student wrote, and the rejection reason shown
inline. Approved claims show the finder's contact details with a WhatsApp link.

**Profile `/profile`** — two independent cards. Account details: full name,
department, phone editable; matric number and campus email shown as locked with a
reason. Change password: current, new, confirm, with its own submit button.

**Admin Dashboard `/admin`** — sidebar layout. Pending claims table first (item,
claimant, submitted, Review action), then three counters (open items, pending,
returned). When nothing is pending, the panel states that explicitly.

Recorded rule from Batch 3: one claim per student per item, permanently. A rejected
claim blocks that student from claiming the same item again.

### Batch 4 — approved

**Claim Review `/admin/claims/:id`** — sidebar layout. Item card (photo, facts,
public description) and claimant card (name, matric, department, contact, previous
claim count including rejections) sit side by side; the proof panel spans the width
below. Approve is immediate behind a confirmation; Reject reveals a required reason
field and the confirm button stays disabled until it has content.

**Manage Items `/admin/items`** — search plus Type, Status and Category selects, a
"Show archived" toggle, and dense rows with View and Archive actions. Archive asks
for confirmation, states that listings will hide it and that claim history is kept,
and states that the action can be undone.

**Not Found `*`** — plain explanation, home link, link to found items. No empty
layout with broken components.

## 5. UX rules

### 5.1 Forms

| Rule | Detail |
|---|---|
| Labels above fields | Placeholder-only labelling is not used |
| Required fields marked | One asterisk convention, explained once per form |
| Validate on blur and on submit | Not on every keystroke |
| Errors under the field | Red border, danger-coloured text, sentence stating the fix |
| Form contents preserved on error | A failed submit never clears typed input |
| No double submit | Button disabled with a spinner while the request is in flight |

### 5.2 Feedback

| Situation | Response |
|---|---|
| Success | Toast, top-right on desktop, top-centre on mobile, auto-dismiss after 4 s |
| Failure | Inline message that persists until dismissed or retried |
| Destructive action | Confirmation step naming the exact item |
| Long operation | Button spinner; rest of the page stays interactive |

### 5.3 Loading, empty and error states

| State | Requirement |
|---|---|
| List loading | Skeleton cards matching final dimensions |
| Image loading | Fixed aspect-ratio container, no card resizing |
| Empty, no data | What would appear here, plus one action to create it |
| Empty, filtered | "No items match these filters" plus Clear all |
| Request failed | Message plus a Try again button |
| Missing or archived item | The 404 page |

### 5.4 Search and filtering

- Search is debounced by 300 ms.
- Search and filter state is written to the URL so links are shareable and the back
  button behaves correctly.
- Active filters show as removable chips; the Filters button shows how many are active.

### 5.5 Mobile

| Rule | Detail |
|---|---|
| Inputs at least 16px | Prevents iOS zoom-on-focus |
| Touch targets at least 44×44px | Includes icon buttons and chips |
| One column below 768px | No horizontal scrolling |
| Filters in a slide-up drawer | Results stay visible while browsing |

### 5.6 Accessibility

- Visible focus ring (3px, primary) on every interactive element; never removed.
- Menus, drawer and dialogs fully keyboard operable; focus trapped in open dialogs.
- Item images carry descriptive `alt` text; the decorative logo glyph is `aria-hidden`.
- Status is never conveyed by colour alone — badges always contain the word.
