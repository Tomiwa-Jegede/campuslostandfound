import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAsync } from '../../lib/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { formatDate, plural } from '../../lib/format.js'
import { StatusBadge, TypeBadge } from '../../components/ui/StatusBadge.jsx'
import Button from '../../components/ui/Button.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'

export default function ManageItems() {
  const { token } = useAuth()
  const toast = useToast()

  const [filters, setFilters] = useState({ q: '', type: '', status: '', category_id: '', showArchived: false })
  const [target, setTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  const categories = useAsync(() => api.categories(), [])
  const data = useAsync(
    () =>
      api.adminItems(token, {
        q: filters.q,
        type: filters.type,
        status: filters.status,
        category_id: filters.category_id,
        showArchived: filters.showArchived,
      }),
    [token, filters.q, filters.type, filters.status, filters.category_id, filters.showArchived]
  )

  const rows = data.data || []

  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setFilters((f) => ({ ...f, [key]: value }))
  }

  const toggleArchive = async () => {
    if (!target) return
    setBusy(true)
    try {
      await api.setArchived(token, target.id, !target.is_archived)
      toast.success(target.is_archived ? 'Item restored to public listings.' : 'Item archived.')
      setTarget(null)
      data.reload()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Items</h1>
          <p className="muted">Every report, including archived ones. Archiving hides an item without deleting it.</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="input"
          type="search"
          placeholder="Search title or description"
          aria-label="Search items"
          value={filters.q}
          onChange={set('q')}
        />
        <select className="select" aria-label="Type" value={filters.type} onChange={set('type')}>
          <option value="">All types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <select className="select" aria-label="Status" value={filters.status} onChange={set('status')}>
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="CLAIM_PENDING">Claim pending</option>
          <option value="RETURNED">Returned</option>
        </select>
        <select className="select" aria-label="Category" value={filters.category_id} onChange={set('category_id')}>
          <option value="">All categories</option>
          {(categories.data || []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="check" style={{ minHeight: 44 }}>
          <input type="checkbox" checked={filters.showArchived} onChange={set('showArchived')} />
          <span>Show archived</span>
        </label>
      </div>

      {data.loading ? (
        <div className="mt16">
          <Skeleton variant="line" count={5} />
        </div>
      ) : null}

      {data.error ? (
        <div className="notice notice-danger">
          <div>
            <h3>We could not load the items</h3>
            <p className="small mt8">{data.error.message}</p>
            <Button variant="secondary" size="sm" className="mt8" onClick={data.reload}>
              Try again
            </Button>
          </div>
        </div>
      ) : null}

      {!data.loading && !data.error && rows.length === 0 ? (
        <EmptyState
          title="No items match these filters."
          description="Try a shorter search, or turn on “Show archived” to include hidden items."
          action={
            <Button
              variant="secondary"
              onClick={() => setFilters({ q: '', type: '', status: '', category_id: '', showArchived: false })}
            >
              Clear filters
            </Button>
          }
        />
      ) : null}

      {!data.loading && !data.error && rows.length > 0 ? (
        <>
          <p className="small mt8">{plural(rows.length, 'item')}</p>
          <div className="list">
            {rows.map((item) => (
              <div className="list-row" key={item.id}>
                <img className="list-thumb" src={item.photo_url} alt="" />
                <div className="list-main">
                  <Link className="list-title" to={`/items/${item.id}`}>
                    {item.title}
                  </Link>
                  <p className="list-sub row wrap" style={{ gap: 8 }}>
                    <TypeBadge type={item.type} />
                    <span>{item.category_name}</span>
                    <span>·</span>
                    <span>{formatDate(item.occurred_on)}</span>
                    <span>·</span>
                    <span>
                      {plural(item.claim_count, 'claim')}
                    </span>
                  </p>
                </div>
                <div className="row wrap" style={{ gap: 6 }}>
                  <StatusBadge status={item.status} type={item.type} />
                  {item.is_archived ? <span className="badge badge-archived">Archived</span> : null}
                </div>
                <div className="list-actions">
                  <Link className="btn btn-ghost btn-sm" to={`/items/${item.id}`}>
                    View
                  </Link>
                  {item.is_archived ? (
                    <Button variant="secondary" size="sm" onClick={() => setTarget(item)}>
                      Restore
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setTarget(item)}>
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <ConfirmDialog
        open={Boolean(target)}
        title={target?.is_archived ? 'Restore this item?' : 'Archive this item?'}
        description={
          target?.is_archived
            ? `“${target?.title}” will appear in public listings again.`
            : `“${target?.title}” will disappear from public listings. The claim history is kept, and you can undo this at any time.`
        }
        confirmLabel={target?.is_archived ? 'Restore item' : 'Archive item'}
        tone={target?.is_archived ? 'primary' : 'danger'}
        loading={busy}
        onConfirm={toggleArchive}
        onCancel={() => setTarget(null)}
      />
    </>
  )
}
