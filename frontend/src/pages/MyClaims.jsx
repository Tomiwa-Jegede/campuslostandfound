import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAsync } from '../lib/useAsync.js'
import { useAuth } from '../context/AuthContext.jsx'
import { timeAgo } from '../lib/format.js'
import { StatusBadge } from '../components/ui/StatusBadge.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'

const waLink = (phone) => `https://wa.me/234${String(phone).replace(/^0/, '')}`

export default function MyClaims() {
  const { token } = useAuth()
  const data = useAsync(() => api.myClaims(token), [token])
  const rows = data.data || []

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>My claims</h1>
          <p className="muted">Every item you have claimed, and where each claim stands.</p>
        </div>
        <Link className="btn btn-secondary" to="/found">
          Browse found items
        </Link>
      </div>

      {data.loading ? (
        <div className="mt16">
          <Skeleton variant="line" count={4} />
        </div>
      ) : null}

      {data.error ? (
        <div className="notice notice-danger mt16">
          <div>
            <h3>We could not load your claims</h3>
            <p className="small mt8">{data.error.message}</p>
            <Button variant="secondary" size="sm" className="mt8" onClick={data.reload}>
              Try again
            </Button>
          </div>
        </div>
      ) : null}

      {!data.loading && !data.error && rows.length === 0 ? (
        <EmptyState
          title="You have not claimed anything yet."
          description="Found something that is yours? Open the item and explain why it belongs to you."
          action={
            <Link className="btn btn-primary" to="/found">
              Browse found items
            </Link>
          }
        />
      ) : null}

      {!data.loading && !data.error && rows.length > 0 ? (
        <div className="stack mt16">
          {rows.map((claim) => (
            <article className="card card-pad" key={claim.id}>
              <div className="row wrap between">
                <div className="row">
                  <img className="list-thumb" src={claim.item?.photo_url} alt="" />
                  <div>
                    <Link className="list-title" to={`/items/${claim.item_id}`}>
                      {claim.item?.title || 'Item removed'}
                    </Link>
                    <p className="list-sub">
                      {claim.item ? `${claim.item.category_name} · ${claim.item.location}` : 'This item is gone'}
                    </p>
                  </div>
                </div>
                <div className="row">
                  <StatusBadge status={claim.status} />
                  <span className="small">Submitted {timeAgo(claim.created_at)}</span>
                </div>
              </div>

              <p className="label mt16">The proof you sent</p>
              <p className="quote">{claim.proof}</p>
              {claim.serial_reference ? (
                <p className="small mt8">
                  Reference: <span className="mono">{claim.serial_reference}</span>
                </p>
              ) : null}

              {claim.status === 'PENDING' ? (
                <div className="notice notice-info mt16">
                  <div>
                    <h3>Waiting for a decision</h3>
                    <p className="small mt8">
                      A staff member will compare your proof with the item. Contact details are released only if the
                      claim is approved.
                    </p>
                  </div>
                </div>
              ) : null}

              {claim.status === 'REJECTED' ? (
                <div className="notice notice-danger mt16">
                  <div>
                    <h3>This claim was rejected</h3>
                    <p className="small mt8">{claim.rejection_reason}</p>
                    <p className="small mt8">
                      You cannot claim this item again. That rule is enforced in the database, not just on this page.
                    </p>
                  </div>
                </div>
              ) : null}

              {claim.contact ? (
                <div className="contact-box mt16">
                  <h3>Approved — here is how to collect it</h3>
                  <p className="small mt8">Contact the person who handed the item in.</p>
                  <dl className="kv mt8">
                    <dt>Name</dt>
                    <dd>{claim.contact.full_name}</dd>
                    <dt>Phone</dt>
                    <dd>
                      <a href={`tel:${claim.contact.phone}`}>{claim.contact.phone}</a>{' '}
                      <a className="small" href={waLink(claim.contact.phone)} target="_blank" rel="noreferrer">
                        WhatsApp
                      </a>
                    </dd>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${claim.contact.email}`}>{claim.contact.email}</a>
                    </dd>
                  </dl>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
