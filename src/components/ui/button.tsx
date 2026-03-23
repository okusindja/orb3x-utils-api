import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export function buttonVariants({
  variant = 'default',
  size = 'default',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  const variants: Record<ButtonVariant, string> = {
    default: 'bg-primary text-primary-foreground shadow-sm hover:opacity-90',
    secondary: 'bg-secondary text-secondary-foreground hover:opacity-90',
    outline: 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
    ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizes: Record<ButtonSize, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-6',
    icon: 'size-10',
  };

  return cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  );
}

type SharedProps = {
  className?: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  children,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & SharedProps) {
  return (
    <button className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  className,
  children,
  variant,
  size,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & SharedProps) {
  return (
    <a className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </a>
  );
}
