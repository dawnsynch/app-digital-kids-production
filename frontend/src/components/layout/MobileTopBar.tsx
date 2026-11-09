import { IMAGES } from '../../data/images'
import { MenuIcon } from '../icons/Icons'

export default function MobileTopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="mobilebar">
      <button type="button" className="mobilebar__menu" aria-label="Open navigation" onClick={onMenu}>
        <MenuIcon size={22} />
      </button>
      <div className="mobilebar__brand">
        <img src={IMAGES.brandLogo} alt="" />
        <span>Digital Kids</span>
      </div>
      <img className="mobilebar__avatar" src={IMAGES.avatar} alt="Amina" />
    </header>
  )
}
