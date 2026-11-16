import { useId } from 'react'

export default function Textarea({ label, hint, error, required, maxLength, showCount, value = '', id, rows = 6, ...rest }) {
  const autoId = useId()
  const fieldId = id || autoId
  const helpId = `${fieldId}-help`
  const length = String(value).length

  return (
    <div className="field">
      {label ? (
        <label className="label" htmlFor={fieldId}>
          {label} {required ? <span className="req" aria-hidden="true">*</span> : null}
        </label>
      ) : null}
      <textarea
        id={fieldId}
        className="textarea"
        rows={rows}
        maxLength={maxLength}
        value={value}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error || hint ? helpId : undefined}
        required={required}
        {...rest}
      />
      <div className="row between">
        {error ? (
          <p className="err" id={helpId}>{error}</p>
        ) : hint ? (
          <p className="hint" id={helpId}>{hint}</p>
        ) : (
          <span />
        )}
        {showCount && maxLength ? (
          <p className="hint">
            {length} / {maxLength}
          </p>
        ) : null}
      </div>
    </div>
  )
}
