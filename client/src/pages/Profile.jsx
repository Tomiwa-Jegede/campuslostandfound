import { useState } from 'react'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { fieldError, validatePassword, validateProfile } from '../lib/validation.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

export default function Profile() {
  const { user, token, updateUser } = useAuth()
  const toast = useToast()

  const [details, setDetails] = useState({
    full_name: user.full_name,
    department: user.department,
    phone: user.phone,
  })
  const [detailTouched, setDetailTouched] = useState({})
  const [detailSubmitted, setDetailSubmitted] = useState(false)
  const [detailFields, setDetailFields] = useState({})
  const [savingDetails, setSavingDetails] = useState(false)

  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [passwordTouched, setPasswordTouched] = useState({})
  const [passwordSubmitted, setPasswordSubmitted] = useState(false)
  const [passwordFields, setPasswordFields] = useState({})
  const [savingPassword, setSavingPassword] = useState(false)

  const detailErrors = validateProfile(details)
  const passwordErrors = validatePassword(passwords)

  const saveDetails = async (event) => {
    event.preventDefault()
    setDetailSubmitted(true)
    if (Object.keys(detailErrors).length) return
    setSavingDetails(true)
    setDetailFields({})
    try {
      const updated = await api.updateProfile(token, details)
      updateUser(updated)
      toast.success('Your details were saved.')
    } catch (error) {
      if (error.fields) setDetailFields(error.fields)
      else toast.error(error.message)
    } finally {
      setSavingDetails(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    setPasswordSubmitted(true)
    if (Object.keys(passwordErrors).length) return
    setSavingPassword(true)
    setPasswordFields({})
    try {
      await api.changePassword(token, passwords)
      toast.success('Your password was changed.')
      setPasswords({ current_password: '', new_password: '', confirm_password: '' })
      setPasswordSubmitted(false)
      setPasswordTouched({})
    } catch (error) {
      if (error.fields) setPasswordFields(error.fields)
      else toast.error(error.message)
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="container page">
      <div className="narrow">
        <h1>Profile</h1>
        <p className="muted mt8">Your details, and your password.</p>

        <form className="card card-pad mt16" onSubmit={saveDetails} noValidate>
          <h2 style={{ fontSize: 17 }}>Account details</h2>
          <p className="small mt8">This information is shown to the other person when a claim is approved.</p>

          <div className="mt16">
            <Input
              label="Full name"
              required
              value={details.full_name}
              onChange={(event) => {
                setDetails((v) => ({ ...v, full_name: event.target.value }))
                setDetailFields((f) => ({ ...f, full_name: '' }))
              }}
              onBlur={() => setDetailTouched((t) => ({ ...t, full_name: true }))}
              error={
                (detailTouched.full_name || detailSubmitted) && fieldError(detailErrors, detailFields, 'full_name')
              }
            />
            <Input
              label="Department"
              required
              value={details.department}
              onChange={(event) => {
                setDetails((v) => ({ ...v, department: event.target.value }))
                setDetailFields((f) => ({ ...f, department: '' }))
              }}
              onBlur={() => setDetailTouched((t) => ({ ...t, department: true }))}
              error={
                (detailTouched.department || detailSubmitted) &&
                fieldError(detailErrors, detailFields, 'department')
              }
            />
            <Input
              label="Phone number"
              type="tel"
              required
              value={details.phone}
              onChange={(event) => {
                setDetails((v) => ({ ...v, phone: event.target.value }))
                setDetailFields((f) => ({ ...f, phone: '' }))
              }}
              onBlur={() => setDetailTouched((t) => ({ ...t, phone: true }))}
              error={(detailTouched.phone || detailSubmitted) && fieldError(detailErrors, detailFields, 'phone')}
            />

            <div className="field">
              <label className="label" htmlFor="matric-locked">
                Matric number
              </label>
              <input id="matric-locked" className="input" value={user.matric_no} readOnly disabled />
              <p className="hint">Locked. This is how the campus identifies you (FR-06).</p>
            </div>
            <div className="field">
              <label className="label" htmlFor="email-locked">
                Campus email
              </label>
              <input id="email-locked" className="input" value={user.email} readOnly disabled />
              <p className="hint">Locked. It proves you belong to the campus domain.</p>
            </div>
          </div>

          <Button type="submit" loading={savingDetails}>
            Save details
          </Button>
        </form>

        <form className="card card-pad mt16" onSubmit={savePassword} noValidate>
          <h2 style={{ fontSize: 17 }}>Change password</h2>
          <p className="small mt8">You need your current password, even while logged in.</p>

          <div className="mt16">
            <Input
              label="Current password"
              type="password"
              autoComplete="current-password"
              required
              value={passwords.current_password}
              onChange={(event) => {
                setPasswords((v) => ({ ...v, current_password: event.target.value }))
                setPasswordFields((f) => ({ ...f, current_password: '' }))
              }}
              onBlur={() => setPasswordTouched((t) => ({ ...t, current_password: true }))}
              error={
                (passwordTouched.current_password || passwordSubmitted) &&
                fieldError(passwordErrors, passwordFields, 'current_password')
              }
            />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              required
              hint="At least 8 characters."
              value={passwords.new_password}
              onChange={(event) => {
                setPasswords((v) => ({ ...v, new_password: event.target.value }))
                setPasswordFields((f) => ({ ...f, new_password: '' }))
              }}
              onBlur={() => setPasswordTouched((t) => ({ ...t, new_password: true }))}
              error={
                (passwordTouched.new_password || passwordSubmitted) &&
                fieldError(passwordErrors, passwordFields, 'new_password')
              }
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              required
              value={passwords.confirm_password}
              onChange={(event) => {
                setPasswords((v) => ({ ...v, confirm_password: event.target.value }))
                setPasswordFields((f) => ({ ...f, confirm_password: '' }))
              }}
              onBlur={() => setPasswordTouched((t) => ({ ...t, confirm_password: true }))}
              error={
                (passwordTouched.confirm_password || passwordSubmitted) &&
                fieldError(passwordErrors, passwordFields, 'confirm_password')
              }
            />
          </div>

          <Button type="submit" variant="secondary" loading={savingPassword}>
            Change password
          </Button>
        </form>
      </div>
    </div>
  )
}
