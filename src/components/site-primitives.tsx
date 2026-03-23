'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { PropsWithChildren, ReactNode } from 'react';

import { ArrowRightIcon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function getRevealProps(shouldReduceMotion: boolean, delay = 0) {
  if (shouldReduceMotion) {
    return {};
  }

  return {
    initial: { opacity: 0, y: 28, scale: 0.985, filter: 'blur(10px)' },
    whileInView: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
    viewport: { once: true, amount: 0.16 },
    transition: { duration: 0.58, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

export function Eyebrow({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <Badge variant="secondary" className={cn('tracking-[0.24em]', className)}>
      {children}
    </Badge>
  );
}

export function IconBadge({
  icon,
  className,
}: {
  icon: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-xl border border-border bg-secondary text-primary shadow-sm',
        className,
      )}
    >
      {icon}
    </span>
  );
}

export function Surface({
  children,
  className,
  delay = 0,
}: PropsWithChildren<{
  className?: string;
  delay?: number;
}>) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      {...getRevealProps(shouldReduceMotion, delay)}
      className={cn('relative', className)}
    >
      <Card className="surface-panel relative overflow-hidden">
        <CardContent className="relative z-10 p-5 sm:p-6 md:p-7">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: {
  eyebrow: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="grid gap-8 border-b border-border pb-8 md:pb-10 xl:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.85fr)]">
      <div className="space-y-5">
        {eyebrow}
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        <p className="max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
          {description}
        </p>
        {actions ? <div className="flex flex-wrap gap-3 pt-1">{actions}</div> : null}
      </div>
      {aside ? (
        <aside className="border-t border-border pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
          <div className="grid gap-3">{aside}</div>
        </aside>
      ) : null}
    </section>
  );
}

export function LinkCard({
  href,
  title,
  description,
  meta,
  icon,
  actionLabel,
  className,
  delay = 0,
}: {
  href: string;
  title: string;
  description: string;
  meta?: ReactNode;
  icon?: ReactNode;
  actionLabel?: string;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      {...getRevealProps(shouldReduceMotion, delay)}
      whileHover={shouldReduceMotion ? undefined : { y: -8, scale: 1.01 }}
      className="h-full"
    >
      <Link
        href={href}
        className={cn(
          'group block h-full',
          className,
        )}
      >
        <Card className="surface-panel relative h-full overflow-hidden">
          <CardContent className="relative z-10 p-5 sm:p-6">
          {(icon || meta) ? (
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              {icon ? <IconBadge icon={icon} /> : <span />}
              {meta ? <div className="shrink-0">{meta}</div> : null}
            </div>
          ) : null}
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            {actionLabel ? <span>{actionLabel}</span> : null}
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export function CodeBlock({
  label,
  code,
  language,
  className,
}: {
  label: string;
  code: string;
  language: string;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      {...getRevealProps(shouldReduceMotion)}
      className={cn(
        'min-w-0 max-w-full overflow-hidden rounded-xl border shadow-lg',
        className,
      )}
      style={{
        borderColor: 'var(--code-border)',
        backgroundColor: 'var(--code-bg)',
        color: 'var(--code-foreground)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        className="flex items-center justify-between border-b px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ borderColor: 'var(--code-border)', color: 'var(--code-muted)' }}
      >
        <span>{label}</span>
        <span>{language}</span>
      </div>
      <pre className="max-w-full overflow-x-auto px-4 py-4 text-sm leading-7 sm:px-5 sm:py-5">
        <code>{code}</code>
      </pre>
    </motion.div>
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      {...getRevealProps(shouldReduceMotion)}
      className="overflow-hidden rounded-xl border border-border"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left text-sm">
          <thead className="bg-secondary">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3.5 font-semibold text-foreground sm:px-5 sm:py-4">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {rows.map((row, index) => (
              <tr key={`${row[0]}-${index}`}>
                {row.map((cell) => (
                  <td
                    key={cell}
                    className="px-4 py-3.5 align-top leading-7 text-muted-foreground sm:px-5 sm:py-4"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
