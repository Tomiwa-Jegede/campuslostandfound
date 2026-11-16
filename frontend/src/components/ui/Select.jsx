import { useId } from 'react'

export default function Select({ label, hint, error, required, options = [], placeholder, id, ...rest }) {
  const autoId = useId()
  const fieldId = id || autoId
  const helpId = `${fieldId}-help`

  return (
    <div className="field">
      {label ? (
        <label className="label" htmlFor={fieldId}>
          {label} {required ? <span className="req" aria-hidden="true">*</span> : null}
        </label>
      ) : null}
      <select
        id={fieldId}
        className="select"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error || hint ? helpId : undefined}
        required={required}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="err" id={helpId}>{error}</p>
      ) : hint ? (
        <p className="hint" id={helpId}>{hint}</p>
      ) : null}
    </div>
  )
}
