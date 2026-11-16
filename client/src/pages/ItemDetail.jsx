import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAsync } from '../lib/useAsync.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { formatDate, timeAgo } from '../lib/format.js'
import { StatusBadge, TypeBadge } from '../components/ui/StatusBadge.jsx'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import NotFound from './NotFound.jsx'

export default function ItemDetail() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const item = useAsync(() => api.item(id, token), [id, token])

  if (item.loading) {
    return (
      <div className="container page">
        <Skeleton variant="card" count={1} />
        <div className="mt16">
          <Skeleton variant="line" count={4} />
        </div>
      </div>
    )
  }

  if (item.error) {
    if (item.error.status === 404) return <NotFound />
    return (
      <div className="container page">
        <div className="notice notice-danger">
          <div>
            <h3>We could not open this item</h3>
            <p className="small mt8">{item.error.message}</p>
            <Button variant="secondary" size="sm" className="mt8" onClick={item.reload}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const data = item.data
  const dateLabel = data.type === 'lost' ? 'Date lost' : 'Date found'
  const backTo = data.type === 'lost' ? '/lost' : '/found'

  const remove = async () => {
    setDeleting(true)
    try {
      await api.deleteItem(token, data.id)
      toast.success('Your report was deleted.')
      navigate('/my-reports')
    } catch (error) {
      toast.error(error.message)
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="container page">
      <p className="small">
        <Link to={backTo}>← Back to {data.type === 'lost' ? 'lost' : 'found'} items</Link>
      </p>

      <div className="detail-grid mt16">
        <img className="detail-photo" src={data.photo_url} alt={data.title} />

        <div>
          <div className="row wrap" style={{ gap: 8 }}>
            <TypeBadge type={data.type} />
            <StatusBadge status={data.status} type={data.type} />
            {data.is_archived ? <span className="badge badge-archived">Archived</span> : null}
          </div>

          <h1 className="mt8">{data.title}</h1>

          <dl className="facts mt16">
            <dt>Category</dt>
            <dd>{data.category_name}</dd>
            <dt>{dateLabel}</dt>
            <dd>{formatDate(data.occurred_on)}</dd>
            <dt>Location</dt>
            <dd>{data.location}</dd>
            <dt>Reported by</dt>
            <dd>{data.reporter.full_name}</dd>
            <dt>Reported</dt>
            <dd>{timeAgo(data.created_at)}</dd>
          </dl>

          <div className="mt16">{renderAction()}</div>
        </div>
      </div>

      <section className="section">
        <h2>Description</h2>
        <p className="prose mt8">{data.description}</p>
      </section>

      <div className="notice notice-info mt24">
        <div>
          <h3>Contact details stay private</h3>
          <p className="small mt8">
            The reporter’s phone number and email are never shown on this page. They are released to the two people
            involved only after a staff member approves a claim.
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Delete this report?"
        description={`“${data.title}” will be removed permanently. This cannot be undone.`}
        confirmLabel="Delete report"
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )

  function renderAction() {
    // Returned and approved: the two parties finally see each other's contact.
    if (data.contact) {
      return (
        <div className="contact-box">
          <h3>This item has been returned</h3>
          <p className="small mt8">Arrange collection directly with the other person.</p>
          <dl className="kv mt8">
            <dt>Name</dt>
            <dd>{data.contact.full_name}</dd>
            <dt>Phone</dt>
            <dd>
              <a href={`tel:${data.contact.phone}`}>{data.contact.phone}</a>
            </dd>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a>
            </dd>
          </dl>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="notice notice-info">
          <div>
            <h3>Is this yours?</h3>
            <p className="small mt8">Log in to claim this item. You will be asked to explain why it is yours.</p>
            <Link className="btn btn-primary btn-sm mt8" to={`/login?next=/items/${data.id}`}>
              Log in to claim this item
            </Link>
          </div>
        </div>
      )
    }

    if (data.is_owner) {
      if (data.status === 'OPEN') {
        return (
          <div className="row wrap">
            <Link className="btn btn-secondary" to={`/report?edit=${data.id}`}>
              Edit report
            </Link>
            <Button variant="danger" onClick={() => setConfirming(true)}>
              Delete report
            </Button>
          </div>
        )
      }
      return (
        <div className="notice notice-info">
          <div>
            <h3>A claim is under review</h3>
            <p className="small mt8">
              Your report is locked while a staff member decides. Editing and deleting are disabled until the decision
              is made.
            </p>
            <Link className="btn btn-secondary btn-sm mt8" to="/my-reports">
              Go to my reports
            </Link>
          </div>
        </div>
      )
    }

    if (data.my_claim?.status === 'PENDING') {
      return (
        <div className="notice notice-info">
          <div>
            <h3>Your claim is pending review</h3>
            <p className="small mt8">
              You will see the decision on your claims page. Contact details are released only if the claim is
              approved.
            </p>
            <Link className="btn btn-secondary btn-sm mt8" to="/my-claims">
              Go to my claims
            </Link>
          </div>
        </div>
      )
    }

    if (data.my_claim?.status === 'REJECTED') {
      return (
        <div className="notice notice-danger">
          <div>
            <h3>You already claimed this item</h3>
            <p className="small mt8">{data.my_claim.rejection_reason}</p>
            <p className="small mt8">
              A student may claim an item only once. This block cannot be removed from the website.
            </p>
          </div>
        </div>
      )
    }

    if (data.status === 'CLAIM_PENDING') {
      return (
        <div className="notice notice-info">
          <div>
            <h3>A claim is under review</h3>
            <p className="small mt8">
              Someone has claimed this item and a staff member is deciding. You cannot claim it while that is open.
            </p>
          </div>
        </div>
      )
    }

    if (data.status === 'RETURNED') {
      return (
        <div className="notice notice-ok">
          <div>
            <h3>This item has been returned</h3>
            <p className="small mt8">It went back to its owner, so it can no longer be claimed.</p>
          </div>
        </div>
      )
    }

    if (data.can_claim) {
      return (
        <div>
          <Link className="btn btn-primary btn-lg" to={`/items/${data.id}/claim`}>
            This is mine — claim it
          </Link>
          <p className="hint mt8">You will be asked for written proof. Only one claim can be open at a time.</p>
        </div>
      )
    }

    return null
  }
}
