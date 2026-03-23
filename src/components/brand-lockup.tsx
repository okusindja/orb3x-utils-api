'use client';

import Link from 'next/link';

import { LogoSVG } from '@/components/svg';
import { cn } from '@/lib/utils';

type BrandLockupProps = {
  href?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  summary?: string;
  ariaLabel?: string;
};

const sizes = {
  xs: {
    width: '96px',
    height: '26px',
    text: 'text-xs',
  },
  sm: {
    width: '112px',
    height: '30px',
    text: 'text-xs',
  },
  md: {
    width: '138px',
    height: '38px',
    text: 'text-sm',
  },
  lg: {
    width: '176px',
    height: '48px',
    text: 'text-base',
  },
} as const;

export function BrandLockup({ href, className, size = 'md', summary, ariaLabel }: BrandLockupProps) {
  const current = sizes[size];
  const content = (
    <div className={cn('inline-flex items-center gap-4', className)}>
      <LogoSVG
        width={current.width}
        maxWidth="100%"
        maxHeight={current.height}
        className="block h-auto shrink-0"
        aria-hidden="true"
        focusable="false"
      />
      {summary ? (
        <p className={cn('max-w-sm leading-7 text-muted-foreground', current.text)}>{summary}</p>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center" aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return content;
}
