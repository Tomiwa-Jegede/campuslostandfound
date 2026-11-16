import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container page">
      <div className="narrow center">
        <p className="small strong" style={{ letterSpacing: '0.1em' }}>
          404
        </p>
        <h1>That page does not exist</h1>
        <p className="muted mt8">
          The link may be old, or the item may have been removed. Nothing is broken — there is just nothing here.
        </p>
        <div className="row center mt16" style={{ justifyContent: 'center' }}>
          <Link className="btn btn-primary" to="/">
            Go to the home page
          </Link>
          <Link className="btn btn-secondary" to="/found">
            Browse found items
          </Link>
        </div>
      </div>
    </div>
  )
}
