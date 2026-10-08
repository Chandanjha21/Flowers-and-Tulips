import type { SVGProps } from "react";

/** Ultra-light line icons drawn for the brand (1.25 stroke). */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const Base = ({ size = 20, children, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {children}
  </svg>
);

export const ArrowUpRight = (p: IconProps) => (<Base {...p}><path d="M7 17 17 7M8 7h9v9" /></Base>);
export const ArrowRight = (p: IconProps) => (<Base {...p}><path d="M4 12h16M14 6l6 6-6 6" /></Base>);
export const ArrowLeft = (p: IconProps) => (<Base {...p}><path d="M20 12H4M10 6l-6 6 6 6" /></Base>);
export const Bag = (p: IconProps) => (<Base {...p}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></Base>);
export const Close = (p: IconProps) => (<Base {...p}><path d="M6 6l12 12M18 6 6 18" /></Base>);
export const Plus = (p: IconProps) => (<Base {...p}><path d="M12 5v14M5 12h14" /></Base>);
export const Minus = (p: IconProps) => (<Base {...p}><path d="M5 12h14" /></Base>);
export const Check = (p: IconProps) => (<Base {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Base>);
export const ChevronDown = (p: IconProps) => (<Base {...p}><path d="m6 9 6 6 6-6" /></Base>);
export const ChevronLeft = (p: IconProps) => (<Base {...p}><path d="m15 6-6 6 6 6" /></Base>);
export const ChevronRight = (p: IconProps) => (<Base {...p}><path d="m9 6 6 6-6 6" /></Base>);
export const Sliders = (p: IconProps) => (<Base {...p}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></Base>);
export const Truck = (p: IconProps) => (<Base {...p}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></Base>);
export const Leaf = (p: IconProps) => (<Base {...p}><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14Z" /><path d="M5 19 13 11" /></Base>);
export const Sparkle = (p: IconProps) => (<Base {...p}><path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z" /><path d="M19 16.5c.2 1.4.8 2 2 2.2-1.2.2-1.8.8-2 2.3-.2-1.5-.8-2.1-2-2.3 1.2-.2 1.8-.8 2-2.2Z" /></Base>);
export const Shield = (p: IconProps) => (<Base {...p}><path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Base>);
export const Clock = (p: IconProps) => (<Base {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Base>);
export const Phone = (p: IconProps) => (<Base {...p}><path d="M5 4h3.5l1.5 4-2 1.3a10 10 0 0 0 6.7 6.7L16 14l4 1.5V19a1.5 1.5 0 0 1-1.6 1.5C10.8 20 4 13.2 3.5 5.6A1.5 1.5 0 0 1 5 4Z" /></Base>);
export const Pin = (p: IconProps) => (<Base {...p}><path d="M12 21s-6.5-6-6.5-11.2A6.5 6.5 0 0 1 18.5 9.8C18.5 15 12 21 12 21Z" /><circle cx="12" cy="9.8" r="2.3" /></Base>);
export const Mail = (p: IconProps) => (<Base {...p}><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="m4 7 8 6 8-6" /></Base>);
export const Calendar = (p: IconProps) => (<Base {...p}><rect x="3.5" y="5" width="17" height="15" rx="1.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Base>);
export const Gift = (p: IconProps) => (<Base {...p}><rect x="4" y="9" width="16" height="11" rx="1" /><path d="M3 9h18M12 9v11M12 9c-1.5-3-5-4-5-1.5S10 9 12 9Zm0 0c1.5-3 5-4 5-1.5S14 9 12 9Z" /></Base>);
export const Heart = (p: IconProps) => (<Base {...p}><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" /></Base>);
export const Upload = (p: IconProps) => (<Base {...p}><path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></Base>);
export const Play = (p: IconProps) => (<Base {...p}><path d="M8 5.5v13l10-6.5-10-6.5Z" /></Base>);
export const Pause = (p: IconProps) => (<Base {...p}><path d="M9 5v14M15 5v14" /></Base>);
export const Instagram = (p: IconProps) => (<Base {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".6" fill="currentColor" /></Base>);
export const Facebook = (p: IconProps) => (<Base {...p}><path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9a.5.5 0 0 1 .5-.5Z" /></Base>);
export const Pinterest = (p: IconProps) => (<Base {...p}><circle cx="12" cy="12" r="8.5" /><path d="m10.5 20 2-8M9.3 13.4C8.4 11 10 8 12.6 8c2.4 0 3.6 1.7 3.4 3.6-.2 2.2-1.5 3.8-3 3.8-1.2 0-1.8-.9-1.6-1.9" /></Base>);
export const Menu = (p: IconProps) => (<Base {...p}><path d="M4 8h16M4 16h16" /></Base>);
export const Search = (p: IconProps) => (<Base {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Base>);
export const Expand = (p: IconProps) => (<Base {...p}><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" /></Base>);
