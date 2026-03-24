'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { useSiteCopy } from '@/components/locale-provider';
import { ORGANIZATION_SITE_URL } from '@/lib/seo';
import { cn } from '@/lib/utils';

type CompanyWebsiteLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  children: ReactNode;
};

export function CompanyWebsiteLink({
  children,
  className,
  rel,
  target,
  'aria-label': ariaLabel,
  ...props
}: CompanyWebsiteLinkProps) {
  const copy = useSiteCopy();

  return (
    <a
      href={ORGANIZATION_SITE_URL}
      target={target ?? '_blank'}
      rel={rel ?? 'noopener noreferrer'}
      aria-label={ariaLabel ?? copy.brand.companyWebsiteAriaLabel}
      className={cn(className)}
      {...props}
    >
      {children}
    </a>
  );
}
