import type { ReactNode } from 'react'
import { CloseIcon } from '../icons/Icons'

type Props = {
  title: string
  children: ReactNode
  onClose: () => void
}

export default function Modal({ title, children, onClose }: Props) {
  return (
    <div className="learner-modal" role="presentation" onMouseDown={onClose}>
      <section
        className="learner-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="learner-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="learner-modal__head">
          <h2 id="learner-modal-title">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog">
            <CloseIcon size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
