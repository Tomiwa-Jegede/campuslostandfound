/* Real API adapter: talks to Express (snake_case) and reshapes responses
   into what the UI expects. The mock version is in api.mock.backup.js. */
export const USE_MOCK = false
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
const ORIGIN = API_BASE.replace(/\/api\/?$/, '')

/* If a create/list call fails with a field-name mismatch, fix it HERE
   (compare with backend/routes/items.js). */
const CREATE_FIELDS = {
  type: 'type', title: 'title', category: 'category_id',
  description: 'description', date: 'date_occurred', location: 'location',
}
const TYPE_OUT = (v) => String(v || 'found').toLowerCase()

export class ApiError extends Error {
  constructor(status, code, message, fields = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export function resetDemoData() {} // mock-only; kept so old imports don't break

const CODES = { 400: 'VALIDATION_FAILED', 401: 'NOT_AUTHENTICATED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT' }

async function request(path, { method = 'GET', body, token } = {}) {
  const isForm = body instanceof FormData
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    })
  } catch {
    throw new ApiError(0, 'NETWORK', 'Cannot reach the server. Is it running on port 5000?')
  }
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = typeof payload.error === 'string' ? payload.error : payload.error?.message || 'The request failed. Please try again.'
    const code = path === '/auth/login' && res.status === 401 ? 'INVALID_CREDENTIALS' : CODES[res.status] || 'REQUEST_FAILED'
    throw new ApiError(res.status, code, msg, payload.fields || payload.errors || payload.error?.fields || null)
  }
  return payload
}

/* ---------------- helpers ---------------- */
const pick = (o, ...keys) => { for (const k of keys) if (o && o[k] !== undefined && o[k] !== null) return o[k] }
const list = (x) => (Array.isArray(x) ? x : x?.items || x?.claims || x?.data || [])
const qs = (obj) => {
  const s = new URLSearchParams(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()
  return s ? `?${s}` : ''
}
const storedToken = () => {
  try {
    const session = JSON.parse(localStorage.getItem('clf.session.v1') || 'null')
    if (session?.token) return session.token
  } catch { /* fall through */ }
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (/token/i.test(k)) return localStorage.getItem(k)
  }
  return null
}
function viewerOf(token) {
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return { id: String(p.id ?? p.sub ?? p.user_id), role: p.role }
  } catch { return null }
}
function photoUrl(p) {
  if (!p) return ''
  if (/^(https?:|data:|blob:)/.test(p)) return p
  return `${ORIGIN}/uploads/${p.replace(/^\/?(uploads\/)?/, '')}`
}
function normContact(src, who) {
  const c = src.contact ?? src.contacts
  if (!c) return null
  const person = c.full_name
    ? c
    : (who === 'owner' ? c.claimant : c.finder ?? c.reporter ?? c.owner) ?? (c.name ? c : null)
  if (!person) return null
  return { ...person, full_name: person.full_name ?? person.name }
}

