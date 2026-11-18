# Project Requirements Document (PRD)
## Campus Lost and Found Portal

| | |
|---|---|
| **Course** | IFT301 |
| **Version** | 1.1 — approved; amended during Phase 2 design |
| **Date** | 16 November 2026 |
| **Stack** | PostgreSQL, Express.js, React (Vite), Node.js |
| **Status** | Approved |

**Revision history**

| Version | Change | Reason |
|---|---|---|
| 1.1 | FR-06 now locks matric number and email; FR-34 and FR-35 added | Design review exposed an identity-tampering and a claim-spam gap |

---

## 1. Background and problem statement

Students on campus lose personal belongings — phones, ID cards, wallets, laptops,
keys — in lecture halls, the library, hostels, and around campus. The only channel
for recovery today is WhatsApp/Telegram group posts, with two established failures:

1. **No search.** A lost-item post is buried in the chat scroll within an hour and
   cannot be retrieved later.
2. **No record of found items.** Items handed to a security post or front desk must
   be claimed in person, and the owner has no list to check.

A third failure is latent. Neither a finder nor a security officer has a reliable
way to establish that a claimant is the true owner. This project makes that
verification a first-class feature rather than an afterthought.

## 2. Aim

To design and implement a campus lost and found portal that gives students a single
searchable platform to report lost belongings, report found items, and recover their
property through a verifiable ownership claim process.

## 3. Specific objectives

| ID | Objective |
|---|---|
| O1 | Design a normalised PostgreSQL schema for users, categories, items and claims. |
| O2 | Implement student registration and login using bcrypt password hashing and JWT, restricted by matric-number format and campus email domain. |
| O3 | Implement reporting of lost and found items, including a photo upload. |
| O4 | Implement keyword search and filtering by category, location, date and status. |
| O5 | Implement an ownership-claim workflow requiring item-specific verification details. |
| O6 | Implement an admin review workflow that approves or rejects claims and drives item status. |
| O7 | Evaluate the finished system against written functional test cases. |

Notifications, admin user management, messaging, email/SMS delivery, automatic
expiry and mapping are explicitly excluded (see §5).

## 4. Users and roles

| Role | Description |
|---|---|
| **Guest** | Not logged in. May browse and search. Cannot post, claim, or see contact details. |
| **Student** | Registered user with a valid matric number and campus email. |
| **Admin** | One seeded account. Reviews claims, archives spam, marks items returned. Never claims. |

### 4.1 Permission matrix

| Action | Guest | Student | Admin |
|---|---|---|---|
| View landing page | yes | yes | yes |
| Browse and search items | yes | yes | yes |
| Register / login | yes | — | — |
| Report lost item | no | yes | yes |
| Report found item | no | yes | yes |
| Edit/delete own report while OPEN | no | own only | any |
| Submit a claim | no | yes | no |
| View own claims | no | yes | all |
| View finder phone/email | no | only after approval | always |
| Approve/reject a claim | no | no | yes |
| Mark item returned | no | own found items | any |
| Archive an item | no | no | yes |

Browsing is open to guests by design: a student who has just lost a phone should be
able to search immediately, without registering first. Authentication is required
only to act.

## 5. Scope

### 5.1 In scope

Accounts and profiles; lost and found reporting with one photo each; browsing,
keyword search and filters; item detail pages; ownership claims with written proof;
admin claim review with written rejection reasons; contact release on approval;
item archiving.

### 5.2 Out of scope (declared future work)

In-app notifications, admin user management, finder–owner chat, email or SMS
delivery, automatic expiry of old reports, map/GPS location, QR codes, automated
matching, multi-photo galleries, deployment to a public host (pending §10).

## 6. Status lifecycles

```
ITEM
  OPEN --(claim submitted)--> CLAIM_PENDING
                                 |--(approved)--> RETURNED
                                 `--(rejected)--> OPEN

