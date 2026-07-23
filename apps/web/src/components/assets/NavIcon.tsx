'use client';

import { NAV_ICON_FILES, NAV_ITEM_ICON, navIconSrc, type NavIconId } from '@/assets';

type NavIconProps = {
  /** Nav item id from lib/nav (panel, squad, …) or direct NavIconId */
  id: string;
  active?: boolean;
  size?: number;
  title?: string;
};

function toNavIconId(id: string): NavIconId | null {
  if (id in NAV_ITEM_ICON) return NAV_ITEM_ICON[id] ?? null;
  if (id in NAV_ICON_FILES) return id as NavIconId;
  return null;
}

/**
 * Stroke nav icon from Asset Pack (currentColor via CSS mask).
 * Active → gold token; idle → inherits text color.
 */
export function NavIcon({ id, active = false, size = 16, title }: NavIconProps) {
  const iconId = toNavIconId(id);
  if (!iconId) return null;
  const src = navIconSrc(iconId);

  return (
    <span
      role="img"
      aria-hidden={title ? undefined : true}
      title={title}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: active ? 'var(--lf-color-gold-base)' : 'currentColor',
        maskImage: `url(${src})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: `url(${src})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}
