/** Loading placeholders that match the real thing, so nothing jumps. */
export default function Skeleton({ variant = 'line', count = 1, className = '' }) {
  const base = { line: 'skel skel-line', card: 'skel skel-card', row: 'skel skel-row' }[variant] || 'skel skel-line'
  return (
    <div className={variant === 'card' ? 'grid-items' : ''} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${base} ${className}`} />
      ))}
    </div>
  )
}
