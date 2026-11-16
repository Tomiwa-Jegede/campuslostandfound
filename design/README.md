# Design handoff — Campus Lost & Found

Phase 2 visual design. Everything here traces to `../docs/design.md` (decisions and
rules) and `../docs/prd.md` (requirements).

## What is in this folder

| File | What it is | Use it for |
|---|---|---|
| `mockups.html` | All screens, pixel-accurate, one file, no build step | Share by link or file; inspect the real CSS |
| `campus-lost-and-found-design.pdf` | 16-page printable board | Sending to a supervisor, pasting into a report |
| `README.md` | This file | Handoff instructions |

15 desktop screens at 1440px and 4 mobile screens at 390px. "Found items" is not a
separate design: it is `/lost` with the labels and badge colour swapped.

## View it

```
open design/mockups.html
```

or serve it:

```
python3 -m http.server 5178
# then open http://127.0.0.1:5178/design/mockups.html
```

Print to PDF from the browser if you change anything; the `@media print` rules put
one screen per page.

## Getting it into Figma

I cannot create a Figma file directly — no Figma access is available. Two routes,
both take about two minutes:

**Route A — editable layers (recommended)**

1. In Figma, open a new design file.
2. Run the **html.to.design** plugin (Figma Community, free tier available).
3. Choose *Import from URL*, and paste the local server URL from above
   (`http://127.0.0.1:5178/design/mockups.html`).
4. Import the frame you want. Layers arrive as editable frames, text and shapes
   with auto-layout.

**Route B — flat reference**

1. Figma → place image, or drag the PDF pages in.
2. Good enough for review; not editable.

If neither plugin is available, the HTML file *is* the design source of truth and
the team can read the CSS directly — which is often more useful than Figma layers
for a React build.

## Tokens used

Singleton values, identical in every screen. Do not introduce new colours.

| Token | Hex | Use |
|---|---|---|
| `--primary` | `#1E40AF` | Buttons, links, active nav |
| `--primary-strong` | `#1E3A8A` | Headings |
| `--found` | `#15803D` | Found badge, success |
| `--lost` | `#B45309` | Lost badge, warning |
| `--muted` | `#475569` | Secondary text |
| `--bg` | `#EFF6FF` | Page background |
| `--card` | `#FFFFFF` | Surfaces |
| `--border` | `#BFDBFE` | Borders, dividers |
| `--danger` | `#DC2626` | Errors, destructive actions |

Type: **Inter**, 400/500/600/700. Body 16px/1.6. Nothing below 13px.
Radii: 10px inputs and buttons, 14px cards, 999px badges.

## Screen inventory

| # | Screen | Route | Access |
|---|---|---|---|
| 01 | Landing | `/` | public |
| 02 | Lost items | `/lost` | public |
| 03 | Item detail | `/items/:id` | public |
| 04 | Submit claim | `/items/:id/claim` | student |
| 05 | Report item | `/report` | student |
| 06 | Register | `/register` | public |
| 07 | Login | `/login` | public |
| 08 | Student dashboard | `/dashboard` | student |
| 09 | My reports | `/my-reports` | student |
| 10 | My claims | `/my-claims` | student |
| 11 | Profile | `/profile` | student |
| 12 | Admin dashboard | `/admin` | admin |
| 13 | Claim review | `/admin/claims/:id` | admin |
| 14 | Manage items | `/admin/items` | admin |
| 15 | Not found | `*` | public |
| 16 | Mobile set | — | landing, list + filter drawer, detail, claim |

## What the team must not "improve" without asking

These are approved decisions, not oversights:

- Contact details never appear on a public page, including the item detail page.
- Claim, edit and delete are hidden or disabled by item state — see the state table
  in `../docs/design.md` §4.
- Archiving is used instead of deleting items so claim history survives.
- Rejected claims cannot be resubmitted by the same student on the same item.
- Photo placeholders are placeholders: one photo per item, 4:3, max 2 MB.
