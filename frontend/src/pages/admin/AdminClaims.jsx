import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAsync } from '../../lib/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { timeAgo } from '../../lib/format.js'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'

const TABS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'ALL', label: 'All' },
]

export default function AdminClaims() {
  const { token } = useAuth()
  const [status, setStatus] = useState('PENDING')
  const data = useAsync(() => api.adminClaims(token, status), [token, status])
  const rows = data.data || []

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Claims</h1>
          <p className="muted">Every claim, by decision.</p>
        </div>
      </div>

      <div className="chip-row">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`chip${status === tab.key ? ' chip-active' : ''}`}
            onClick={() => setStatus(tab.key)}
            aria-pressed={status === tab.key}
          >
            {tab.label}
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
            <h3>We could not load the claims</h3>
            <p className="small mt8">{data.error.message}</p>
            <Button variant="secondary" size="sm" className="mt8" onClick={data.reload}>
              Try again
            </Button>
          </div>
        </div>
      ) : null}

      {!data.loading && !data.error && rows.length === 0 ? (
        <EmptyState
          title={status === 'PENDING' ? 'No claims are waiting.' : 'Nothing here yet.'}
          description={
            status === 'PENDING'
              ? 'When a student claims an item, it appears in this list for review.'
              : 'Claims move here once a decision has been made.'
          }
        />
      ) : null}

      {!data.loading && !data.error && rows.length > 0 ? (
        <div className="list mt16">
          {rows.map((claim) => (
            <div className="list-row" key={claim.id}>
              <img className="list-thumb" src={claim.item?.photo_url} alt="" />
              <div className="list-main">
                <Link className="list-title" to={`/admin/claims/${claim.id}`}>
                  {claim.item?.title || 'Item removed'}
                </Link>
                <p className="list-sub">
                  {claim.claimant?.full_name} · <span className="mono">{claim.claimant?.matric_no}</span> ·{' '}
                  {timeAgo(claim.created_at)}
                </p>
              </div>
              <StatusBadge status={claim.status} />
              <div className="list-actions">
                <Link className="btn btn-secondary btn-sm" to={`/admin/claims/${claim.id}`}>
                  {claim.status === 'PENDING' ? 'Review' : 'Open'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </>
  )
}
