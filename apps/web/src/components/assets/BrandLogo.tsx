import Image from 'next/image';

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'lockup' | 'wordmark' | 'monogram';
  mode?: 'dark' | 'light';
  className?: string;
  priority?: boolean;
};

const SIZE_MAP = {
  sm: { w: 104, h: 20, monogram: 20 },
  md: { w: 166, h: 28, monogram: 24 },
  lg: { w: 274, h: 46, monogram: 40 },
  /** Premium marketing header / auth chrome */
  xl: { w: 220, h: 38, monogram: 32 },
} as const;

/**
 * K1 + K3 brand system: geometric monogram + LASTFOOTBALL wordmark.
 */
export function BrandLogo({
  size = 'md',
  variant = 'lockup',
  mode = 'dark',
  className,
  priority = false,
}: BrandLogoProps) {
  const tokens = SIZE_MAP[size];
  const baseClass = className ? ` ${className}` : '';

  if (variant === 'monogram') {
    return (
      <Image
        src="/monogram.svg"
        alt="LastFootball"
        width={tokens.monogram}
        height={tokens.monogram}
        className={baseClass ? baseClass.trim() : undefined}
        priority={priority}
      />
    );
  }

  if (variant === 'wordmark') {
    const wordmarkSrc = mode === 'light' ? '/logo-light.svg' : '/logo-dark.svg';
    return (
      <Image
        src={wordmarkSrc}
        alt="LastFootball"
        width={tokens.w}
        height={tokens.h}
        className={baseClass ? baseClass.trim() : undefined}
        priority={priority}
      />
    );
  }

  const lockupSrc = mode === 'light' ? '/logo-light.svg' : '/logo.svg';
  return (
    <Image
      src={lockupSrc}
      alt="LastFootball"
      width={tokens.w}
      height={tokens.h}
      className={baseClass ? baseClass.trim() : undefined}
      priority={priority}
    />
  );
}
