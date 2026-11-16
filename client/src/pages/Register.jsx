import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { CAMPUS_EMAIL_DOMAIN, MATRIC_EXAMPLE } from '../lib/config.js'
import { fieldError, validateRegister } from '../lib/validation.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

const EMPTY = {
  full_name: '',
  matric_no: '',
  department: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: '',
}

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [values, setValues] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [serverFields, setServerFields] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const client = validateRegister(values)
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
    try {
      await register({ ...values, matric_no: values.matric_no.toUpperCase() })
      toast.success('Your account is ready.')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      if (error.fields) setServerFields(error.fields)
      else setFormError(error.message)
      setBusy(false)
    }
  }

  return (
    <div className="container page">
      <div className="narrow">
        <h1>Create an account</h1>
        <p className="muted mt8">
          Use your campus details. Matric number and campus email cannot be changed later, because they prove who you
          are.
        </p>

        <form className="card card-pad mt16" onSubmit={submit} noValidate>
          {formError ? <p className="form-error">{formError}</p> : null}

          <Input
            label="Full name"
            required
            autoComplete="name"
            value={values.full_name}
            onChange={change('full_name')}
            onBlur={blur('full_name')}
            error={errorFor('full_name')}
          />
          <Input
            label="Matric number"
            required
            placeholder={MATRIC_EXAMPLE}
            hint={`Example: ${MATRIC_EXAMPLE}`}
            value={values.matric_no}
            onChange={change('matric_no')}
            onBlur={blur('matric_no')}
            error={errorFor('matric_no')}
          />
          <Input
            label="Department"
            required
            placeholder="Computer Science"
            value={values.department}
            onChange={change('department')}
            onBlur={blur('department')}
            error={errorFor('department')}
          />
          <Input
            label="Campus email"
            type="email"
            required
            autoComplete="email"
            placeholder={`your.name@${CAMPUS_EMAIL_DOMAIN}`}
            hint={`Must end in @${CAMPUS_EMAIL_DOMAIN}. This is checked by format only — we do not send a verification email.`}
            value={values.email}
            onChange={change('email')}
            onBlur={blur('email')}
            error={errorFor('email')}
          />
          <Input
            label="Phone number"
            type="tel"
            required
            autoComplete="tel"
            placeholder="0803 555 0142"
            hint="Shown only to the other person after a claim is approved."
            value={values.phone}
            onChange={change('phone')}
            onBlur={blur('phone')}
            error={errorFor('phone')}
          />
          <Input
            label="Password"
            type="password"
            required
            autoComplete="new-password"
            hint="At least 8 characters."
            value={values.password}
            onChange={change('password')}
            onBlur={blur('password')}
            error={errorFor('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            required
            autoComplete="new-password"
            value={values.confirm_password}
            onChange={change('confirm_password')}
            onBlur={blur('confirm_password')}
            error={errorFor('confirm_password')}
          />

          <p className="small mt8" style={{ marginBottom: 16 }}>
            Fields marked <span className="req">*</span> are required.
          </p>

          <Button type="submit" block loading={busy} size="lg">
            Create account
          </Button>

          <p className="small center mt16">
            Already registered? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