function normItem(raw, v = null) {
  const it = raw.item ?? raw
  const status = pick(it, 'item_status', 'status')
  const rep = typeof it.reporter === 'object' ? it.reporter : (typeof it.reported_by === 'object' ? it.reported_by : null)
  const reporter_id = String(rep?.id ?? pick(it, 'reported_by', 'reporter_id') ?? '')
  const date = pick(it, 'occurred_on', 'date_occurred', 'event_date', 'date_found', 'date_lost', 'date')
  const catName = pick(it, 'category_name') ?? (typeof it.category === 'string' && Number.isNaN(Number(it.category)) ? it.category : undefined)
  const my_claim = it.my_claim ?? (it.my_claim_status ? { id: it.my_claim_id, status: it.my_claim_status, rejection_reason: it.my_rejection_reason ?? null } : null)
  const claim_count = Number(it.claim_count ?? 0)
  const is_owner = Boolean(v && reporter_id && v.id === reporter_id)
  const isAdmin = v?.role === 'admin'
  return {
    ...it,
    id: it.id,
    status,
    type: String(pick(it, 'type', 'item_type', 'report_type') ?? 'found').toLowerCase(),
    category_id: pick(it, 'category_id'),
    category_name: catName ?? 'Other',
    occurred_on: typeof date === 'string' ? date.slice(0, 10) : date,
    photo_url: photoUrl(pick(it, 'photo_path', 'photo_url')),
    is_archived: status === 'ARCHIVED',
    reporter_id,
    reporter: rep ?? {
      id: reporter_id,
      full_name: (typeof it.reporter === 'string' ? it.reporter : null)
        ?? pick(it, 'reporter_name', 'reported_by_name', 'finder_name') ?? 'Student',
    },
    held_by: it.held_by,
    claim_count,
    pending_claim: it.pending_claim ?? null,
    my_claim,
    is_owner,
    can_edit: is_owner && status === 'OPEN' && claim_count === 0 && !my_claim,
    can_delete: false,
    can_claim: Boolean(v) && !isAdmin && !is_owner && status === 'OPEN' && !my_claim,
    claim_blocked_reason: my_claim?.status === 'REJECTED' ? 'You have already claimed this item. A rejected claim cannot be repeated.' : null,
    contact: normContact(it, is_owner ? 'owner' : 'claimant'),
  }
}

function normClaim(raw) {
  const c = raw.claim ?? raw
  const flatItem = c.item_id ? normItem({ ...c, id: c.item_id, status: undefined }) : null
  const person = (obj, prefix) =>
    obj ?? (c[`${prefix}_name`] || c[`${prefix}_full_name`]
      ? { id: c[`${prefix}_id`], full_name: c[`${prefix}_full_name`] ?? c[`${prefix}_name`], matric_no: c[`${prefix}_matric_no`], email: c[`${prefix}_email`], phone: c[`${prefix}_phone`], department: c[`${prefix}_department`] }
      : null)
  return {
    ...c,
    status: pick(c, 'claim_status', 'status'),
    claimant_id: pick(c, 'claimant_id', 'claimed_by'),
    proof: pick(c, 'proof_text', 'proof'),
    serial_reference: pick(c, 'serial_number', 'serial_reference') ?? null,
    rejection_reason: c.rejection_reason ?? null,
    decided_at: pick(c, 'decided_at', 'resolved_at') ?? null,
    item: c.item ? normItem(c.item) : flatItem,
    claimant: person(c.claimant, 'claimant'),
    reporter: person(c.reporter ?? c.finder, 'reporter'),
    contact: normContact(c, 'claimant')
      ?? (c.finder_contact ? { ...c.finder_contact, full_name: c.finder_contact.full_name ?? c.finder_contact.name } : null),
    previous_claims: c.previous_claims ?? 0,
  }
}

async function toFormData(payload) {
  const fd = new FormData()
  const F = CREATE_FIELDS
  if (payload.type) fd.append(F.type, TYPE_OUT(payload.type).toUpperCase())
  for (const [k, f] of [['title', F.title], ['category_id', F.category], ['description', F.description], ['occurred_on', F.date], ['location', F.location]]) {
    if (payload[k] !== undefined && payload[k] !== null) fd.append(f, payload[k])
  }
  if (/^(data:|blob:)/.test(payload.photo_url || '')) {
    const blob = await (await fetch(payload.photo_url)).blob()
    fd.append('photo', blob, 'photo.' + (blob.type.split('/')[1] || 'jpg'))
  }
  return fd
}

const unsupported = (what) => { throw new ApiError(501, 'NOT_SUPPORTED', `${what} is not available in this version.`) }
const authed = (r) => ({ token: r.token, user: r.user ?? r })

