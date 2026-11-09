import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

/**
 * Line-art icon set used across the dashboard. Every icon inherits `currentColor`
 * so it can be recoloured from its parent component.
 */
export function Icon({ size = 20, children, ...rest }: IconProps & { children: ReactNode }) {
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

/* ------------------------------- sidebar ------------------------------- */

export const HomeIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="M3 10.2 12 3l9 7.2" />
    <path d="M5.5 9.2V20a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9.2" />
  </Icon>
)

export const BookIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 6.6C10.4 5 8.2 4.2 5 4.2A1 1 0 0 0 4 5.2v12a1 1 0 0 0 1 1c3 0 5.2.7 7 2.2 1.8-1.5 4-2.2 7-2.2a1 1 0 0 0 1-1v-12a1 1 0 0 0-1-1c-3.2 0-5.4.8-7 2.4Z" />
    <path d="M12 6.6v13.8" />
  </Icon>
)

export const PracticeIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2.5" />
    <path d="M8 8h3M8 12h8M8 16h5" />
  </Icon>
)

export const SubjectIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3H19v15H7.5A1.5 1.5 0 0 0 6 19.5Z" />
    <path d="M6 19.5A1.5 1.5 0 0 1 7.5 18H19v3H7.5A1.5 1.5 0 0 1 6 19.5Z" />
    <circle cx="10" cy="9" r="1.6" />
    <path d="M13.5 8h3M13.5 11h2" />
  </Icon>
)

export const CodeIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="M9 7 4 12l5 5" />
    <path d="m15 7 5 5-5 5" />
  </Icon>
)

export const SparkleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.2c.6 3.4 1.9 4.7 5.3 5.3-3.4.6-4.7 1.9-5.3 5.3-.6-3.4-1.9-4.7-5.3-5.3 3.4-.6 4.7-1.9 5.3-5.3Z" />
    <path d="M17.6 14.2c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" />
    <path d="M6.2 15.4c.2 1.2.7 1.7 1.9 1.9-1.2.2-1.7.7-1.9 1.9-.2-1.2-.7-1.7-1.9-1.9 1.2-.2 1.7-.7 1.9-1.9Z" />
  </Icon>
)

export const CrossIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2.2}>
    <path d="M12 3.5v17M6.8 7.5h10.4" />
  </Icon>
)

export const TrophyIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0Z" />
    <path d="M7 5.5H4.5v1A3.5 3.5 0 0 0 8 10" />
    <path d="M17 5.5h2.5v1A3.5 3.5 0 0 1 16 10" />
    <path d="M12 14v3.5" />
    <path d="M8.5 20.5h7" />
    <path d="M9.5 17.5h5l.6 3h-6.2Z" />
  </Icon>
)

export const BarChartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 20.5h18" />
    <path d="M6 20.5V12h3v8.5" />
    <path d="M11 20.5V7.5h3v13" />
    <path d="M16 20.5v-5.5h3v5.5" />
  </Icon>
)

export const UserIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.8 20c.6-3.8 3.5-5.8 7.2-5.8s6.6 2 7.2 5.8" />
  </Icon>
)

export const HelpIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.4 9.2a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.3-2.6 4" />
    <path d="M12 17.4h.01" />
  </Icon>
)

export const GearIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
    <path d="m19.3 14.2 1.2 1-1.8 3-1.5-.5a7.6 7.6 0 0 1-1.9 1.1l-.3 1.6h-3.5l-.3-1.6a7.6 7.6 0 0 1-1.9-1.1l-1.5.5-1.8-3 1.2-1a7.4 7.4 0 0 1 0-2.4l-1.2-1 1.8-3 1.5.5a7.6 7.6 0 0 1 1.9-1.1l.3-1.6h3.5l.3 1.6a7.6 7.6 0 0 1 1.9 1.1l1.5-.5 1.8 3-1.2 1a7.4 7.4 0 0 1 0 2.4Z" />
  </Icon>
)

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.4" />
    <path d="m20 20-3.7-3.7" />
  </Icon>
)

/* -------------------------------- top bar -------------------------------- */

export const BellIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z" />
    <path d="M13.7 19a2 2 0 0 1-3.4 0" />
  </Icon>
)

export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Icon>
)

export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2.2}>
    <path d="m9 5 7 7-7 7" />
  </Icon>
)

export const MenuIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
)

export const CloseIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Icon>
)

/* ---------------------------- learning cards ---------------------------- */

export const MathIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2.1}>
    <path d="M3.2 7.4h4.4M5.4 5.2v4.4" />
    <path d="M13.2 5.6 17.6 10M17.6 5.6 13.2 10" />
    <path d="M3.2 17h4.4" />
    <path d="M13 15.4h5.2" />
    <circle cx="15.6" cy="13" r="0.95" fill="currentColor" stroke="none" />
    <circle cx="15.6" cy="19.4" r="0.95" fill="currentColor" stroke="none" />
  </Icon>
)

