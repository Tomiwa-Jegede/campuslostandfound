/** Hand-written tag + magnifier. Decorative: the wordmark carries the name. */
export default function Logo({ size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 10.5 10.5 4H21l7 7v10.5L21.5 28H11l-7-7z" opacity="0.28" />
      <path d="M4 10.5 10.5 4H21l7 7v10.5L21.5 28H11l-7-7z" />
      <circle cx="15" cy="15" r="4.2" />
      <path d="M18.2 18.2 23 23" />
    </svg>
  )
}
