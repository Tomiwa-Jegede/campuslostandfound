import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAsync } from '../../lib/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { timeAgo } from '../../lib/format.js'
import Button from '../../components/ui/Button.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'

export default function AdminDashboard() {
  const { token } = useAuth()
  const data = useAsync(
    () =>
      Promise.all([api.adminStats(token), api.adminClaims(token, 'PENDING')]).then(([stats, claims]) => ({
        stats,
        claims,
      })),
    [token]
  )

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Administrator dashboard</h1>
          <p className="muted">Claims waiting for a decision come first.</p>
        </div>
      </div>

      {data.loading ? <Skeleton variant="line" count={5} /> : null}

      {data.error ? (
        <div className="notice notice-danger">
          <div>
            <h3>We could not load the dashboard</h3>
            <p className="small mt8">{data.error.message}</p>
            <Button variant="secondary" size="sm" className="mt8" onClick={data.reload}>
              Try again
            </Button>
          </div>
        </div>
      ) : null}

      {!data.loading && !data.error ? (
        <>
          <section className="card" style={{ overflow: 'hidden' }}>
            <div className="card-head">
              <h2 style={{ fontSize: 17 }}>Pending claims</h2>
              <Link className="small" to="/admin/claims">
                All claims
              </Link>
            </div>

            {data.data.claims.length === 0 ? (
              <div style={{ padding: '32px 24px' }}>
                <h3>No claims are waiting.</h3>
                <p className="small mt8">
                  Nothing needs a decision right now. When a student claims an item, it appears here.
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Claimant</th>
                      <th>Submitted</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.claims.map((claim) => (
                      <tr key={claim.id}>
                        <td>
                          <div className="cell-item">
                            <img className="thumb" src={claim.item?.photo_url} alt="" />
                            <div>
                              <div className="strong">{claim.item?.title || 'Item removed'}</div>
                              <div className="small">{claim.item?.category_name}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="strong">{claim.claimant?.full_name}</div>
                          <div className="small mono">{claim.claimant?.matric_no}</div>
                        </td>
                        <td className="small">{timeAgo(claim.created_at)}</td>
                        <td>
                          <Link className="btn btn-primary btn-sm" to={`/admin/claims/${claim.id}`}>
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt24">
            <h2>Counts</h2>
            <div className="stats mt8">
              <div className="stat">
                <p className="n">{data.data.stats.open}</p>
                <p className="k">Open items</p>
              </div>
              <div className="stat">
                <p className="n">{data.data.stats.pending}</p>
                <p className="k">Pending claims</p>
              </div>
              <div className="stat">
                <p className="n">{data.data.stats.returned}</p>
                <p className="k">Returned items</p>
              </div>
            </div>
            <p className="small mt8">
              Counts ignore archived items, so the numbers match what students can still see.
            </p>
          </section>
        </>
      ) : null}
    </>
  )
}
