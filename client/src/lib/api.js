/* ============================================================
   One file decides where data comes from. Nothing else in the app
   knows whether the data is fake or real.
   Phase 3: USE_MOCK = true  -> data comes from src/data/mock.js
   Phase 4: USE_MOCK = false -> data comes from the Express server
   ============================================================ */
import { createSeed } from '../data/mock.js'
import { CAMPUS_EMAIL_DOMAIN, MATRIC_PATTERN } from './config.js'

export const USE_MOCK = true
const API_BASE = '/api'
const STORE_KEY = 'clf.data.v1'

export class ApiError extends Error {
  constructor(status, code, message, fields = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = (value) => JSON.parse(JSON.stringify(value))

/* ---------------- fake database, kept in localStorage ---------------- */

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const store = JSON.parse(raw)
      // A store written by an older build may be missing a table.
      if (!Array.isArray(store.categories)) {
        store.categories = createSeed().categories
        saveStore(store)
      }
      return store
    }
  } catch {
    /* corrupted store: fall through and re-seed */
  }
  const fresh = createSeed()
  saveStore(fresh)
  return fresh
}

function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

export function resetDemoData() {
  localStorage.removeItem(STORE_KEY)
  return loadStore()
}

/* ---------------- helpers ---------------- */

const publicUser = (u) => ({
  id: u.id,
  full_name: u.full_name,
  matric_no: u.matric_no,
  department: u.department,
  email: u.email,
  phone: u.phone,
  role: u.role,
})

const contactOf = (u) => ({ full_name: u.full_name, phone: u.phone, email: u.email })

function withCategoryName(store, item) {
  const category = store.categories.find((c) => c.id === item.category_id)
  return { ...item, category_name: category ? category.name : 'Other' }
}

function decorateItem(store, item, viewer) {
  const claims = store.claims.filter((c) => c.item_id === item.id)
  const pending = claims.find((c) => c.status === 'PENDING')
  const mine = viewer ? claims.find((c) => c.claimant_id === viewer.id) : null
  const approved = claims.find((c) => c.status === 'APPROVED')
  const isOwner = viewer ? viewer.id === item.reporter_id : false
  const locked = claims.length > 0

  let contact = null
  if (approved && viewer) {
    if (isOwner) {
      const claimant = store.users.find((u) => u.id === approved.claimant_id)
      if (claimant) contact = contactOf(claimant)
    } else if (viewer.id === approved.claimant_id) {
      const reporter = store.users.find((u) => u.id === item.reporter_id)
      if (reporter) contact = contactOf(reporter)
    }
  }

  return {
    ...withCategoryName(store, item),
    claim_count: claims.length,
    pending_claim: pending ? { id: pending.id, claimant_name: store.users.find((u) => u.id === pending.claimant_id)?.full_name } : null,
    my_claim: mine ? { id: mine.id, status: mine.status, rejection_reason: mine.rejection_reason } : null,
    is_owner: isOwner,
    can_edit: isOwner && item.status === 'OPEN' && !locked && !item.is_archived,
    can_delete: isOwner && item.status === 'OPEN' && !locked && !item.is_archived,
    can_claim: Boolean(viewer) && !isOwner && item.status === 'OPEN' && !item.is_archived && !mine,
    claim_blocked_reason: mine && mine.status === 'REJECTED' ? 'You have already claimed this item. A rejected claim cannot be repeated (FR-34).' : null,
    contact,
  }
}

function tokenToUser(store, token) {
  if (!token) return null
  const id = token.replace('demo-token-', '')
  return store.users.find((u) => u.id === id) || null
}

function requireUser(store, token) {
  const user = tokenToUser(store, token)
  if (!user) throw new ApiError(401, 'NOT_AUTHENTICATED', 'Please log in to continue.')
  return user
}

function requireAdmin(store, token) {
  const user = requireUser(store, token)
  if (user.role !== 'admin') throw new ApiError(403, 'FORBIDDEN', 'This area is for administrators only.')
  return user
}

const validPhoto = (url) => typeof url === 'string' && (url.startsWith('data:image/') || url.startsWith('blob:') || url.startsWith('/'))

