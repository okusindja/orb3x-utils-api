'use client';

import {
  SiDocker,
  SiGnubash,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiMarkdown,
  SiNextdotjs,
  SiPython,
  SiReact,
  SiSvg,
  SiTailwindcss,
  SiToml,
  SiTypescript,
} from '@icons-pack/react-simple-icons';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { CheckIcon, CopyIcon } from 'lucide-react';
import type { ComponentProps, ComponentType, HTMLAttributes, ReactNode, SVGProps } from 'react';
import { createContext, createElement, useContext, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type BundledLanguage = string;

export type CodeBlockData = {
  value: string;
  language: string;
  displayLanguage?: string;
  filename: string;
  label?: string;
  code: string;
  lineNumbers?: boolean;
  syntaxHighlighting?: boolean;
  syntaxLanguage?: BundledLanguage;
  icon?: IconType;
};

type CodeBlockContextType = {
  value: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
  data: CodeBlockData[];
};

const filenameIconMap: Array<[RegExp, IconType]> = [
  [/^.*\.(?:sh|bash)$/i, SiGnubash],
  [/^.*\.(?:js|mjs|cjs)$/i, SiJavascript],
  [/^.*\.(?:ts|mts|cts)$/i, SiTypescript],
  [/^.*\.(?:tsx|jsx)$/i, SiReact],
  [/^.*\.json$/i, SiJson],
  [/^.*\.mdx?$/i, SiMarkdown],
  [/^.*\.html?$/i, SiHtml5],
  [/^.*\.py$/i, SiPython],
  [/^.*\.svg$/i, SiSvg],
  [/^.*\.toml$/i, SiToml],
  [/^.*tailwind\.config\..*$/i, SiTailwindcss],
  [/^.*next\.config\..*$/i, SiNextdotjs],
  [/^dockerfile$/i, SiDocker],
];

const lineNumberClassNames = cn(
  '[&_code]:[counter-reset:line]',
  '[&_code]:[counter-increment:line_0]',
  '[&_.line]:before:content-[counter(line)]',
  '[&_.line]:before:inline-block',
  '[&_.line]:before:[counter-increment:line]',
  '[&_.line]:before:w-4',
  '[&_.line]:before:mr-4',
  '[&_.line]:before:text-[13px]',
  '[&_.line]:before:text-right',
  '[&_.line]:before:font-mono',
  '[&_.line]:before:select-none',
);

const codeBlockClassName = cn(
  'code-block-syntax mt-0 h-full text-sm',
  '[&_pre]:m-0',
  '[&_pre]:py-4',
  '[&_code]:grid',
  '[&_code]:w-full',
  '[&_code]:h-full',
  '[&_code]:min-w-full',
  '[&_.line]:block',
  '[&_.line]:w-full',
  '[&_.line]:relative',
  '[&_.line]:px-4',
  'sm:[&_.line]:px-5',
);

const CodeBlockContext = createContext<CodeBlockContextType>({
  value: undefined,
  onValueChange: undefined,
  data: [],
});

const highlightCache = new Map<string, string>();

function resolveIcon(filename: string, fallbackIcon?: IconType) {
  if (fallbackIcon) {
    return fallbackIcon;
  }

  return filenameIconMap.find(([pattern]) => pattern.test(filename))?.[1];
}

function resolveLanguageIcon(language?: string) {
  switch (language?.toLowerCase()) {
    case 'bash':
    case 'sh':
    case 'shell':
      return SiGnubash;
    case 'js':
    case 'javascript':
      return SiJavascript;
    case 'ts':
    case 'typescript':
      return SiTypescript;
    case 'tsx':
    case 'jsx':
      return SiReact;
    case 'json':
      return SiJson;
    case 'md':
    case 'markdown':
      return SiMarkdown;
    case 'html':
      return SiHtml5;
    case 'python':
    case 'py':
      return SiPython;
    case 'svg':
      return SiSvg;
    default:
      return undefined;
  }
}

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  data: CodeBlockData[];
};

