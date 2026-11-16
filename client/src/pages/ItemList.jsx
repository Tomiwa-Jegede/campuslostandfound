import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAsync } from '../lib/useAsync.js'
import { plural } from '../lib/format.js'
import ItemCard from '../components/ItemCard.jsx'
import Button from '../components/ui/Button.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Select from '../components/ui/Select.jsx'
import Input from '../components/ui/Input.jsx'

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'CLAIM_PENDING', label: 'Claim pending' },
  { value: 'RETURNED', label: 'Returned' },
]

/** One component, two routes: /lost and /found differ only by `type`. */
export default function ItemList({ type }) {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const location = params.get('location') || ''
  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const status = params.get('status') || ''

  const [text, setText] = useState(q)
  const [sheetOpen, setSheetOpen] = useState(false)

  const categories = useAsync(() => api.categories(), [])
  const items = useAsync(
    () => api.items({ type, q, category_id: category, location, from, to, status }),
    [type, q, category, location, from, to, status]
  )

  // Search is debounced by 300 ms and written to the URL, so the back button works.
  useEffect(() => {
    setText(q)
  }, [q])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(params)
      if (text.trim()) next.set('q', text.trim())
      else next.delete('q')
      if (next.toString() !== params.toString()) setParams(next, { replace: true })
    }, 300)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const clearAll = () => setParams(new URLSearchParams(), { replace: true })

  const activeChips = useMemo(() => {
    const chips = []
    if (q) chips.push({ key: 'q', label: `“${q}”` })
    if (category) {
      const found = (categories.data || []).find((c) => String(c.id) === String(category))
      chips.push({ key: 'category', label: found ? found.name : 'Category' })
    }
    if (location) chips.push({ key: 'location', label: `Near ${location}` })
    if (from) chips.push({ key: 'from', label: `From ${from}` })
    if (to) chips.push({ key: 'to', label: `Until ${to}` })
    if (status) {
      chips.push({ key: 'status', label: STATUS_OPTIONS.find((s) => s.value === status)?.label || status })
    }
    return chips
  }, [q, category, location, from, to, status, categories.data])

  const noun = type === 'lost' ? 'lost' : 'found'
  const rows = items.data || []

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>{type === 'lost' ? 'Lost items' : 'Found items'}</h1>
          <p className="muted">
            {items.loading
              ? 'Loading…'
              : `${plural(rows.length, noun === 'lost' ? 'lost report' : 'found item')}${activeChips.length ? ' matching your filters' : ' waiting to be claimed'}`}
          </p>
        </div>
        <Link className="btn btn-primary" to={`/report?type=${type}`}>
          {type === 'lost' ? 'Report a lost item' : 'Report a found item'}
        </Link>
      </div>

      <div className="toolbar">
        <label className="sr-only" htmlFor="item-search">
          Search {noun} items
        </label>
        <input
          id="item-search"
          className="input"
          type="search"
          placeholder="Search title or description"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <select
          className="select"
          aria-label="Category"
          value={category}
          onChange={(event) => setParam('category', event.target.value)}
        >
          <option value="">All categories</option>
          {(categories.data || []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={() => setSheetOpen(true)}>
          Filters{activeChips.length ? ` (${activeChips.length})` : ''}
        </Button>
      </div>

      {activeChips.length ? (
        <div className="chips">
          {activeChips.map((chip) => (
            <span className="chip chip-active" key={chip.key}>
              {chip.label}
              <button type="button" aria-label={`Remove ${chip.label}`} onClick={() => setParam(chip.key, '')}>
                ×
              </button>
            </span>
          ))}
          <button type="button" className="chip" onClick={clearAll}>
            Clear all
          </button>
        </div>
      ) : null}

      {items.loading ? <Skeleton variant="card" count={8} /> : null}

      {items.error ? (
        <div className="notice notice-danger">
          <div>
            <h3>We could not load these items</h3>
            <p className="small mt8">{items.error.message}</p>
            <Button variant="secondary" size="sm" className="mt8" onClick={items.reload}>
              Try again
            </Button>
          </div>
        </div>
      ) : null}

      {!items.loading && !items.error && rows.length === 0 ? (
        activeChips.length ? (
          <EmptyState
            title="No items match these filters."
            description="Try a shorter search, a different category, or clear the filters to see everything."
            action={<Button variant="secondary" onClick={clearAll}>Clear all filters</Button>}
          />
        ) : (
          <EmptyState
            title={type === 'lost' ? 'No lost items have been reported yet.' : 'Nothing has been handed in yet.'}
            description={
              type === 'lost'
                ? 'When a student reports something missing, it appears here.'
                : 'If you find something on campus, reporting it here is the fastest way to get it back to its owner.'
            }
            action={
              <Link className="btn btn-primary" to={`/report?type=${type}`}>
                Report {noun === 'lost' ? 'a lost item' : 'a found item'}
              </Link>
            }
          />
        )
      ) : null}

      {!items.loading && !items.error && rows.length > 0 ? (
        <div className="grid-items">
          {rows.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}

      {sheetOpen ? (
        <div
          className="overlay"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setSheetOpen(false)}
        >
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="filters-title">
            <div className="sheet-head">
              <h2 id="filters-title">Filters</h2>
              <Button variant="ghost" size="sm" onClick={() => setSheetOpen(false)}>
                Close
              </Button>
            </div>

            <Input
              label="Where"
              placeholder="Library, cafeteria, bus stop"
              value={location}
              onChange={(event) => setParam('location', event.target.value)}
              hint="Matches the location written in the report."
            />
            <div className="row wrap" style={{ alignItems: 'flex-start' }}>
              <div className="grow">
                <Input
                  label={type === 'lost' ? 'Lost on or after' : 'Found on or after'}
                  type="date"
                  value={from}
                  onChange={(event) => setParam('from', event.target.value)}
                />
              </div>
              <div className="grow">
                <Input
                  label="On or before"
                  type="date"
                  value={to}
                  onChange={(event) => setParam('to', event.target.value)}
                />
              </div>
            </div>
            <Select
              label="Status"
              placeholder="Any status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(event) => setParam('status', event.target.value)}
            />

            <div className="row between mt16">
              <Button variant="ghost" onClick={() => { clearAll(); setSheetOpen(false) }}>
                Clear all
              </Button>
              <Button onClick={() => setSheetOpen(false)}>Show results</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
