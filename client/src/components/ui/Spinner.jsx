export default function Spinner({ dark = false, label = 'Loading' }) {
  return (
    <span className={`spinner${dark ? ' spinner-dark' : ''}`} role="status" aria-label={label} />
  )
}