CLAIM
  PENDING --(approved)--> APPROVED
          `--(rejected)--> REJECTED   (a written reason is mandatory)
```

An item is also either `ARCHIVED` (removed by admin) or active. Archived and
returned items cannot be claimed.

## 7. User journeys

### 7.1 Student loses an item
1. Registers with matric number and campus email; logs in.
2. Reports the lost item with title, category, description, date lost, last-seen
   location and one photo. Status becomes `OPEN`.
3. Searches Found Items by keyword, category and date.
4. Opens a matching report and submits a claim: written proof of distinguishing
   features, plus an optional serial or receipt reference.
5. Item becomes `CLAIM_PENDING`; the claim appears in My Claims as `PENDING`.
6. Admin approves the claim. The claim shows `APPROVED` and the finder's phone and
   email are revealed. Item becomes `RETURNED`.
7. If rejected, the claim shows `REJECTED` with the admin's reason and the item
   returns to `OPEN`.

### 7.2 Student finds an item
1. Reports the found item. Their phone and email are stored but hidden from
   everyone until a claim is approved.
2. A claim arrives; My Reports shows a pending claim against their item.
3. Admin approves; the finder now sees the claimant's name and contact details,
   because both parties need each other's details to meet.
4. The item is handed over and marked `RETURNED`.

### 7.3 Administrator
1. Logs in with the seeded admin account.
2. Sees counters for open items, pending claims and returned items.
3. Works through the claim queue: reads the proof, inspects the item photo, then
   approves or rejects with a written reason.
4. Browses all items, archives spam, and corrects errors.

## 8. Functional requirements

### 8.1 Accounts and authentication
| ID | Requirement |
|---|---|
| FR-01 | A user can register with full name, matric number, department, campus email, phone number and password. |
| FR-02 | Registration rejects a matric number that fails the campus format and an email that does not end in the campus domain. |
| FR-03 | Passwords are hashed with bcrypt and never stored or returned in plain text. |
| FR-04 | Login returns a JWT; protected endpoints reject missing, invalid or expired tokens with 401. |
| FR-05 | Admin-only endpoints reject students with 403. |
| FR-06 | A logged-in user can view and edit their own profile (full name, department, phone, password). Matric number and campus email are read-only after registration, because they identify the student and enforce the domain rule. |
| FR-07 | Matric number and email are unique; duplicates are rejected with a clear message. |

### 8.2 Items
| ID | Requirement |
|---|---|
| FR-08 | A student can report a lost item. |
| FR-09 | A student can report a found item. |
| FR-10 | Each item has at most one photo (JPG or PNG, maximum 2 MB). |
| FR-11 | Items display in Lost Items and Found Items lists with title, category, location, date, status and thumbnail. |
| FR-12 | Keyword search matches the item title and description. |
| FR-13 | Items can be filtered by category, location, date range and status, alone or combined. |
| FR-14 | Each item has a detail page showing all fields, the photo, the reporter's display name and the status. |
| FR-15 | A student can edit or delete a report they own while its status is `OPEN`. |
| FR-16 | A report becomes read-only after the first claim is submitted. |
| FR-17 | Reporter phone and email are never exposed before a claim is approved. |

### 8.3 Claims
| ID | Requirement |
|---|---|
| FR-18 | A logged-in student can submit a claim on an active item they did not report. |
| FR-19 | A claim requires written proof of ownership (minimum 30 characters) and accepts an optional serial or receipt reference. |
| FR-20 | Only one claim may be pending on an item at a time; the item moves to `CLAIM_PENDING`. |
| FR-21 | A student can view all claims they submitted and each one's status. |
| FR-22 | A student cannot claim an archived, returned or already-pending item. |
| FR-23 | A rejection requires a written reason from the admin. |
| FR-34 | A student may submit at most one claim per item, permanently. A rejected claim prevents that student from claiming the same item again. This is enforced by a unique constraint on (item, claimant), not only in application code. |
| FR-35 | Clearing a rejected-claim block is not a user-facing feature in this prototype. It requires direct database access and is listed as future work. |

