'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { PropsWithChildren, ReactNode } from 'react';

import { ArrowRightIcon } from '@/components/icons';
import {
  type BundledLanguage,
  CodeBlock as UICodeBlock,
  type CodeBlockData as UICodeBlockData,
  CodeBlockBody as UICodeBlockBody,
  CodeBlockContent as UICodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem as UICodeBlockItem,
  CodeBlockSelect,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockSelectTrigger,
  CodeBlockSelectValue,
} from '@/components/ui/code-block';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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

type CodePanelSample = {
  label: string;
  code: string;
  language: string;
};

function resolveSyntaxLanguage(language: string): BundledLanguage {
  switch (language.toLowerCase()) {
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'md':
      return 'markdown';
    case 'sh':
    case 'shell':
      return 'bash';
    default:
      return language;
  }
}

function resolveDisplayLanguage(language: string) {
  switch (language.toLowerCase()) {
    case 'js':
      return 'JS';
    case 'ts':
      return 'TS';
    default:
      return language.toUpperCase();
  }
}

function resolveFilename(language: string) {
  switch (language.toLowerCase()) {
    case 'bash':
    case 'sh':
    case 'shell':
      return 'request.sh';
    case 'js':
      return 'example.js';
    case 'ts':
      return 'example.ts';
    case 'tsx':
      return 'component.tsx';
    case 'jsx':
      return 'component.jsx';
    case 'json':
      return 'response.json';
    case 'md':
    case 'markdown':
      return 'readme.md';
    case 'html':
      return 'index.html';
    default:
      return `snippet.${language.toLowerCase()}`;
  }
}

function shouldShowLineNumbers(language: string) {
  return !['bash', 'sh', 'shell', 'json', 'md', 'markdown', 'text', 'plaintext'].includes(
    language.toLowerCase(),
  );
}

function shouldHighlightSyntax(language: string) {
  return !['text', 'plaintext'].includes(language.toLowerCase());
}

function buildCodeBlockData(samples: CodePanelSample[]): UICodeBlockData[] {
  return samples.map((sample, index) => ({
    value: `${sample.language}-${index}`,
    language: sample.language,
    displayLanguage: resolveDisplayLanguage(sample.language),
    filename: resolveFilename(sample.language),
    label: sample.label,
    code: sample.code,
    lineNumbers: shouldShowLineNumbers(sample.language),
    syntaxHighlighting: shouldHighlightSyntax(sample.language),
    syntaxLanguage: resolveSyntaxLanguage(sample.language),
  }));
}

function CodePanel({
  samples,
  className,
  heightClassName,
}: {
  samples: CodePanelSample[];
  className?: string;
  heightClassName: string;
}) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const data = buildCodeBlockData(samples);

  if (!data.length) {
    return null;
  }

  return (
    <motion.div
      {...getRevealProps(shouldReduceMotion)}
      className={cn('min-w-0 max-w-full', className)}
    >
      <UICodeBlock
        data={data}
        defaultValue={data[0]?.value}
        className="min-w-0 overflow-hidden rounded-xl border shadow-lg"
        style={{
          borderColor: 'var(--code-border)',
          backgroundColor: 'var(--code-bg)',
          color: 'var(--code-foreground)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <CodeBlockHeader
          style={{
            borderColor: 'var(--code-border)',
            backgroundColor: 'var(--code-toolbar)',
            color: 'var(--code-muted)',
          }}
        >
          <CodeBlockFiles>
            {(item) => (
              <CodeBlockFilename
                key={item.value}
                value={item.value}
                filename={item.filename}
                language={item.language}
                className="min-w-0 text-[0.8rem] font-medium"
                style={{ color: 'var(--code-muted)' }}
              >
                {item.label ?? item.filename}
              </CodeBlockFilename>
            )}
          </CodeBlockFiles>

          {data.length > 1 ? (
            <CodeBlockSelect>
              <CodeBlockSelectTrigger
                aria-label="Choose code sample language"
                style={{
                  backgroundColor: 'var(--code-chip-bg)',
                  color: 'var(--code-chip-foreground)',
                }}
              >
                <CodeBlockSelectValue />
              </CodeBlockSelectTrigger>
              <CodeBlockSelectContent align="end">
                {(item) => (
                  <CodeBlockSelectItem key={item.value} value={item.value}>
                    {item.displayLanguage ?? resolveDisplayLanguage(item.language)}
                  </CodeBlockSelectItem>
                )}
              </CodeBlockSelectContent>
            </CodeBlockSelect>
          ) : null}

          <CodeBlockCopyButton
            aria-label="Copy code sample"
            className="hover:bg-[var(--code-chip-bg)] hover:text-[var(--code-foreground)]"
            style={{
              color: 'var(--code-muted)',
            }}
          />
        </CodeBlockHeader>

        <ScrollArea
          className={cn('w-full', heightClassName)}
          style={{ backgroundColor: 'var(--code-bg)' }}
        >
          <UICodeBlockBody className="h-full">
            {(item) => (
              <UICodeBlockItem
                key={item.value}
                value={item.value}
                lineNumbers={item.lineNumbers}
                className="h-full"
              >
                <UICodeBlockContent
                  className="h-full"
                  language={item.syntaxLanguage}
                  syntaxHighlighting={item.syntaxHighlighting}
                >
                  {item.code}
                </UICodeBlockContent>
              </UICodeBlockItem>
            )}
          </UICodeBlockBody>
        </ScrollArea>
      </UICodeBlock>
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
  return (
    <CodePanel
      samples={[{ label, code, language }]}
      className={className}
      heightClassName="max-h-[30rem]"
    />
  );
}

export function CodeSampleSwitcher({
  samples,
  className,
}: {
  samples: {
    label: string;
    code: string;
    language: string;
  }[];
  className?: string;
}) {
  return (
    <CodePanel
      samples={samples}
      className={className}
      heightClassName="h-[22rem]"
    />
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
