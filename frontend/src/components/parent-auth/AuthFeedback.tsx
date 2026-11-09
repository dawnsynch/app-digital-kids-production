type Props = { tone?: 'info' | 'error' | 'success'; children: React.ReactNode }

export default function AuthFeedback({ tone = 'info', children }: Props) {
  return <div className={`parent-auth-feedback parent-auth-feedback--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div>
}
