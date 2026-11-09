import type { SetupField } from '../../data/practiceContent'
import { ChevronDownIcon } from '../icons/Icons'

type Props = {
  field: SetupField
  value: string
  onChange: (value: string) => void
}

/** A numbered “choose your …” row with a select control. */
export default function SetupFieldRow({ field, value, onChange }: Props) {
  const IconComponent = field.icon

  return (
    <div className="setup-field">
      <span className="setup-field__number">{field.step}</span>

      <span className="setup-field__label" id={`setup-${field.id}-label`}>
        {field.label}
      </span>

      <div className="setup-field__control">
        <IconComponent className="setup-field__icon" size={24} />
        <select
          className="setup-field__select"
          value={value}
          aria-labelledby={`setup-${field.id}-label`}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="setup-field__chevron" size={18} />
      </div>
    </div>
  )
}