export const FlaskIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.5 3h5" />
    <path d="M10.5 3v6.2L5.4 17.6A2 2 0 0 0 7.1 20.6h9.8a2 2 0 0 0 1.7-3L14.5 9.2V3" />
    <path d="M7.6 14.5h8.8" />
  </Icon>
)

export const CrossCircleIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2.4}>
    <path d="M12 5.4v13.2M5.4 12h13.2" />
  </Icon>
)

export const SqrtIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="M2.6 12.4h3.4l2.5-6.2 3 12.4 1.9-3.6h3" />
    <path d="M16.4 8.4 20 15.6M20 8.4 16.4 15.6" />
  </Icon>
)

export const BookSolidIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 7.2C10.6 5.9 8.8 5.2 6 5.2a.9.9 0 0 0-.9.9v10.6a.9.9 0 0 0 .9.9c2.7 0 4.5.7 6 2 1.5-1.3 3.3-2 6-2a.9.9 0 0 0 .9-.9V6.1a.9.9 0 0 0-.9-.9c-2.8 0-4.6.7-6 2Z" />
    </Icon>
)

export const AaIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2.1}>
    <path d="M2.4 18.6 6.4 5.4l4 13.2" />
    <path d="M3.9 14.4h5" />
    <circle cx="16.6" cy="14.6" r="3.6" />
    <path d="M20.2 11v7.6" />
  </Icon>
)

/* ------------------------------ mobile nav ------------------------------ */

export const ToolsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="6.5" cy="6.5" r="2.6" />
    <circle cx="6.5" cy="17.5" r="2.6" />
    <path d="M8.6 8.4 19 17" />
    <path d="M15.2 3.6a4.6 4.6 0 0 0 5.2 6.4l-4.8 4.8-2-2L18.4 8a4.6 4.6 0 0 0-6.4-5.2l2.6 2.6-1.8 1.8L10.2 4.6a4.6 4.6 0 0 0 5-1Z" />
  </Icon>
)

/* ----------------------------- feature strip ----------------------------- */

export const OpenBookIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 6.4C10.3 4.9 8 4.2 4.6 4.2A1.4 1.4 0 0 0 3.2 5.6v11.2a1.4 1.4 0 0 0 1.4 1.4c3 0 5.3.7 7.4 2.3 2.1-1.6 4.4-2.3 7.4-2.3a1.4 1.4 0 0 0 1.4-1.4V5.6a1.4 1.4 0 0 0-1.4-1.4C16 4.2 13.7 4.9 12 6.4Z" />
    <path d="M12 6.4v13.4" />
  </Icon>
)

export const ShieldCheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 5 5.6v5.6c0 4.2 2.9 8.1 7 9.4 4.1-1.3 7-5.2 7-9.4V5.6Z" />
    <path d="m8.8 11.8 2.2 2.2 4.2-4.4" />
  </Icon>
)

export const BotIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="8" width="16" height="11.5" rx="3.4" />
    <circle cx="9.2" cy="13.4" r="1.3" />
    <circle cx="14.8" cy="13.4" r="1.3" />
    <path d="M12 4.6V8M9.4 16.6h5.2" />
  </Icon>
)

export const GlobeIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M3.4 12h17.2" />
    <path d="M12 3.4c2.3 2.4 3.5 5.4 3.5 8.6s-1.2 6.2-3.5 8.6c-2.3-2.4-3.5-5.4-3.5-8.6S9.7 5.8 12 3.4Z" />
  </Icon>
)

export const BarsIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.2" y="12" width="4" height="8.6" rx="1.4" />
    <rect x="10" y="6.6" width="4" height="14" rx="1.4" />
    <rect x="16.8" y="3.4" width="4" height="17.2" rx="1.4" />
  </Icon>
)

/** Decorative four-point sparkle cluster used beside the Learn page title. */
export const SparklesIcon = (p: IconProps) => {
  const { size = 26, ...rest } = p
  return (
    <svg
      width={size}
      height={size * 1.45}
      viewBox="0 0 24 35"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d="M6.4 0c.7 4 1.9 5.2 5.9 5.9-4 .7-5.2 1.9-5.9 5.9-.7-4-1.9-5.2-5.9-5.9 4-.7 5.2-1.9 5.9-5.9Z" />
      <path d="M17.2 9.2c.9 5.2 2.5 6.8 7.7 7.7-5.2.9-6.8 2.5-7.7 7.7-.9-5.2-2.5-6.8-7.7-7.7 5.2-.9 6.8-2.5 7.7-7.7Z" />
      <path d="M6.2 20.8c.6 3.5 1.7 4.6 5.2 5.2-3.5.6-4.6 1.7-5.2 5.2-.6-3.5-1.7-4.6-5.2-5.2 3.5-.6 4.6-1.7 5.2-5.2Z" />
    </svg>
  )
}

/* ---------------------------- practice page icons ---------------------------- */

/** Graduation cap used by the “Choose your grade” control. */
export const GradeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 8.4 12 4l9.5 4.4L12 12.8 2.5 8.4Z" />
    <path d="M6.4 10.6v4.6c0 1.5 2.5 2.8 5.6 2.8s5.6-1.3 5.6-2.8v-4.6" />
    <path d="M21.5 8.4v5.2" />
  </Icon>
)