function validateItemPayload(payload) {
  const fields = {}
  const title = (payload.title || '').trim()
  const description = (payload.description || '').trim()
  const location = (payload.location || '').trim()

  if (title.length < 5) fields.title = 'Give the item a title of at least 5 characters.'
  if (title.length > 100) fields.title = 'Keep the title under 100 characters.'
  if (!payload.category_id) fields.category_id = 'Choose a category.'
  if (description.length < 20) fields.description = 'Describe the item in at least 20 characters.'
  if (description.length > 1000) fields.description = 'Keep the description under 1000 characters.'
  if (!payload.occurred_on) fields.occurred_on = 'Choose the date.'
  if (!location) fields.location = 'Say where it was lost or found.'
  if (payload.photo_url && !validPhoto(payload.photo_url)) fields.photo_url = 'The photo could not be read. Try another file.'

  if (Object.keys(fields).length) {
    throw new ApiError(400, 'VALIDATION_FAILED', 'Please fix the fields marked below.', fields)
  }
}

/* ---------------- mock API ---------------- */

const mockApi = {
  async health() {
    await wait(80)
    return { ok: true }
  },

  async categories() {
    await wait(80)
    const store = loadStore()
    return clone(store.categories)
  },

  /* ---- auth ---- */
  async register(payload) {
    await wait()
    const store = loadStore()
    const fields = {}
    const full_name = (payload.full_name || '').trim()
    const matric_no = (payload.matric_no || '').trim().toUpperCase()
    const email = (payload.email || '').trim().toLowerCase()
    const phone = (payload.phone || '').trim()
    const password = payload.password || ''

    if (full_name.length < 3) fields.full_name = 'Enter your full name.'
    if (!MATRIC_PATTERN.test(matric_no)) fields.matric_no = 'Use the format IFT/21/1042.'
    if (!email.endsWith(`@${CAMPUS_EMAIL_DOMAIN}`)) fields.email = `Use your campus email ending in @${CAMPUS_EMAIL_DOMAIN}.`
    if (!/^0\d{10}$/.test(phone)) fields.phone = 'Enter an 11-digit phone number starting with 0.'
    if (password.length < 8) fields.password = 'Use at least 8 characters.'
    if (password !== payload.confirm_password) fields.confirm_password = 'The two passwords do not match.'
    if (store.users.some((u) => u.matric_no.toLowerCase() === matric_no.toLowerCase())) {
      fields.matric_no = 'That matric number is already registered.'
    }
    if (store.users.some((u) => u.email.toLowerCase() === email)) {
      fields.email = 'That email is already registered.'
    }
    if (Object.keys(fields).length) {
      throw new ApiError(400, 'VALIDATION_FAILED', 'Please fix the fields marked below.', fields)
    }

    const user = {
      id: `u${Date.now()}`,
      full_name,
      matric_no,
      department: (payload.department || '').trim(),
      email,
      phone,
      role: 'student',
      demoPassword: password,
    }
    store.users.push(user)
    saveStore(store)
    return { token: `demo-token-${user.id}`, user: publicUser(user) }
  },

  async login({ email, password }) {
    await wait()
    const store = loadStore()
    const user = store.users.find((u) => u.email.toLowerCase() === (email || '').trim().toLowerCase())
    // One generic message, so nobody can test which emails are registered.
    if (!user || user.demoPassword !== password) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
    }
    return { token: `demo-token-${user.id}`, user: publicUser(user) }
  },

  async me(token) {
    await wait(100)
    const store = loadStore()
    return publicUser(requireUser(store, token))
  },

  async updateProfile(token, payload) {
    await wait()
    const store = loadStore()
    const user = requireUser(store, token)
    const fields = {}
    if ((payload.full_name || '').trim().length < 3) fields.full_name = 'Enter your full name.'
    if (!/^0\d{10}$/.test((payload.phone || '').trim())) fields.phone = 'Enter an 11-digit phone number starting with 0.'
    if (Object.keys(fields).length) throw new ApiError(400, 'VALIDATION_FAILED', 'Please fix the fields below.', fields)
    user.full_name = payload.full_name.trim()
    user.department = (payload.department || '').trim()
    user.phone = payload.phone.trim()
    saveStore(store)
    if (user.role === 'student') {
      for (const item of store.items) {
        if (item.reporter_id === user.id) item.reporter.full_name = user.full_name
      }
      saveStore(store)
    }
    return publicUser(user)
  },

  async changePassword(token, { current_password, new_password }) {
    await wait()
    const store = loadStore()
    const user = requireUser(store, token)
    if (user.demoPassword !== current_password) {
      throw new ApiError(400, 'WRONG_PASSWORD', 'Your current password is not correct.', {
        current_password: 'That is not your current password.',
      })
    }
    if ((new_password || '').length < 8) {
      throw new ApiError(400, 'VALIDATION_FAILED', 'Please fix the fields below.', {
        new_password: 'Use at least 8 characters.',
      })
    }
    user.demoPassword = new_password
    saveStore(store)
    return { ok: true }
  },

  /* ---- items ---- */
  async items(params = {}) {
    await wait()
    const store = loadStore()
    const { type, q, category_id, location, from, to, status, reporter_id, includeArchived = false } = params
    const needle = (q || '').trim().toLowerCase()

    const rows = store.items
      .filter((item) => (includeArchived ? true : !item.is_archived))
      .filter((item) => (reporter_id ? item.reporter_id === reporter_id : true))
      .filter((item) => (type ? item.type === type : true))
      .filter((item) => (category_id ? String(item.category_id) === String(category_id) : true))
      .filter((item) => (status ? item.status === status : true))
      .filter((item) => (location ? item.location.toLowerCase().includes(location.toLowerCase()) : true))
      .filter((item) => (from ? item.occurred_on >= from : true))
      .filter((item) => (to ? item.occurred_on <= to : true))
      .filter((item) => (needle ? `${item.title} ${item.description}`.toLowerCase().includes(needle) : true))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return clone(
      rows.map((item) => ({
        ...withCategoryName(store, item),
        claim_count: store.claims.filter((c) => c.item_id === item.id).length,
      }))
    )
  },

  async item(id, token) {
    await wait()
    const store = loadStore()
    const viewer = tokenToUser(store, token)
    const item = store.items.find((i) => i.id === id)
    if (!item) throw new ApiError(404, 'NOT_FOUND', 'That item does not exist.')
    if (item.is_archived && !(viewer && viewer.role === 'admin')) {
      throw new ApiError(404, 'NOT_FOUND', 'That item does not exist.')
    }
    return clone(decorateItem(store, item, viewer))
  },

  async createItem(token, payload) {
    await wait(320)
    const store = loadStore()
    const user = requireUser(store, token)
    validateItemPayload(payload)
    const newItem = {
      id: `i${Date.now()}`,
      type: payload.type === 'lost' ? 'lost' : 'found',
      title: payload.title.trim(),
      category_id: Number(payload.category_id),
      description: payload.description.trim(),
      occurred_on: payload.occurred_on,
      location: payload.location.trim(),
      photo_url: payload.photo_url || '',
      is_archived: false,
      status: 'OPEN',
      reporter: { id: user.id, full_name: user.full_name },
      reporter_id: user.id,
      created_at: new Date().toISOString(),
    }
    store.items.unshift(newItem)
    saveStore(store)
    return clone(decorateItem(store, newItem, user))
  },

  async updateItem(token, id, payload) {
    await wait()
    const store = loadStore()
    const user = requireUser(store, token)
    const item = store.items.find((i) => i.id === id)
    if (!item) throw new ApiError(404, 'NOT_FOUND', 'That item does not exist.')
    if (item.reporter_id !== user.id) throw new ApiError(403, 'FORBIDDEN', 'You can only edit your own reports.')
    if (item.status !== 'OPEN') throw new ApiError(409, 'ITEM_LOCKED', 'This report is locked because a claim has been made.')
    validateItemPayload({ ...item, ...payload })
    Object.assign(item, {
      title: payload.title.trim(),
      category_id: Number(payload.category_id),
      description: payload.description.trim(),
      occurred_on: payload.occurred_on,
      location: payload.location.trim(),
      photo_url: payload.photo_url || '',
    })
    saveStore(store)
    return clone(decorateItem(store, item, user))
  },

  async deleteItem(token, id) {
    await wait()
    const store = loadStore()
    const user = requireUser(store, token)
    const item = store.items.find((i) => i.id === id)
    if (!item) throw new ApiError(404, 'NOT_FOUND', 'That item does not exist.')
    if (item.reporter_id !== user.id) throw new ApiError(403, 'FORBIDDEN', 'You can only delete your own reports.')
    if (item.status !== 'OPEN') throw new ApiError(409, 'ITEM_LOCKED', 'This report is locked because a claim has been made.')
    store.items = store.items.filter((i) => i.id !== id)
    saveStore(store)
    return { ok: true }
  },

  /* ---- claims ---- */
  async submitClaim(token, itemId, { proof, serial_reference }) {
    await wait(320)
    const store = loadStore()
    const user = requireUser(store, token)
    const item = store.items.find((i) => i.id === itemId)
    if (!item) throw new ApiError(404, 'NOT_FOUND', 'That item does not exist.')
    if (item.reporter_id === user.id) throw new ApiError(409, 'OWN_ITEM', 'You cannot claim an item you reported.')
    if (item.is_archived) throw new ApiError(409, 'ITEM_ARCHIVED', 'This item has been archived.')
    if (item.status === 'RETURNED') throw new ApiError(409, 'ITEM_RETURNED', 'This item has already been returned.')
    if (item.status === 'CLAIM_PENDING') throw new ApiError(409, 'CLAIM_EXISTS', 'Someone has already claimed this item. Wait for the admin decision.')
    if (store.claims.some((c) => c.item_id === itemId && c.claimant_id === user.id)) {
      throw new ApiError(409, 'CLAIM_ALREADY_EXISTS', 'You have already claimed this item. A decision is final (FR-34).')
    }
    const text = (proof || '').trim()
    if (text.length < 30) {
      throw new ApiError(400, 'VALIDATION_FAILED', 'Please fix the fields below.', {
        proof: 'Write at least 30 characters explaining why this is yours.',
      })
    }
    if (text.length > 1000) {
      throw new ApiError(400, 'VALIDATION_FAILED', 'Please fix the fields below.', {
        proof: 'Keep the proof under 1000 characters.',
      })
    }

    // Both writes happen together, like a database transaction.
    const claim = {
      id: `c${Date.now()}`,
      item_id: itemId,
      claimant_id: user.id,
      status: 'PENDING',
      proof: text,
      serial_reference: (serial_reference || '').trim() || null,
      rejection_reason: null,
      created_at: new Date().toISOString(),
      decided_at: null,
    }
    store.claims.push(claim)
    item.status = 'CLAIM_PENDING'
    saveStore(store)
    return clone(claim)
  },

  async myClaims(token) {
    await wait()
    const store = loadStore()
    const user = requireUser(store, token)
    return clone(
      store.claims
        .filter((c) => c.claimant_id === user.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((c) => {
          const item = store.items.find((i) => i.id === c.item_id)
          const reporter = item ? store.users.find((u) => u.id === item.reporter_id) : null
          return {
            ...c,
            item: item ? withCategoryName(store, item) : null,
            contact: c.status === 'APPROVED' && reporter ? contactOf(reporter) : null,
          }
        })
    )
  },

  /* ---- admin ---- */
  async adminStats(token) {
    await wait(120)
    const store = loadStore()
    requireAdmin(store, token)
    const live = store.items.filter((i) => !i.is_archived)
    return {
      open: live.filter((i) => i.status === 'OPEN').length,
      pending: store.claims.filter((c) => c.status === 'PENDING').length,
      returned: live.filter((i) => i.status === 'RETURNED').length,
    }
  },

  async adminClaims(token, status = 'PENDING') {
    await wait()
    const store = loadStore()
    requireAdmin(store, token)
    return clone(
      store.claims
        .filter((c) => (status === 'ALL' ? true : c.status === status))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((c) => {
          const item = store.items.find((i) => i.id === c.item_id)
          const claimant = store.users.find((u) => u.id === c.claimant_id)
          return {
            ...c,
            item: item ? withCategoryName(store, item) : null,
            claimant: claimant ? publicUser(claimant) : null,
          }
        })
    )
  },

  async adminClaim(token, id) {
    await wait()
    const store = loadStore()
    requireAdmin(store, token)
    const claim = store.claims.find((c) => c.id === id)
    if (!claim) throw new ApiError(404, 'NOT_FOUND', 'That claim does not exist.')
    const item = store.items.find((i) => i.id === claim.item_id)
    const claimant = store.users.find((u) => u.id === claim.claimant_id)
    const reporter = item ? store.users.find((u) => u.id === item.reporter_id) : null
    return clone({
      ...claim,
      item: item ? withCategoryName(store, item) : null,
      claimant: claimant ? publicUser(claimant) : null,
      reporter: reporter ? publicUser(reporter) : null,
      previous_claims: store.claims.filter((c) => c.claimant_id === claim.claimant_id).length,
    })
  },

  async decideClaim(token, id, { decision, reason }) {
    await wait(320)
    const store = loadStore()
    requireAdmin(store, token)
    const claim = store.claims.find((c) => c.id === id)
    if (!claim) throw new ApiError(404, 'NOT_FOUND', 'That claim does not exist.')
    if (claim.status !== 'PENDING') throw new ApiError(409, 'ALREADY_DECIDED', 'This claim has already been decided.')
    const item = store.items.find((i) => i.id === claim.item_id)

    if (decision === 'approve') {
      claim.status = 'APPROVED'
      claim.decided_at = new Date().toISOString()
      if (item) item.status = 'RETURNED'
      saveStore(store)
      return clone(claim)
    }

    if (decision === 'reject') {
      const text = (reason || '').trim()
      if (text.length < 10) {
        throw new ApiError(400, 'VALIDATION_FAILED', 'A rejection needs a written reason.', {
          reason: 'Write at least 10 characters so the student understands why.',
        })
      }
      claim.status = 'REJECTED'
      claim.rejection_reason = text
      claim.decided_at = new Date().toISOString()
      if (item && item.status === 'CLAIM_PENDING') item.status = 'OPEN'
      saveStore(store)
      return clone(claim)
    }

    throw new ApiError(400, 'BAD_DECISION', 'Decision must be approve or reject.')
  },

  async adminItems(token, params = {}) {
    await wait()
    const store = loadStore()
    requireAdmin(store, token)
    const rows = await mockApi.items({ ...params, includeArchived: Boolean(params.showArchived) })
    return rows
  },

  async setArchived(token, id, archived) {
    await wait()
    const store = loadStore()
    requireAdmin(store, token)
    const item = store.items.find((i) => i.id === id)
    if (!item) throw new ApiError(404, 'NOT_FOUND', 'That item does not exist.')
    item.is_archived = Boolean(archived)
    saveStore(store)
    return clone(decorateItem(store, item, null))
  },
}

