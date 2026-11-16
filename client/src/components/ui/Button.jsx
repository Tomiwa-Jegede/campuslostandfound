export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  className = '',
  type = 'button',
  children,
  disabled,
  ...rest
}) {
  const classes = ['btn', `btn-${variant}`, size !== 'md' ? `btn-${size}` : '', block ? 'btn-block' : '', className]
    .filter(Boolean)
    .join(' ')
  const dark = variant === 'primary' || variant === 'danger'

  return (
    <button className={classes} type={type} {...rest} disabled={disabled || loading}>
      {loading ? <span className={`spinner${dark ? '' : ' spinner-dark'}`} aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