export function CodeBlock({
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  defaultValue,
  className,
  data,
  children,
  ...props
}: CodeBlockProps) {
  const [value, onValueChange] = useControllableState({
    defaultProp: defaultValue ?? data[0]?.value ?? '',
    prop: controlledValue,
    onChange: controlledOnValueChange,
  });

  return (
    <CodeBlockContext.Provider value={{ value, onValueChange, data }}>
      <div
        className={cn('size-full overflow-hidden rounded-xl border', className)}
        {...props}
      >
        {children}
      </div>
    </CodeBlockContext.Provider>
  );
}

export type CodeBlockHeaderProps = HTMLAttributes<HTMLDivElement>;

export function CodeBlockHeader({ className, ...props }: CodeBlockHeaderProps) {
  return (
    <div
      className={cn('flex flex-row items-center gap-2 border-b px-2 py-2 sm:px-3', className)}
      {...props}
    />
  );
}

export type CodeBlockFilesProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children: (item: CodeBlockData) => ReactNode;
};

export function CodeBlockFiles({ className, children, ...props }: CodeBlockFilesProps) {
  const { data } = useContext(CodeBlockContext);

  return (
    <div className={cn('flex min-w-0 grow items-center gap-2', className)} {...props}>
      {data.map(children)}
    </div>
  );
}

export type CodeBlockFilenameProps = HTMLAttributes<HTMLDivElement> & {
  icon?: IconType;
  value?: string;
  filename?: string;
  language?: string;
};

export function CodeBlockFilename({
  className,
  icon,
  value,
  filename,
  language,
  children,
  ...props
}: CodeBlockFilenameProps) {
  const { value: activeValue } = useContext(CodeBlockContext);
  const iconComponent =
    resolveIcon(filename ?? String(children ?? ''), icon) ?? resolveLanguageIcon(language);

  if (value !== activeValue) {
    return null;
  }

  return (
    <div
      className={cn('flex min-w-0 items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground', className)}
      {...props}
    >
      {iconComponent ? createElement(iconComponent, { className: 'h-4 w-4 shrink-0' }) : null}
      <span className="truncate">{children}</span>
    </div>
  );
}

export type CodeBlockSelectProps = ComponentProps<typeof Select>;

export function CodeBlockSelect(props: CodeBlockSelectProps) {
  const { value, onValueChange } = useContext(CodeBlockContext);

  return <Select onValueChange={onValueChange} value={value} {...props} />;
}

export type CodeBlockSelectTriggerProps = ComponentProps<typeof SelectTrigger>;

export function CodeBlockSelectTrigger({
  className,
  ...props
}: CodeBlockSelectTriggerProps) {
  return (
    <SelectTrigger
      className={cn(
        'h-8 w-fit min-w-[5.5rem] border-none bg-transparent px-2.5 pr-9 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground shadow-none',
        className,
      )}
      {...props}
    />
  );
}

export type CodeBlockSelectValueProps = ComponentProps<typeof SelectValue>;

export function CodeBlockSelectValue(props: CodeBlockSelectValueProps) {
  return <SelectValue {...props} />;
}

export type CodeBlockSelectContentProps = Omit<ComponentProps<typeof SelectContent>, 'children'> & {
  children: (item: CodeBlockData) => ReactNode;
};

export function CodeBlockSelectContent({
  children,
  ...props
}: CodeBlockSelectContentProps) {
  const { data } = useContext(CodeBlockContext);

  return <SelectContent {...props}>{data.map(children)}</SelectContent>;
}

export type CodeBlockSelectItemProps = ComponentProps<typeof SelectItem>;

export function CodeBlockSelectItem({
  className,
  ...props
}: CodeBlockSelectItemProps) {
  return <SelectItem className={cn('text-sm', className)} {...props} />;
}

