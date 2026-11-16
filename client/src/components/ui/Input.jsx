import { useId } from 'react'

export default function Input({ label, hint, error, required, id, className = '', ...rest }) {
  const autoId = useId()
  const fieldId = id || autoId
  const helpId = `${fieldId}-help`

  return (
    <div className="field">
      {label ? (
        <label className="label" htmlFor={fieldId}>
          {label} {required ? <span className="req" aria-hidden="true">*</span> : null}
          {required ? <span className="sr-only">(required)</span> : null}
        </label>
      ) : null}
      <input
        id={fieldId}
        className={`input ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error || hint ? helpId : undefined}
        required={required}
        {...rest}
      />
      {error ? (
        <p className="err" id={helpId}>{error}</p>
      ) : hint ? (
        <p className="hint" id={helpId}>{hint}</p>
      ) : null}
    </div>
  )
}
