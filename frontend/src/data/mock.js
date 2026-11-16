// Fake data for the frontend-only phase.
// ============================================================
// These rows are written by hand so every screen has something to show
// before the server exists. They are NOT a database and they are NOT secure:
// the demo passwords below are plain text on purpose, because hashing them
// here would be pretend security. The real server hashes with bcrypt (FR-03).
// ============================================================

const TINTS = {
  Electronics: ['#DBEAFE', '#1E40AF'],
  'ID Cards & Documents': ['#EDE9FE', '#6D28D9'],
  'Wallets & Bags': ['#FEF3C7', '#B45309'],
  Keys: ['#CCFBF1', '#0F766E'],
  'Books & Stationery': ['#DCFCE7', '#15803D'],
  Clothing: ['#FCE7F3', '#BE185D'],
  Accessories: ['#FFEDD5', '#C2410C'],
  Other: ['#E2E8F0', '#475569'],
}

/**
 * A drawn placeholder instead of a stock photo.
 * We do not own real photos of these items, and a stock photo would be a lie
 * about what the item looks like. A drawn tile is honest and works offline.
 */
function placeholder(category) {
  const [bg, fg] = TINTS[category] || TINTS.Other
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
<rect width="400" height="300" fill="${bg}"/>
<g transform="translate(200 128)" fill="none" stroke="${fg}" stroke-width="7" stroke-linejoin="round" opacity="0.8">
<path d="M-46 -6 l52 -46 h40 l34 34 v52 a14 14 0 0 1 -14 14 h-98 a14 14 0 0 1 -14 -14 z"/>
<circle cx="-20" cy="-22" r="8" fill="${bg}"/>
<circle cx="22" cy="34" r="20"/>
<path d="M36 48 l18 18"/>
</g>
<text x="200" y="248" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="19" font-weight="600" fill="${fg}" opacity="0.85">${category}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const DAY = 86400000
const daysAgo = (n) => new Date(Date.now() - n * DAY).toISOString()
const dateAgo = (n) => new Date(Date.now() - n * DAY).toISOString().slice(0, 10)

export const CATEGORIES = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'ID Cards & Documents' },
  { id: 3, name: 'Wallets & Bags' },
  { id: 4, name: 'Keys' },
  { id: 5, name: 'Books & Stationery' },
  { id: 6, name: 'Clothing' },
  { id: 7, name: 'Accessories' },
  { id: 8, name: 'Other' },
]

