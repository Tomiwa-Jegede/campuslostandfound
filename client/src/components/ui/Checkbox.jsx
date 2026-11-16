import { useId } from 'react'

export default function Checkbox({ label, hint, error, id, ...rest }) {
  const autoId = useId()
  const fieldId = id || autoId
  const helpId = `${fieldId}-help`

  return (
    <div className="field">
      <label className="check" htmlFor={fieldId}>
        <input
          id={fieldId}
          type="checkbox"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error || hint ? helpId : undefined}
          {...rest}
        />
        <span>{label}</span>
      </label>
      {error ? (
        <p className="err" id={helpId}>{error}</p>
      ) : hint ? (
        <p className="hint" id={helpId}>{hint}</p>
      ) : null}
    </div>
  )
}