/* ---------------- API ---------------- */
export const api = {
  health: () => request('/health').catch(() => ({ ok: true })),
  categories: async () => list(await request('/categories')),

  register: async ({ confirm_password, ...body }) => authed(await request('/auth/register', { method: 'POST', body })),
  login: async (body) => authed(await request('/auth/login', { method: 'POST', body })),
  me: async (token) => { const r = await request('/auth/me', { token }); return r.user ?? r },
  updateProfile: async (token, body) => { const r = await request('/users/me', { method: 'PATCH', body, token }); return r.user ?? r },
  changePassword: async () => unsupported('Changing your password'),

  items: async (params = {}) => {
    const { type, q, category_id, location, from, to, status, reporter_id } = params
    const path = reporter_id ? '/items/mine' : `/items${qs({ type: type && TYPE_OUT(type), category: category_id, q, status })}`
    let rows = list(await request(path, { token: reporter_id ? storedToken() : undefined })).map((i) => normItem(i))
    if (reporter_id) rows = rows.filter((i) => i.is_archived === false || true)
    if (location) rows = rows.filter((i) => (i.location || '').toLowerCase().includes(location.toLowerCase()))
    if (from) rows = rows.filter((i) => i.occurred_on >= from)
    if (to) rows = rows.filter((i) => i.occurred_on <= to)
    return rows
  },
  item: async (id, token) => normItem(await request(`/items/${id}`, { token }), viewerOf(token)),
  createItem: async (token, payload) =>
    normItem(await request('/items', { method: 'POST', body: await toFormData(payload), token }), viewerOf(token)),
  updateItem: async (token, id, payload) => {
    const hasNewPhoto = /^(data:|blob:)/.test(payload.photo_url || '')
    const { photo_url, type, occurred_on, ...rest } = payload
    const body = hasNewPhoto
      ? await toFormData(payload)
      : { ...rest, ...(occurred_on !== undefined ? { date_occurred: occurred_on } : {}) }
    return normItem(await request(`/items/${id}`, { method: 'PATCH', body, token }), viewerOf(token))
  },
  deleteItem: async () => unsupported('Deleting a report (admins archive instead)'),

  submitClaim: async (token, itemId, { proof, serial_reference }) =>
    normClaim(await request(`/items/${itemId}/claims`, {
      method: 'POST', token,
      body: { proof_text: proof, ...(serial_reference ? { serial_number: serial_reference } : {}) },
    })),
  myClaims: async (token) => list(await request('/claims/mine', { token })).map(normClaim),

  adminStats: async (token) => {
    const [items, claims] = await Promise.all([
      request('/admin/items', { token }),
      request('/admin/claims?status=PENDING', { token }),
    ])
    const rows = list(items).map((i) => normItem(i))
    return {
      open: rows.filter((i) => i.status === 'OPEN').length,
      pending: list(claims).length,
      returned: rows.filter((i) => i.status === 'RETURNED').length,
    }
  },
  adminClaims: async (token, status = 'PENDING') =>
    list(await request(`/admin/claims${status === 'ALL' ? '' : `?status=${status}`}`, { token })).map(normClaim),
  adminClaim: async (token, id) => normClaim(await request(`/claims/${id}`, { token })),
  decideClaim: async (token, id, { decision, reason }) =>
    normClaim(await request(`/admin/claims/${id}/${decision === 'approve' ? 'approve' : 'reject'}`, {
      method: 'PATCH', token, body: decision === 'approve' ? {} : { reason },
    })),
  adminItems: async (token, params = {}) => {
    let rows = list(await request(`/admin/items${qs({ type: params.type && TYPE_OUT(params.type), status: params.status, q: params.q })}`, { token })).map((i) => normItem(i))
    if (!params.showArchived) rows = rows.filter((i) => !i.is_archived)
    return rows
  },
  setArchived: async (token, id, archived) =>
    normItem(await request(`/admin/items/${id}/archive`, { method: 'PATCH', body: { archived }, token }), viewerOf(token)),
}
