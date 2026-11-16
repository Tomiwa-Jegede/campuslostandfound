import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAsync } from '../lib/useAsync.js'
import ItemCard from '../components/ItemCard.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import Button from '../components/ui/Button.jsx'

const STEPS = [
  {
    title: 'Report it',
    body: 'Describe what you lost, or hand in what you found. Never write the detail you would use to prove ownership — anyone can read a public report.',
  },
  {
    title: 'Claim it',
    body: 'The owner writes why the item is theirs and sends it for review. Only one claim can be open on an item at a time.',
  },
  {
    title: 'Collect it',
    body: 'A staff member reads the claim. Only after they approve it do the two of you see each other’s phone number and email.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const recent = useAsync(() => api.items({ type: 'found' }), [])

  const search = (event) => {
    event.preventDefault()
    const q = query.trim()
    navigate(q ? `/found?q=${encodeURIComponent(q)}` : '/found')
  }

  const cards = (recent.data || []).slice(0, 4)

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Lost something on campus? It is probably already here.</h1>
          <p className="lead">
            The official place to report a lost item and to hand in something you found. Every claim is checked by a
            staff member before any contact details are shared.
          </p>

          <form className="hero-search" onSubmit={search} role="search">
            <label className="sr-only" htmlFor="landing-search">
              Search items
            </label>
            <input
              id="landing-search"
              className="input"
              placeholder="Search an item, for example iPhone, keys, ID card"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>

          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to="/report?type=lost">
              I lost something
            </Link>
            <Link className="btn btn-secondary btn-lg" to="/report?type=found">
              I found something
            </Link>
          </div>
        </div>
      </section>

      <div className="container page">
        <section>
          <div className="page-head">
            <div>
              <h2>How it works</h2>
              <p className="muted small">Three steps, and a person checks the middle one.</p>
            </div>
          </div>
          <div className="steps">
            {STEPS.map((step, index) => (
              <article className="step" key={step.title}>
                <div className="num" aria-hidden="true">{index + 1}</div>
                <h3>{step.title}</h3>
                <p className="muted small mt8">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt24">
          <div className="page-head">
            <div>
              <h2>Recently found</h2>
              <p className="muted small">Things handed in over the last few days.</p>
            </div>
            <Link to="/found" className="btn btn-secondary btn-sm">
              See all found items
            </Link>
          </div>

          {recent.loading ? <Skeleton variant="card" count={4} /> : null}

          {recent.error ? (
            <div className="notice notice-danger">
              <div>
                <h3>We could not load the items</h3>
                <p className="small mt8">{recent.error.message}</p>
                <Button variant="secondary" size="sm" className="mt8" onClick={recent.reload}>
                  Try again
                </Button>
              </div>
            </div>
          ) : null}

          {!recent.loading && !recent.error ? (
            <div className="grid-items">
              {cards.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </>
  )
}
