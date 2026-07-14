import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import './TableScrollWrapper.css';

interface TableScrollWrapperProps {
  children: ReactNode;
}

export function TableScrollWrapper({ children }: TableScrollWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const scrollable = element.scrollWidth > element.clientWidth + 2;
    setIsScrollable(scrollable);
    setCanScrollLeft(scrollable && element.scrollLeft > 4);
    setCanScrollRight(
      scrollable && element.scrollLeft + element.clientWidth < element.scrollWidth - 4,
    );
  }, []);

  useEffect(() => {
    updateScrollState();

    const element = scrollRef.current;
    if (!element) {
      return;
    }

    element.addEventListener('scroll', updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, children]);

  const scrollClassName = [
    'table-scroll',
    isScrollable ? 'table-scroll--scrollable' : '',
    canScrollLeft ? 'table-scroll--left' : '',
    canScrollRight ? 'table-scroll--right' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={scrollClassName}>
      {canScrollLeft && <div className="table-scroll__fade table-scroll__fade--left" aria-hidden="true" />}
      {canScrollRight && <div className="table-scroll__fade table-scroll__fade--right" aria-hidden="true" />}

      <div ref={scrollRef} className="table-wrapper" tabIndex={isScrollable ? 0 : undefined}>
        {children}
      </div>

      {isScrollable && (
        <p className="table-scroll__hint" aria-hidden="true">
          ← Swipe or scroll to see more →
        </p>
      )}
    </div>
  );
}
