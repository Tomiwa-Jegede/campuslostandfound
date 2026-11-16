import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { fieldError, validateLogin } from '../lib/validation.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

const DEMO = [
  { label: 'Administrator', email: 'admin@campus.edu.ng', password: 'admin1234' },
]

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || ''

  const [values, setValues] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [serverFields, setServerFields] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const client = validateLogin(values)
  const errorFor = (name) => ((touched[name] || submitted) ? fieldError(client, serverFields, name) : '')

  const change = (name) => (event) => {
    setValues((v) => ({ ...v, [name]: event.target.value }))
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
      const user = await login(values.email, values.password)
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}.`)
      navigate(next || (user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true })
    } catch (error) {
      if (error.fields) setServerFields(error.fields)
      else setFormError(error.message)
      setBusy(false)
    }
  }

  const useDemo = (account) => {
    setValues({ email: account.email, password: account.password })
    setSubmitted(false)
    setTouched({})
    setFormError('')
  }

  return (
    <div className="container page">
      <div className="narrow">
        <h1>Log in</h1>
        <p className="muted mt8">Use the campus email you registered with.</p>

        <form className="card card-pad mt16" onSubmit={submit} noValidate>
          {formError ? <p className="form-error">{formError}</p> : null}

          <Input
            label="Campus email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={change('email')}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            error={errorFor('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={values.password}
            onChange={change('password')}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={errorFor('password')}
          />

          <Button type="submit" block loading={busy} size="lg">
            Log in
          </Button>

          <p className="small center mt16">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>

        <div className="card card-pad mt16">
          <h2 style={{ fontSize: 16 }}>Demonstration accounts</h2>
          <p className="small mt8">
            This build runs on fake data, so these accounts are fixed. The student has reports and claims already.
          </p>
          <ul style={{ margin: '12px 0 0', paddingLeft: 18 }} className="small">
            {DEMO.map((account) => (
              <li key={account.email} style={{ marginBottom: 6 }}>
                <strong>{account.label}</strong> — <span className="mono">{account.email}</span> /{' '}
                <span className="mono">{account.password}</span>{' '}
                <button type="button" className="chip" style={{ marginLeft: 6 }} onClick={() => useDemo(account)}>
                  Use
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
