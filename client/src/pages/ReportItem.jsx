import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAsync } from '../lib/useAsync.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { today } from '../lib/format.js'
import { fieldError, validateItem } from '../lib/validation.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Textarea from '../components/ui/Textarea.jsx'
import PhotoUploader from '../components/PhotoUploader.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'

const EMPTY = {
  type: 'found',
  title: '',
  category_id: '',
  description: '',
  occurred_on: today(),
  location: '',
  photo_url: '',
}

export default function ReportItem() {
  const [params] = useSearchParams()
  const editId = params.get('edit')
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const toast = useToast()

  const categories = useAsync(() => api.categories(), [])
  const existing = useAsync(() => (editId ? api.item(editId, token) : Promise.resolve(null)), [editId, token])

  const [values, setValues] = useState(() => ({
    ...EMPTY,
    type: params.get('type') === 'lost' ? 'lost' : 'found',
  }))
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [serverFields, setServerFields] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const data = existing.data
    if (!data) return
    setValues({
      type: data.type,
      title: data.title,
      category_id: String(data.category_id),
      description: data.description,
      occurred_on: data.occurred_on,
      location: data.location,
      photo_url: data.photo_url || '',
    })
  }, [existing.data])

  const client = validateItem(values)
  const errorFor = (name) => ((touched[name] || submitted) ? fieldError(client, serverFields, name) : '')

  const change = (name) => (event) => {
    setValues((v) => ({ ...v, [name]: event.target.value }))
    setServerFields((f) => ({ ...f, [name]: '' }))
    setFormError('')
  }
  const blur = (name) => () => setTouched((t) => ({ ...t, [name]: true }))

  const submit = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(client).length) return

    setBusy(true)
    setFormError('')
    setServerFields({})
    const payload = { ...values, category_id: Number(values.category_id) }
    try {
      const saved = editId ? await api.updateItem(token, editId, payload) : await api.createItem(token, payload)
      toast.success(editId ? 'Your report was updated.' : 'Your report is published.')
      navigate(`/items/${saved.id}`)
    } catch (error) {
      if (error.fields) setServerFields(error.fields)
      else setFormError(error.message)
      setBusy(false)
    }
  }

  if (editId && existing.loading) {
    return (
      <div className="container page">
        <Skeleton variant="line" count={6} />
      </div>
    )
  }

  if (editId && existing.data && (!existing.data.is_owner || !existing.data.can_edit)) {
    return (
      <div className="container page">
        <div className="narrow">
          <h1>This report cannot be edited</h1>
          <div className="notice notice-warn mt16">
            <div>
              <h3>It is locked</h3>
              <p className="small mt8">
                A report can only be edited by its owner, while it is open and no claim has been made. Once a claim
                exists, the details must stay exactly as the claimant read them.
              </p>
              <Link className="btn btn-secondary btn-sm mt8" to={`/items/${editId}`}>
                Back to the item
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isLost = values.type === 'lost'
  const dateLabel = isLost ? 'Date lost' : 'Date found'
  const locationLabel = isLost ? 'Where did you last see it?' : 'Where did you find it?'
  const locationPlaceholder = isLost ? 'Library, 2nd floor' : 'Cafeteria table'
  const submitLabel = editId ? 'Save changes' : isLost ? 'Publish lost report' : 'Publish found report'

  return (
    <div className="container page">
      <div className="narrow">
        <p className="small">
          <Link to="/dashboard">← Back to dashboard</Link>
        </p>
        <h1 className="mt8">{editId ? 'Edit your report' : 'Report an item'}</h1>
        <p className="muted mt8">
          {editId
            ? 'You can change these details until someone claims the item.'
            : 'The more exact the description, the easier it is for the owner to recognise the item — but never write the detail you would use to prove it is yours.'}
        </p>

        {!editId ? (
          <div className="segmented mt16" role="group" aria-label="Is this a lost or a found item?">
            <button
              type="button"
              className={isLost ? 'on lost' : ''}
              aria-pressed={isLost}
              onClick={() => setValues((v) => ({ ...v, type: 'lost' }))}
            >
              I lost it
            </button>
            <button
              type="button"
              className={!isLost ? 'on found' : ''}
              aria-pressed={!isLost}
              onClick={() => setValues((v) => ({ ...v, type: 'found' }))}
            >
              I found it
            </button>
          </div>
        ) : (
          <p className="badge badge-found mt16" style={{ width: 'fit-content' }}>
            {isLost ? 'Lost report' : 'Found report'}
          </p>
        )}

        <form className="card card-pad mt16" onSubmit={submit} noValidate>
          {formError ? <p className="form-error">{formError}</p> : null}

          <Input
            label="Title"
            required
            placeholder={isLost ? 'Black backpack with a laptop sleeve' : 'Bunch of keys with a red keyring'}
            hint="One short line. Do not write the proof detail here."
            value={values.title}
            onChange={change('title')}
            onBlur={blur('title')}
            error={errorFor('title')}
            maxLength={100}
          />

          <Select
            label="Category"
            required
            placeholder="Choose a category"
            options={(categories.data || []).map((c) => ({ value: c.id, label: c.name }))}
            value={values.category_id}
            onChange={change('category_id')}
            onBlur={blur('category_id')}
            error={errorFor('category_id')}
          />

          <Textarea
            label="Description"
            required
            rows={6}
            maxLength={1000}
            showCount
            placeholder="Colour, brand, marks, what was inside. Do not write serial numbers or anything you would use as proof of ownership."
            value={values.description}
            onChange={change('description')}
            onBlur={blur('description')}
            error={errorFor('description')}
            hint="Anyone can read this page. Never write the detail you would use to prove the item is yours."
          />

          <div className="row wrap" style={{ alignItems: 'flex-start' }}>
            <div className="grow">
              <Input
                label={dateLabel}
                type="date"
                required
                max={today()}
                value={values.occurred_on}
                onChange={change('occurred_on')}
                onBlur={blur('occurred_on')}
                error={errorFor('occurred_on')}
              />
            </div>
            <div className="grow">
              <Input
                label={locationLabel}
                required
                placeholder={locationPlaceholder}
                value={values.location}
                onChange={change('location')}
                onBlur={blur('location')}
                error={errorFor('location')}
              />
            </div>
          </div>

          <PhotoUploader
            value={values.photo_url}
            onChange={(url) => setValues((v) => ({ ...v, photo_url: url }))}
            error={errorFor('photo_url')}
          />

          <p className="small" style={{ marginBottom: 16 }}>
            Fields marked <span className="req">*</span> are required.
          </p>

          <div className="row wrap">
            <Button type="submit" size="lg" loading={busy}>
              {submitLabel}
            </Button>
            <Link className="btn btn-ghost" to={editId ? `/items/${editId}` : '/dashboard'}>
              Cancel
            </Link>
          </div>
        </form>

        <div className="notice notice-warn mt16">
          <div>
            <h3>Do not describe your proof</h3>
            <p className="small mt8">
              If you write “my name is written inside the cover”, anyone browsing can read that and use it to claim
              your item. Keep one detail back and put it in your claim instead.
            </p>
          </div>
        </div>

        {user ? null : <p className="small mt8">You need to be logged in to report an item.</p>}
      </div>
    </div>
  )
}
