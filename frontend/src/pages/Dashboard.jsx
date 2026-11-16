import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAsync } from '../lib/useAsync.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatDate, plural, timeAgo } from '../lib/format.js'
import { StatusBadge, TypeBadge } from '../components/ui/StatusBadge.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'

export default function Dashboard() {
  const { user, token, isAdmin } = useAuth()
  const data = useAsync(
    () =>
      Promise.all([api.items({ reporter_id: user.id }), api.myClaims(token)]).then(([reports, claims]) => ({
        reports,
        claims,
      })),
    [user.id, token]
  )

  const reports = data.data?.reports || []
  const claims = data.data?.claims || []

  const rejected = claims.filter((c) => c.status === 'REJECTED')
  const approved = claims.filter((c) => c.status === 'APPROVED')
  const awaiting = claims.filter((c) => c.status === 'PENDING')

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <p className="small">Signed in as {user.email}</p>
          <h1>Hello, {user.full_name.split(' ')[0]}</h1>
        </div>
        <div className="row wrap">
          <Link className="btn btn-primary" to="/report?type=lost">
            Report a lost item
          </Link>
          <Link className="btn btn-secondary" to="/report?type=found">
            Report a found item
          </Link>
        </div>
      </div>

      {isAdmin ? (
        <div className="notice notice-info">
          <div>
            <h3>You are an administrator</h3>
            <p className="small mt8">
              Claims waiting for a decision are in the admin area.{' '}
              <Link to="/admin">Open the admin dashboard</Link>.
            </p>
          </div>
        </div>
      ) : null}

      {data.loading ? (
        <div className="stack mt16">
          <Skeleton variant="line" count={3} />
        </div>
      ) : null}

      {data.error ? (
        <div className="notice notice-danger mt16">
          <div>
            <h3>We could not load your summary</h3>
            <p className="small mt8">{data.error.message}</p>
            <Button variant="secondary" size="sm" className="mt8" onClick={data.reload}>
              Try again
            </Button>
          </div>
        </div>
      ) : null}

      {!data.loading && !data.error ? (
        <>
          {rejected.length || approved.length ? (
            <section className="stack mt16">
              <h2>Needs your attention</h2>
              {rejected.map((claim) => (
                <div className="notice notice-warn" key={claim.id}>
                  <div>
                    <h3>A claim was rejected</h3>
                    <p className="small mt8">
                      <strong>{claim.item?.title}</strong> — {claim.rejection_reason}
                    </p>
                    <Link className="btn btn-secondary btn-sm mt8" to="/my-claims">
                      Read the full reason
                    </Link>
                  </div>
                </div>
              ))}
              {approved.map((claim) => (
                <div className="notice notice-ok" key={claim.id}>
                  <div>
                    <h3>Your claim was approved</h3>
                    <p className="small mt8">
                      <strong>{claim.item?.title}</strong> — the finder’s phone number and email are now on your claims
                      page.
                    </p>
                    <Link className="btn btn-secondary btn-sm mt8" to="/my-claims">
                      See contact details
                    </Link>
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          <section className="mt24">
            <div className="stats">
              <div className="stat">
                <p className="n">{reports.filter((r) => r.status === 'OPEN').length}</p>
                <p className="k">Open reports</p>
              </div>
              <div className="stat">
                <p className="n">{awaiting.length}</p>
                <p className="k">Claims awaiting a decision</p>
              </div>
              <div className="stat">
                <p className="n">{approved.length}</p>
                <p className="k">Items returned to you</p>
              </div>
            </div>
          </section>

          <div className="detail-grid mt24" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <section>
              <div className="row between">
                <h2>Your recent reports</h2>
                <Link className="small" to="/my-reports">
                  See all
                </Link>
              </div>

              {reports.length === 0 ? (
                <EmptyState
                  title="You have not reported anything yet."
                  description="When you report a lost or found item, it appears here with its status."
                  action={
                    <Link className="btn btn-primary" to="/report">
                      Report an item
                    </Link>
                  }
                />
              ) : (
                <div className="list mt8">
                  {reports.slice(0, 4).map((item) => (
                    <div className="list-row" key={item.id}>
                      <img className="list-thumb" src={item.photo_url} alt="" />
                      <div className="list-main">
                        <Link className="list-title" to={`/items/${item.id}`}>
                          {item.title}
                        </Link>
                        <p className="list-sub">
                          <TypeBadge type={item.type} /> · {formatDate(item.occurred_on)}
                        </p>
                      </div>
                      <StatusBadge status={item.status} type={item.type} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="row between">
                <h2>Your recent claims</h2>
                <Link className="small" to="/my-claims">
                  See all
                </Link>
              </div>

              {claims.length === 0 ? (
                <EmptyState
                  title="No claims yet."
                  description="When you think an item is yours, open it and claim it with written proof."
                  action={
                    <Link className="btn btn-secondary" to="/found">
                      Browse found items
                    </Link>
                  }
                />
              ) : (
                <div className="list mt8">
                  {claims.slice(0, 4).map((claim) => (
                    <div className="list-row" key={claim.id}>
                      <img className="list-thumb" src={claim.item?.photo_url} alt="" />
                      <div className="list-main">
                        <Link className="list-title" to={`/items/${claim.item_id}`}>
                          {claim.item?.title || 'Item removed'}
                        </Link>
                        <p className="list-sub">Submitted {timeAgo(claim.created_at)}</p>
                      </div>
                      <StatusBadge status={claim.status} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <p className="small mt24">
            {plural(reports.length, 'report')} · {plural(claims.length, 'claim')}
          </p>
        </>
      ) : null}
    </div>
  )
}
