import { Link } from 'react-router-dom'
import { StatusBadge, TypeBadge } from './ui/StatusBadge.jsx'
import { formatDate } from '../lib/format.js'

/** Photo-first card. Same component on every list, so nothing drifts apart. */
export default function ItemCard({ item, showStatus = true }) {
  return (
    <Link className="item-card" to={`/items/${item.id}`}>
      <img className="item-photo" src={item.photo_url} alt="" loading="lazy" />
      <div className="item-body">
        <div className="row wrap" style={{ gap: 6 }}>
          <TypeBadge type={item.type} />
          {showStatus && item.status !== 'OPEN' ? <StatusBadge status={item.status} type={item.type} /> : null}
          {item.is_archived ? <span className="badge badge-archived">Archived</span> : null}
        </div>
        <h3 className="item-title">{item.title}</h3>
        <p className="item-meta">
          <span>{item.category_name}</span>
          <span className="dot">{item.location}</span>
        </p>
        <p className="item-meta">
          <span>{formatDate(item.occurred_on)}</span>
        </p>
      </div>
    </Link>
  )
}
