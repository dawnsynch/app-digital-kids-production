import type { ReactNode, SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function Wrap({ size = 18, children, ...rest }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

/** Chat bubble with a magnifying glass — used on the “Chat with Kito” button. */
export const ChatIcon = (p: P) => (
  <Wrap {...p}>
    <path d="M20.5 11.5c0 4.1-3.8 7.4-8.5 7.4-.9 0-1.8-.1-2.6-.4l-4.4 1.7 1.4-3.6c-1.7-1.4-2.8-3.3-2.8-5.1 0-4.1 3.8-7.4 8.5-7.4s8.4 3.3 8.4 7.4Z" />
    <circle cx="11" cy="11.4" r="2.6" />
    <path d="m13.1 13.5 1.8 1.8" />
  </Wrap>
)

/** Magnifying glass. */
export const SearchIcon = (p: P) => (
  <Wrap {...p}>
    <circle cx="10.5" cy="10.5" r="6.4" />
    <path d="m19.5 19.5-3.9-3.9" />
  </Wrap>
)