/* ---------------- real API (Phase 4) ---------------- */

async function request(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.code || 'REQUEST_FAILED',
      payload?.error?.message || 'The request failed. Please try again.',
      payload?.error?.fields || null
    )
  }
  return payload
}

const httpApi = {
  health: () => request('/health'),
  categories: () => request('/categories'),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  updateProfile: (token, payload) => request('/users/me', { method: 'PATCH', body: payload, token }),
  changePassword: (token, payload) => request('/users/me/password', { method: 'PATCH', body: payload, token }),
  items: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString()
    return request(`/items${query ? `?${query}` : ''}`)
  },
  item: (id, token) => request(`/items/${id}`, { token }),
  createItem: (token, payload) => request('/items', { method: 'POST', body: payload, token }),
  updateItem: (token, id, payload) => request(`/items/${id}`, { method: 'PATCH', body: payload, token }),
  deleteItem: (token, id) => request(`/items/${id}`, { method: 'DELETE', token }),
  submitClaim: (token, itemId, payload) => request(`/items/${itemId}/claims`, { method: 'POST', body: payload, token }),
  myClaims: (token) => request('/claims/mine', { token }),
  adminStats: (token) => request('/admin/stats', { token }),
  adminClaims: (token, status = 'PENDING') => request(`/admin/claims?status=${status}`, { token }),
  adminClaim: (token, id) => request(`/admin/claims/${id}`, { token }),
  decideClaim: (token, id, payload) => request(`/admin/claims/${id}`, { method: 'PATCH', body: payload, token }),
  adminItems: (token, params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString()
    return request(`/admin/items${query ? `?${query}` : ''}`, { token })
  },
  setArchived: (token, id, archived) =>
    request(`/admin/items/${id}`, { method: 'PATCH', body: { is_archived: archived }, token }),
}

export const api = USE_MOCK ? mockApi : httpApi
