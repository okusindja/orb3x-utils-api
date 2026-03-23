import { ReactNode, SVGAttributes } from 'react';

import { cn } from '@/lib/utils';

type IconProps = SVGAttributes<SVGSVGElement>;

function BaseIcon({ className, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('size-5 shrink-0', className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3 5.5 5.7v5.8c0 4.2 2.4 8 6.5 9.5 4.1-1.5 6.5-5.3 6.5-9.5V5.7L12 3Z" />
      <path d="m9.5 12 1.8 1.8 3.5-3.6" />
    </BaseIcon>
  );
}

export function TranslateIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 6h9" />
      <path d="M8.5 4v2c0 4-1.7 7.2-4.5 9" />
      <path d="M6.5 10c1.2 2 2.8 3.8 4.9 5.2" />
      <path d="M15 6h5" />
      <path d="m17.2 6 3.1 9" />
      <path d="m20.3 15-6.5.1" />
    </BaseIcon>
  );
}

export function CurrencyIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <ellipse cx="12" cy="6" rx="6.5" ry="2.5" />
      <path d="M5.5 6v4c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V6" />
      <path d="M5.5 10v4c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-4" />
      <path d="M5.5 14v4c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-4" />
    </BaseIcon>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21V5.5Z" />
      <path d="M5 18.5A2.5 2.5 0 0 1 7.5 16H19" />
      <path d="M9 7h6" />
      <path d="M9 10.5h6" />
    </BaseIcon>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 4 8 4-8 4-8-4 8-4Z" />
      <path d="m4 12 8 4 8-4" />
      <path d="m4 16 8 4 8-4" />
    </BaseIcon>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 2 1.8 4.7L18.5 8.5l-4.7 1.8L12 15l-1.8-4.7L5.5 8.5l4.7-1.8L12 2Z" />
      <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
    </BaseIcon>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="m14.9 9.1-1.9 5.7-5.7 1.9 1.9-5.7 5.7-1.9Z" />
    </BaseIcon>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2" />
      <path d="M12 19.3v2.2" />
      <path d="m5.3 5.3 1.6 1.6" />
      <path d="m17.1 17.1 1.6 1.6" />
      <path d="M2.5 12h2.2" />
      <path d="M19.3 12h2.2" />
      <path d="m5.3 18.7 1.6-1.6" />
      <path d="m17.1 6.9 1.6-1.6" />
    </BaseIcon>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M18.7 14.1A7.5 7.5 0 0 1 9.9 5.3a7.9 7.9 0 1 0 8.8 8.8Z" />
    </BaseIcon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </BaseIcon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </BaseIcon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </BaseIcon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 4h3l1 4-2 1.5a13.5 13.5 0 0 0 5.5 5.5L16 13l4 1v3a2 2 0 0 1-2.2 2c-7.7-.7-13.9-6.9-14.6-14.6A2 2 0 0 1 7 4Z" />
    </BaseIcon>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </BaseIcon>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
    </BaseIcon>
  );
}

export function CalculatorIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8" />
      <path d="M8 12h.01" />
      <path d="M12 12h.01" />
      <path d="M16 12h.01" />
      <path d="M8 16h.01" />
      <path d="M12 16h.01" />
      <path d="M16 16h.01" />
    </BaseIcon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2" />
    </BaseIcon>
  );
}

export function FileTextIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </BaseIcon>
  );
}
