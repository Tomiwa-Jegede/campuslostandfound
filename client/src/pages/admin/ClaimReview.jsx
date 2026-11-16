import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAsync } from '../../lib/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { formatDate, timeAgo } from '../../lib/format.js'
import Button from '../../components/ui/Button.jsx'
import Textarea from '../../components/ui/Textarea.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import Skeleton from '../../components/ui/Skeleton.jsx'
import { StatusBadge, TypeBadge } from '../../components/ui/StatusBadge.jsx'

export default function ClaimReview() {
  const { id } = useParams()
  const { token } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const claim = useAsync(() => api.adminClaim(token, id), [token, id])

  const [approveOpen, setApproveOpen] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [busy, setBusy] = useState(false)

  if (claim.loading) {
    return <Skeleton variant="line" count={6} />
  }

  if (claim.error) {
    return (
      <div className="notice notice-danger">
        <div>
          <h3>We could not open this claim</h3>
          <p className="small mt8">{claim.error.message}</p>
          <Button variant="secondary" size="sm" className="mt8" onClick={claim.reload}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  const data = claim.data
  const decided = data.status !== 'PENDING'

  const decide = async (decision, text = '') => {
    setBusy(true)
    setReasonError('')
    try {
      await api.decideClaim(token, id, { decision, reason: text })
      toast.success(decision === 'approve' ? 'Claim approved. The item is marked returned.' : 'Claim rejected.')
      navigate('/admin')
    } catch (error) {
      if (error.fields?.reason) setReasonError(error.fields.reason)
      else toast.error(error.message)
      setBusy(false)
    }
  }

  const submitRejection = () => {
    if (reason.trim().length < 10) {
      setReasonError('Write at least 10 characters so the student understands why.')
      return
    }
    decide('reject', reason)
  }

  return (
    <>
      <p className="small">
        <Link to="/admin/claims">← All claims</Link>
      </p>

      <div className="page-head mt8">
        <div>
          <h1>Claim review</h1>
          <p className="muted">
            Submitted {timeAgo(data.created_at)} by {data.claimant?.full_name}
          </p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      <div className="detail-grid">
        <section className="card card-pad">
          <h2 style={{ fontSize: 17 }}>The item</h2>
          <img className="detail-photo mt8" src={data.item?.photo_url} alt={data.item?.title} />
          <div className="row wrap mt8" style={{ gap: 6 }}>
            {data.item ? <TypeBadge type={data.item.type} /> : null}
            {data.item ? <StatusBadge status={data.item.status} type={data.item.type} /> : null}
          </div>
          <h3 className="mt8">{data.item?.title}</h3>
          <dl className="facts mt8" style={{ gridTemplateColumns: '110px 1fr', fontSize: 14 }}>
            <dt>Category</dt>
            <dd>{data.item?.category_name}</dd>
            <dt>Location</dt>
            <dd>{data.item?.location}</dd>
            <dt>{data.item?.type === 'lost' ? 'Date lost' : 'Date found'}</dt>
            <dd>{formatDate(data.item?.occurred_on)}</dd>
          </dl>
          <p className="label mt16">Public description</p>
          <p className="prose small">{data.item?.description}</p>
        </section>

        <section className="card card-pad">
          <h2 style={{ fontSize: 17 }}>The claimant</h2>
          <dl className="kv mt8">
            <dt>Name</dt>
            <dd>{data.claimant?.full_name}</dd>
            <dt>Matric no.</dt>
            <dd className="mono">{data.claimant?.matric_no}</dd>
            <dt>Department</dt>
            <dd>{data.claimant?.department}</dd>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${data.claimant?.email}`}>{data.claimant?.email}</a>
            </dd>
            <dt>Phone</dt>
            <dd>
              <a href={`tel:${data.claimant?.phone}`}>{data.claimant?.phone}</a>
            </dd>
            <dt>Claims made</dt>
            <dd>{data.previous_claims} in total, including rejected ones</dd>
          </dl>

          <div className="notice notice-info mt16">
            <div>
              <h3>Before you decide</h3>
              <p className="small mt8">
                The proof must describe something the public report does not. A claim that only repeats the public
                description is not proof.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="card card-pad mt24">
        <h2 style={{ fontSize: 17 }}>The proof</h2>
        <p className="quote mt8">{data.proof}</p>
        {data.serial_reference ? (
          <p className="small mt8">
            Reference given: <span className="mono">{data.serial_reference}</span>
          </p>
        ) : (
          <p className="small mt8">No serial number or receipt reference was given.</p>
        )}
      </section>

      {decided ? (
        <div className={`notice ${data.status === 'APPROVED' ? 'notice-ok' : 'notice-warn'} mt24`}>
          <div>
            <h3>{data.status === 'APPROVED' ? 'This claim was approved' : 'This claim was rejected'}</h3>
            <p className="small mt8">
              {data.status === 'APPROVED'
                ? 'The item is marked returned and both parties can now see each other’s contact details.'
                : data.rejection_reason}
            </p>
            <p className="small mt8">Decided {data.decided_at ? timeAgo(data.decided_at) : ''}.</p>
          </div>
        </div>
      ) : (
        <section className="card card-pad mt24">
          <h2 style={{ fontSize: 17 }}>Your decision</h2>
          <p className="small mt8">
            Approving marks the item returned and releases contact details. Rejecting returns the item to the open
            pool and blocks this student from claiming it again.
          </p>

          {!rejecting ? (
            <div className="row wrap mt16">
              <Button onClick={() => setApproveOpen(true)}>Approve claim</Button>
              <Button variant="secondary" onClick={() => setRejecting(true)}>
                Reject with a reason
              </Button>
            </div>
          ) : (
            <div className="mt16" style={{ maxWidth: 640 }}>
              <Textarea
                label="Reason for rejection"
                required
                rows={4}
                maxLength={500}
                showCount
                placeholder="Say what was missing or did not match. The student will read this."
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value)
                  setReasonError('')
                }}
                error={reasonError}
                hint="Required. At least 10 characters."
              />
              <div className="row wrap">
                <Button variant="danger" onClick={submitRejection} loading={busy} disabled={reason.trim().length < 10}>
                  Confirm rejection
                </Button>
                <Button variant="ghost" onClick={() => setRejecting(false)} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      <ConfirmDialog
        open={approveOpen}
        title="Approve this claim?"
        description={`The item “${data.item?.title}” will be marked returned, and both you and the claimant will see the reporter’s phone number and email. This cannot be undone from the dashboard.`}
        confirmLabel="Approve claim"
        tone="primary"
        loading={busy}
        onConfirm={() => decide('approve')}
        onCancel={() => setApproveOpen(false)}
      />
    </>
  )
}
