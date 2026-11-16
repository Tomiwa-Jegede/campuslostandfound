import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAsync } from '../lib/useAsync.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { formatDate } from '../lib/format.js'
import { fieldError, validateClaim } from '../lib/validation.js'
import Button from '../components/ui/Button.jsx'
import Textarea from '../components/ui/Textarea.jsx'
import Input from '../components/ui/Input.jsx'
import Checkbox from '../components/ui/Checkbox.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import { StatusBadge, TypeBadge } from '../components/ui/StatusBadge.jsx'
import NotFound from './NotFound.jsx'

export default function SubmitClaim() {
  const { id } = useParams()
  const { token } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const item = useAsync(() => api.item(id, token), [id, token])

  const [values, setValues] = useState({ proof: '', serial_reference: '', confirmed: false })
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [serverFields, setServerFields] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const client = validateClaim(values)
  const errorFor = (name) => ((touched[name] || submitted) ? fieldError(client, serverFields, name) : '')

  const change = (name) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setValues((v) => ({ ...v, [name]: value }))
    setServerFields((f) => ({ ...f, [name]: '' }))
    setFormError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(client).length) return

    setBusy(true)
    setFormError('')
    setServerFields({})
    try {
      await api.submitClaim(token, id, {
        proof: values.proof,
        serial_reference: values.serial_reference,
      })
      toast.success('Your claim was sent for review.')
      navigate('/my-claims')
    } catch (error) {
      if (error.fields) setServerFields(error.fields)
      else setFormError(error.message)
      setBusy(false)
    }
  }

  if (item.loading) {
    return (
      <div className="container page">
        <Skeleton variant="line" count={6} />
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

  if (!data.can_claim) {
    const reason = data.is_owner
      ? 'You reported this item, so you cannot claim it.'
      : data.my_claim
        ? data.my_claim.status === 'REJECTED'
          ? `You already claimed this item and the claim was rejected. ${data.my_claim.rejection_reason || ''}`
          : 'You have already claimed this item. A staff member is reviewing it.'
        : data.status === 'CLAIM_PENDING'
          ? 'Someone else has claimed this item and a decision is pending.'
          : data.status === 'RETURNED'
            ? 'This item has already been returned to its owner.'
            : data.is_archived
              ? 'This item has been archived.'
              : 'This item cannot be claimed at the moment.'

    return (
      <div className="container page">
        <div className="narrow">
          <h1>You cannot claim this item</h1>
          <div className="notice notice-warn mt16">
            <div>
              <h3>Here is why</h3>
              <p className="small mt8">{reason}</p>
              <Link className="btn btn-secondary btn-sm mt8" to={`/items/${id}`}>
                Back to the item
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container page">
      <p className="small">
        <Link to={`/items/${id}`}>← Back to the item</Link>
      </p>

      <div className="detail-grid mt16">
        <div>
          <h1>Claim this item</h1>
          <p className="muted mt8">
            Explain why this item is yours. A staff member reads this and compares it with the report before deciding.
          </p>

          <form className="card card-pad mt16" onSubmit={submit} noValidate>
            {formError ? <p className="form-error">{formError}</p> : null}

            <Textarea
              label="Proof of ownership"
              required
              rows={6}
              maxLength={1000}
              showCount
              placeholder="Describe the detail only the owner would know: a mark, a scratch, what was inside, a serial number, when and where you last had it."
              value={values.proof}
              onChange={change('proof')}
              onBlur={() => setTouched((t) => ({ ...t, proof: true }))}
              error={errorFor('proof')}
              hint="At least 30 characters. Do not include your password or bank details."
            />

            <Input
              label="Serial number or receipt reference (optional)"
              placeholder="Bookshop receipt 9912-A"
              value={values.serial_reference}
              onChange={change('serial_reference')}
              hint="If you have one. Optional, but it makes a decision easier."
            />

            <Checkbox
              label="I confirm this item is my property, and I understand that a decision is final."
              checked={values.confirmed}
              onChange={change('confirmed')}
              error={errorFor('confirmed')}
            />

            <div className="row wrap mt16">
              <Button type="submit" size="lg" loading={busy}>
                Send claim for review
              </Button>
              <Link className="btn btn-ghost" to={`/items/${id}`}>
                Cancel
              </Link>
            </div>
          </form>
        </div>

        <aside className="card card-pad">
          <h2 style={{ fontSize: 17 }}>What you are claiming</h2>
          <img className="detail-photo mt8" src={data.photo_url} alt={data.title} style={{ aspectRatio: '4 / 3' }} />
          <div className="row wrap mt8" style={{ gap: 6 }}>
            <TypeBadge type={data.type} />
            <StatusBadge status={data.status} type={data.type} />
          </div>
          <h3 className="mt8">{data.title}</h3>
          <dl className="facts mt8" style={{ gridTemplateColumns: '100px 1fr', fontSize: 14 }}>
            <dt>Category</dt>
            <dd>{data.category_name}</dd>
            <dt>Location</dt>
            <dd>{data.location}</dd>
            <dt>{data.type === 'lost' ? 'Date lost' : 'Date found'}</dt>
            <dd>{formatDate(data.occurred_on)}</dd>
            <dt>Reported by</dt>
            <dd>{data.reporter.full_name}</dd>
          </dl>

          <div className="notice notice-info mt16">
            <div>
              <h3>What happens next</h3>
              <ol className="small mt8" style={{ paddingLeft: 18 }}>
                <li>A staff member compares your proof with the report.</li>
                <li>If it is approved, the item goes back to you and both of you see each other’s phone and email.</li>
                <li>If it is rejected, you get the reason in writing.</li>
                <li>You can claim an item only once. A rejection is final.</li>
              </ol>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