### 8.4 Administration
| ID | Requirement |
|---|---|
| FR-24 | The admin sees a dashboard with counts of open items, pending claims and returned items. |
| FR-25 | The admin sees a queue of pending claims with the item, the claimant and the proof. |
| FR-26 | Approving a claim sets it to `APPROVED` and the item to `RETURNED`, and reveals contact details to both parties. |
| FR-27 | Rejecting a claim sets it to `REJECTED`, stores the reason and returns the item to `OPEN`. |
| FR-28 | The admin can browse, filter and archive any item. |
| FR-29 | Archived items disappear from public listings but retain their claim history. |

### 8.5 Categories
| ID | Requirement |
|---|---|
| FR-30 | Categories are fixed and seeded: Electronics, ID Cards & Documents, Wallets & Bags, Keys, Books & Stationery, Clothing, Accessories, Other. |

### 8.6 Feedback and errors
| ID | Requirement |
|---|---|
| FR-31 | Every form validates on the client and again on the server. |
| FR-32 | The API returns consistent JSON errors with an HTTP status code and a human-readable message. |
| FR-33 | Every list has an empty state; every submit action has a loading state and success or failure feedback. |

## 9. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | The interface is responsive from 360 px to 1440 px, designed mobile-first. |
| NFR-02 | Typical API responses complete in under 500 ms on a local machine. |
| NFR-03 | All SQL uses parameterised queries; no string concatenation of user input. |
| NFR-04 | Secrets (database password, JWT secret) live in `.env`, which is git-ignored. |
| NFR-05 | Uploads are validated by MIME type and size before being written to disk. |
| NFR-06 | Pages use semantic HTML, labelled inputs and sufficient colour contrast. |
| NFR-07 | Supported browsers: current Chrome, Firefox, Safari and Edge. |
| NFR-08 | Data integrity is enforced in the database with primary keys, foreign keys and check constraints, not only in application code. |
| NFR-09 | The codebase follows one consistent structure so any file can be found by convention. |

## 10. Constraints, assumptions and open items

**Constraints**
- Built and demonstrated **locally** (`localhost`). No public deployment is in scope.
- One administrator account, created by the seed file.
- Single developer with AI assistance.
- Delivery window: **at least three weeks**, so the full scope in this document is
  achievable without cutting features.
- Documentation follows the standard five-chapter format (Times New Roman 12,
  1.5 line spacing, APA references); the department imposes no other template.
- The campus email domain and matric-number pattern are **configuration values**
  held in `.env`, never hardcoded, so they can be set at installation time.

**Assumptions**
- Students own smartphones or laptops with a modern browser.
- The campus uses a single email domain.
- No email or SMS is sent, so account verification is format-based only.

**Resolved items**
1. Demonstration mode: local only.
2. Deadline: three weeks or more.
3. Documentation format: standard five-chapter format.
4. Campus identifiers: configurable via `.env`.

## 11. Success criteria

The project is successful when:
1. A student can register, log in, report a lost item and report a found item.
2. A second student can find the item by search and filter, open it and submit a claim with proof.
3. The admin can see the claim, approve it, and both parties can see each other's contact details.
4. Rejecting a claim returns the item to the open pool with a written reason.
5. Every requirement above is covered by at least one recorded test case with a pass or fail result.

## 12. Traceability

| Objective | Requirements |
|---|---|
| O1 | FR-30, NFR-08 (schema detail in the ERD) |
| O2 | FR-01 to FR-07, NFR-03, NFR-04 |
| O3 | FR-08 to FR-10, FR-17, NFR-05 |
| O4 | FR-11 to FR-14 |
| O5 | FR-18 to FR-23 |
| O6 | FR-24 to FR-29 |
| O7 | §11 success criteria, Chapter Four test cases |
