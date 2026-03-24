'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

function getProgressTarget(current: number) {
  if (current < 28) {
    return current + 18;
  }

  if (current < 56) {
    return current + 12;
  }

  if (current < 82) {
    return current + 5;
  }

  return current;
}

export function RouteProgress() {
  const pathname = usePathname();
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const mountedRef = useRef(false);
  const finishTimeoutRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);
  const safetyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (finishTimeoutRef.current) {
        window.clearTimeout(finishTimeoutRef.current);
      }

      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }

      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current);
      }

      if (safetyTimeoutRef.current) {
        window.clearTimeout(safetyTimeoutRef.current);
      }
    };

    const finishProgress = () => {
      clearTimers();
      setProgress(100);

      finishTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
        resetTimeoutRef.current = window.setTimeout(() => {
          setProgress(0);
        }, shouldReduceMotion ? 0 : 180);
      }, shouldReduceMotion ? 0 : 220);
    };

    const startProgress = () => {
      clearTimers();
      setIsVisible(true);
      setProgress((current) => (current > 10 ? current : 12));
      progressTimerRef.current = window.setInterval(() => {
        setProgress((current) => getProgressTarget(current));
      }, 180);
      safetyTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 10000);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href]');

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.target && anchor.target !== '_self') {
        return;
      }

      if (anchor.hasAttribute('download') || anchor.getAttribute('rel') === 'external') {
        return;
      }

      const href = anchor.getAttribute('href');

      if (!href || href.startsWith('#')) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) {
        return;
      }

      if (
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search
      ) {
        return;
      }

      startProgress();
    };

    const handlePopState = () => {
      startProgress();
    };

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('popstate', handlePopState);

    if (mountedRef.current) {
      finishProgress();
    } else {
      mountedRef.current = true;
    }

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('popstate', handlePopState);
      clearTimers();
    };
  }, [pathname, shouldReduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] overflow-hidden"
    >
      <motion.div
        className="route-progress-bar h-full"
        animate={{
          opacity: isVisible ? 1 : 0,
          width: isVisible ? `${Math.max(progress, 0)}%` : '0%',
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.22,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </div>
  );
}