/** Calendar used by the “Choose your term” control. */
export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.2" y="5" width="17.6" height="16" rx="2.4" />
    <path d="M3.2 9.6h17.6M8 3v4M16 3v4" />
    <path d="M7.6 13.2h.01M12 13.2h.01M16.4 13.2h.01M7.6 17h.01M12 17h.01" strokeWidth={2.2} />
  </Icon>
)

/** 2 × 2 arithmetic grid used by the “Choose your subject” control. */
export const MathGridIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <rect x="2.8" y="2.8" width="8" height="8" rx="2" />
    <rect x="13.2" y="2.8" width="8" height="8" rx="2" />
    <rect x="2.8" y="13.2" width="8" height="8" rx="2" />
    <rect x="13.2" y="13.2" width="8" height="8" rx="2" />
    <path d="M4.9 6.8h3.8M6.8 4.9v3.8" strokeWidth={1.7} />
    <path d="M15.3 6.8h3.8" strokeWidth={1.7} />
    <path d="m4.9 15.4 3.8 3.8M8.7 15.4l-3.8 3.8" strokeWidth={1.7} />
    <path d="M15.4 16.2h3.4M15.4 18.2h3.4" strokeWidth={1.7} />
  </Icon>
)

/** Pie chart used by the “Choose your strand” control. */
export const PieIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.2A8.8 8.8 0 1 0 20.8 12H12V3.2Z" />
    <path d="M14.6 2.4A8.8 8.8 0 0 1 21.6 9.4h-7V2.4Z" />
  </Icon>
)

/** Stopwatch used by the “About X minutes” panel. */
export const StopwatchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="13.5" r="7.8" />
    <path d="M12 9.6v3.9h2.8M9.4 2.6h5.2M18.4 6.2l1.5-1.5" />
    <path d="M12 2.6v1.6" />
  </Icon>
)

/** Chevron used by the select controls. */
export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2.1}>
    <path d="m6 9.5 6 6 6-6" />
  </Icon>
)

/** Small robot-with-speech-bubble mark used on the “Ask Kito for Help” button. */
export const KitoChatIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={1.8}>
    <path d="M4 11.4a3.4 3.4 0 0 1 3.4-3.4h5.2A3.4 3.4 0 0 1 16 11.4v2.2a3.4 3.4 0 0 1-3.4 3.4H8.2" />
    <path d="M4 12.6h1.2" />
    <circle cx="8.2" cy="11.4" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="11.8" cy="11.4" r="0.9" fill="currentColor" stroke="none" />
    <path d="M16 9.2h2.4a2 2 0 0 1 2 2v1.6a2 2 0 0 1-2 2H17" />
    <path d="M9.6 17v1.6a1.6 1.6 0 0 1-1.6 1.6H7" />
  </Icon>
)

/** Pencil used by the “Practice Questions” strand stat. */
export const PencilIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={1.9}>
    <path d="M16.4 3.9a2 2 0 0 1 2.8 2.8L8.5 17.4l-4 1.2 1.2-4Z" />
    <path d="m14.6 5.7 3.7 3.7" />
  </Icon>
)

/* -------------------------- coding & technology icons -------------------------- */

/** Desktop monitor used by the Computer Basics / Digital Skills tiles. */
export const MonitorIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={1.9}>
    <rect x="2.8" y="4" width="18.4" height="12.6" rx="2.2" />
    <path d="M8.6 20.4h6.8M12 16.6v3.8" />
  </Icon>
)

/** App window used by the “Build with Code” tile. */
export const WindowIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={1.9}>
    <rect x="2.8" y="4" width="18.4" height="16" rx="2.4" />
    <path d="M2.8 9h18.4" />
    <path d="M6.2 6.5h.01M8.9 6.5h.01M11.6 6.5h.01" strokeWidth={2.2} />
    <path d="M6.4 13h6M6.4 16.4h9" />
  </Icon>
)

/** Medal used by the “Recent Achievement” row. */
export const MedalIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={1.8}>
    <path d="M8 3.4h8l-1.6 5.2H9.6L8 3.4Z" />
    <circle cx="12" cy="15.4" r="5.4" />
    <path d="m12 12.8 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2L8.8 15l2.2-.3 1-2Z" strokeWidth={1.5} />
  </Icon>
)

/** Star used for the “Technology Stars” stat. */
export const StarIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={1.8}>
    <path d="m12 3.4 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.9-5.4 2.9 1-6L3.3 9.8l6-.9L12 3.4Z" />
  </Icon>
)

/** Target used by the “Try a Coding Challenge” heading. */
export const TargetIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={1.9}>
    <circle cx="12" cy="12" r="8.4" />
    <circle cx="12" cy="12" r="4.6" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </Icon>
)

/** Clock used for the learning-time stat. */
export const ClockIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={1.9}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 7.2V12l3 1.8" />
  </Icon>
)