export function createSeed() {
  const users = [
    {
      id: 'u1',
      full_name: 'Ada Okafor',
      matric_no: 'IFT/21/1042',
      department: 'Computer Science',
      email: 'ada.okafor@campus.edu.ng',
      phone: '08035550142',
      role: 'student',
      demoPassword: 'password123',
    },
    {
      id: 'u2',
      full_name: 'Tunde Bello',
      matric_no: 'IFT/22/1188',
      department: 'Software Engineering',
      email: 'tunde.bello@campus.edu.ng',
      phone: '08055550199',
      role: 'student',
      demoPassword: 'password123',
    },
    {
      id: 'u3',
      full_name: 'Grace Adeyemi',
      matric_no: 'STF/00/0001',
      department: 'Student Affairs',
      email: 'admin@campus.edu.ng',
      phone: '08077770000',
      role: 'admin',
      demoPassword: 'admin1234',
    },
  ]

  const item = (id, type, title, category, location, description, reporter, n, status, archived = false) => ({
    id,
    type,
    title,
    category_id: CATEGORIES.find((c) => c.name === category).id,
    category_name: category,
    description,
    occurred_on: dateAgo(n),
    location,
    photo_url: placeholder(category),
    is_archived: archived,
    status,
    reporter: { id: reporter.id, full_name: reporter.full_name },
    reporter_id: reporter.id,
    created_at: daysAgo(n),
  })

  const [ada, tunde] = users

  const items = [
    item('i1', 'found', 'Black iPhone 13, cracked screen protector', 'Electronics', 'Cafeteria, table by the window',
      'Found this phone on a table after lunch. It is still on and locked. I handed it to the cafeteria supervisor, so collect it from the counter.', tunde, 1, 'OPEN'),
    item('i2', 'lost', 'Blue Hydro Flask water bottle', 'Other', 'Library, 2nd floor reading room',
      'Left it on the desk nearest the window. It has a small dent near the base and a sticker of a mountain on the side.', ada, 2, 'OPEN'),
    item('i3', 'found', 'Student ID card — Adebayo T.', 'ID Cards & Documents', 'Lecture Hall B, row 4',
      'Picked up a student ID after the 10am lecture. Name on the card starts with Adebayo. I will hand it to the faculty office if nobody claims it.', tunde, 2, 'OPEN'),
    item('i4', 'found', 'Bunch of keys with a red keyring', 'Keys', 'Sports complex, near the changing rooms',
      'Four keys on a red ring with a small torch attached. Found on the bench outside the changing room.', tunde, 3, 'OPEN'),
    item('i5', 'lost', 'TI-84 calculator in a grey case', 'Electronics', 'Maths block, room 204',
      'Forgot it after the 2pm class. The case has my initials written on the inside of the flap in blue ink.', ada, 3, 'OPEN'),
    item('i6', 'found', 'Brown leather wallet', 'Wallets & Bags', 'Main bus stop, bench',
      'Found a brown wallet on the bench. There is no cash inside but there are cards. I have not looked through the cards for privacy reasons.', tunde, 4, 'OPEN'),
    item('i7', 'lost', 'Black backpack with a laptop sleeve', 'Wallets & Bags', 'Engineering workshop',
      'Last seen under the workbench during the lab session. It has a broken zip on the front pocket and a green tag on the handle.', ada, 4, 'OPEN'),
    item('i8', 'found', 'Prescription glasses in a blue case', 'Accessories', 'Cafeteria, near the till',
      'Found a blue glasses case on the counter. Thin metal frames. Please describe the frames to claim them.', tunde, 5, 'OPEN'),
    item('i9', 'found', 'Organic Chemistry textbook', 'Books & Stationery', 'Library return desk',
      'Returned without an owner slip. Name written inside the cover has been covered with a sticker. Ask at the desk for the book.', tunde, 5, 'OPEN'),
    item('i10', 'lost', 'Navy hoodie with faculty logo', 'Clothing', 'Lecture Theatre 1',
      'Left it on the back row after the evening lecture. It has the faculty logo on the chest and a small tear on the left cuff.', ada, 6, 'OPEN'),
    item('i11', 'found', 'AirPods case with one earbud', 'Electronics', 'Football pitch, sideline',
      'Found near the sideline after the match. Only the left earbud is inside the case.', tunde, 7, 'OPEN'),
    item('i12', 'found', 'Scientific calculator (Casio fx-991)', 'Electronics', 'Physics lab, bench 3',
      'Left behind after the practical. The name on the back has worn off. Claimed and collected already.', tunde, 9, 'RETURNED'),
    item('i13', 'found', 'Black umbrella with a wooden handle', 'Other', 'Main gate, security post',
      'Handed in at the security post. Automatic umbrella, wooden handle, small tear on one panel. Waiting for a decision on a claim.', tunde, 8, 'CLAIM_PENDING'),
    item('i14', 'lost', 'Grey USB drive, 32GB', 'Electronics', 'Computer lab 2',
      'Old report, archived by the admin after a month. Kept here so the claim history is not lost.', ada, 40, 'OPEN', true),
  ]

  const claims = [
    {
      id: 'c1',
      item_id: 'i12',
      claimant_id: 'u1',
      status: 'APPROVED',
      proof:
        'This is my calculator. The name on the back is worn off because I scratched it off by mistake in first year. It has a small crack on the battery cover and the mode key needs a hard press. I can show the receipt from the campus bookshop.',
      serial_reference: 'Bookshop receipt 9912-A',
      rejection_reason: null,
      created_at: daysAgo(8),
      decided_at: daysAgo(7),
    },
    {
      id: 'c2',
      item_id: 'i13',
      claimant_id: 'u1',
      status: 'PENDING',
      proof:
        'I think this is my umbrella. I left it at the security post on Tuesday evening when I was signing in a visitor. It is automatic and the handle is wood. One panel has a small tear near the edge.',
      serial_reference: null,
      rejection_reason: null,
      created_at: daysAgo(1),
      decided_at: null,
    },
    {
      id: 'c3',
      item_id: 'i7',
      claimant_id: 'u1',
      status: 'REJECTED',
      proof:
        'This backpack looks like mine. It is black with a laptop sleeve. I left it in the workshop last week.',
      serial_reference: null,
      rejection_reason:
        'The description does not mention the broken zip or the green tag, which are the two identifying details the reporter listed. Please contact the office if you believe this was a mistake.',
      created_at: daysAgo(3),
      decided_at: daysAgo(2),
    },
  ]

  // categories must live in the store too: every item is resolved through it.
  return { users, items, claims, categories: CATEGORIES }
}
