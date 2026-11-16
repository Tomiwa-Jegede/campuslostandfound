const STATUS_LABELS = {
  OPEN: 'Open',
  CLAIM_PENDING: 'Claim pending',
  RETURNED: 'Returned',
  ARCHIVED: 'Archived',
  PENDING: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

/** The only place a status turns into words and a colour. */
export function StatusBadge({ status, type }) {
  const tone = {
    // An open report takes the colour of its type: amber for lost, green for found.
    OPEN: type === 'lost' ? 'lost' : 'found',
    CLAIM_PENDING: 'pending',
    RETURNED: 'returned',
    ARCHIVED: 'archived',
    PENDING: 'pending',
    APPROVED: 'found',
    REJECTED: 'danger',
  }[status] || 'returned'

  return <span className={`badge badge-${tone}`}>{STATUS_LABELS[status] || status}</span>
}

export function TypeBadge({ type }) {
  return <span className={`badge badge-${type === 'lost' ? 'lost' : 'found'}`}>{type === 'lost' ? 'Lost' : 'Found'}</span>
}

export default StatusBadge
