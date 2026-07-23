import type { ReactNode } from 'react';

type GridProps = {
  children: ReactNode;
  className?: string;
};

/** 12-column content grid using canonical gutter token. */
export function Grid({ children, className = '' }: GridProps) {
  return <div className={`lf-grid ${className}`.trim()}>{children}</div>;
}

type GridItemProps = {
  children: ReactNode;
  span?: 4 | 5 | 6 | 7 | 8 | 12;
  className?: string;
};

export function GridItem({ children, span = 12, className = '' }: GridItemProps) {
  return <div className={`lf-grid__span-${span} ${className}`.trim()}>{children}</div>;
}