export type CodeBlockCopyButtonProps = Omit<ComponentProps<typeof Button>, 'children'> & {
  children?: ReactNode;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export function CodeBlockCopyButton({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps & { asChild?: boolean }) {
  const [isCopied, setIsCopied] = useState(false);
  const { data, value } = useContext(CodeBlockContext);
  const code = data.find((item) => item.value === value)?.code;
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = () => {
    if (typeof window === 'undefined' || !navigator.clipboard.writeText || !code) {
      return;
    }

    navigator.clipboard.writeText(code).then(
      () => {
        setIsCopied(true);
        onCopy?.();

        timeoutRef.current = window.setTimeout(() => setIsCopied(false), timeout);
      },
      (error) => onError?.(error),
    );
  };

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn('size-8 shrink-0 rounded-md', className)}
      onClick={copyToClipboard}
      size="icon"
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon className="size-4 text-current" />}
    </Button>
  );
}

type CodeBlockFallbackProps = HTMLAttributes<HTMLDivElement>;

function CodeBlockFallback({ children, ...props }: CodeBlockFallbackProps) {
  return (
    <div className="code-block-fallback h-full" {...props}>
      <pre className="w-full">
        <code>
          {children
            ?.toString()
            .split('\n')
            .map((line, index) => (
              <span className="line" key={index}>
                {line}
              </span>
            ))}
        </code>
      </pre>
    </div>
  );
}

export type CodeBlockBodyProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children: (item: CodeBlockData) => ReactNode;
};

export function CodeBlockBody({ children, ...props }: CodeBlockBodyProps) {
  const { data } = useContext(CodeBlockContext);

  return <div {...props}>{data.map(children)}</div>;
}

export type CodeBlockItemProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
  lineNumbers?: boolean;
};

export function CodeBlockItem({
  children,
  lineNumbers = true,
  className,
  value,
  ...props
}: CodeBlockItemProps) {
  const { value: activeValue } = useContext(CodeBlockContext);

  if (value !== activeValue) {
    return null;
  }

  return (
    <div
      className={cn(
        codeBlockClassName,
        lineNumbers && lineNumberClassNames,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CodeBlockContentProps = HTMLAttributes<HTMLDivElement> & {
  themes?: {
    light: string;
    dark: string;
  };
  language?: BundledLanguage;
  syntaxHighlighting?: boolean;
  children: string;
};

export function CodeBlockContent({
  children,
  themes = {
    light: 'vitesse-light',
    dark: 'vitesse-dark',
  },
  language = 'typescript',
  syntaxHighlighting = true,
  ...props
}: CodeBlockContentProps) {
  const [highlightedCode, setHighlightedCode] = useState('');
  const [isLoading, setIsLoading] = useState(syntaxHighlighting);

  useEffect(() => {
    if (!syntaxHighlighting) {
      setHighlightedCode('');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const cacheKey = `${language}:${themes.light}:${themes.dark}:${children}`;
    const cachedCode = highlightCache.get(cacheKey);

    if (cachedCode) {
      setHighlightedCode(cachedCode);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const frameId = window.requestAnimationFrame(() => {
      void (async () => {
        try {
          const { codeToHtml } = await import('shiki');
          const html = await codeToHtml(children, {
            lang: language,
            themes: {
              light: themes.light,
              dark: themes.dark,
            },
          });

          if (cancelled) {
            return;
          }

          highlightCache.set(cacheKey, html);
          setHighlightedCode(html);
        } catch (error) {
          console.error(`Failed to highlight code for language "${language}":`, error);
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      })();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
    };
  }, [children, language, themes.dark, themes.light, syntaxHighlighting]);

  if (!syntaxHighlighting || isLoading || !highlightedCode) {
    return <CodeBlockFallback {...props}>{children}</CodeBlockFallback>;
  }

  return <div dangerouslySetInnerHTML={{ __html: highlightedCode }} {...props} />;
}
