import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAsync } from '../lib/useAsync.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { formatDate, plural } from '../lib/format.js'
import { StatusBadge, TypeBadge } from '../components/ui/StatusBadge.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'lost', label: 'Lost' },
  { key: 'found', label: 'Found' },
  { key: 'open', label: 'Open' },
  { key: 'returned', label: 'Returned' },
]

export default function MyReports() {
  const { user, token } = useAuth()
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const data = useAsync(() => api.items({ reporter_id: user.id }), [user.id])
  const rows = data.data || []

  const visible = rows.filter((item) => {
    if (filter === 'all') return true
    if (filter === 'lost' || filter === 'found') return item.type === filter
    if (filter === 'open') return item.status === 'OPEN'
    if (filter === 'returned') return item.status === 'RETURNED'
    return true
  })

  const remove = async () => {
    setDeleting(true)
    try {
      await api.deleteItem(token, target.id)
      toast.success('Your report was deleted.')
      setTarget(null)
      data.reload()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>My reports</h1>
          <p className="muted">
            {data.loading ? 'Loading…' : `${plural(rows.length, 'report')} you have published.`}
          </p>
        </div>
        <Link className="btn btn-primary" to="/report">
          Report an item
        </Link>
      </div>

      <div className="chip-row">
        {FILTERS.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`chip${filter === option.key ? ' chip-active' : ''}`}
            onClick={() => setFilter(option.key)}
            aria-pressed={filter === option.key}
          >
            {option.label}
          </button>
        ))}
      </div>

      {data.loading ? (
        <div className="mt16">
          <Skeleton variant="line" count={4} />
        </div>
      ) : null}

      {data.error ? (
        <div className="notice notice-danger mt16">
          <div>
            <h3>We could not load your reports</h3>
            <p className="small mt8">{data.error.message}</p>
            <Button variant="secondary" size="sm" className="mt8" onClick={data.reload}>
              Try again
            </Button>
          </div>
        </div>
      ) : null}

      {!data.loading && !data.error && visible.length === 0 ? (
        <EmptyState
          title={rows.length === 0 ? 'You have not reported anything yet.' : 'Nothing matches this filter.'}
          description={
            rows.length === 0
              ? 'Reports you publish appear here with their status and any claims on them.'
              : 'Try another filter to see your other reports.'
          }
          action={
            rows.length === 0 ? (
              <Link className="btn btn-primary" to="/report">
                Report an item
              </Link>
            ) : (
              <Button variant="secondary" onClick={() => setFilter('all')}>
                Show all
              </Button>
            )
          }
        />
      ) : null}

      {!data.loading && !data.error && visible.length > 0 ? (
        <div className="list mt16">
          {visible.map((item) => {
            const locked = item.status !== 'OPEN' || item.claim_count > 0
            return (
              <div className="list-row" key={item.id}>
                <img className="list-thumb" src={item.photo_url} alt="" />
                <div className="list-main">
                  <Link className="list-title" to={`/items/${item.id}`}>
                    {item.title}
                  </Link>
                  <p className="list-sub row wrap" style={{ gap: 8 }}>
                    <TypeBadge type={item.type} />
                    <span>{formatDate(item.occurred_on)}</span>
                    <span>· {plural(item.claim_count, 'claim')}</span>
                  </p>
                </div>
                <StatusBadge status={item.status} type={item.type} />
                <div className="list-actions">
                  <Link className="btn btn-ghost btn-sm" to={`/items/${item.id}`}>
                    View
                  </Link>
                  {locked ? (
                    <span
                      className="small muted"
                      title="A report becomes read-only after the first claim is submitted (FR-16)."
                    >
                      ( locked )
                    </span>
                  ) : (
                    <>
                      <Link className="btn btn-secondary btn-sm" to={`/report?edit=${item.id}`}>
                        Edit
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => setTarget(item)}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      <p className="small mt16">
        A report becomes read-only as soon as someone claims it, so the details the claimant read cannot change
        underneath them.
      </p>

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete this report?"
        description={target ? `“${target.title}” will be removed permanently. This cannot be undone.` : ''}
        confirmLabel="Delete report"
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setTarget(null)}
      />
    </div>
  )
}
