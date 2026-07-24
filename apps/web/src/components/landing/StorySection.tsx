'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type StorySectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  /** Optional visual slot (wow / atmosphere) */
  visual?: ReactNode;
  reverse?: boolean;
};

/**
 * S1–S3 story beat — reveal on scroll once; static if reduced motion.
 */
export function StorySection({ id, eyebrow, title, children, visual, reverse }: StorySectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={[
        'lf-landing__story',
        reverse ? 'lf-landing__story--reverse' : '',
        visible ? 'lf-landing__story--visible' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={`${id}-title`}
    >
      <div className="lf-landing__story-copy">
        {eyebrow ? <p className="lf-landing__eyebrow">{eyebrow}</p> : null}
        <h2 id={`${id}-title`} className="lf-landing__story-title">
          {title}
        </h2>
        <div className="lf-landing__story-body">{children}</div>
      </div>
      {visual ? (
        <div className="lf-landing__story-visual" aria-hidden>
          {visual}
        </div>
      ) : null}
    </section>
  );
}
