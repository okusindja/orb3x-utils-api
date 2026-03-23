import { type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'outline';

export function badgeVariants({
  variant = 'secondary',
  className,
}: {
  variant?: BadgeVariant;
  className?: string;
}) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground border border-border',
    outline: 'border border-border text-foreground',
  };

  return cn(
    'inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
    variants[variant],
    className,
  );
}

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }) {
  return <div className={badgeVariants({ variant, className })} {...props} />;
}
