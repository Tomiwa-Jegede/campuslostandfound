export default function EmptyState({ title, description, action }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  )
}
