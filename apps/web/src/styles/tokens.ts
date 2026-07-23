/**
 * LFE-DESIGN-TOKENS-01 — canonical values (SSOT UI).
 * Do not invent colors/spacing/radius outside this map.
 */

export const colors = {
  bg: {
    void: '#03050A',
    base: '#080E18',
    raised: '#0C1420',
    panel: '#111A28',
    panelAlt: '#152031',
    inset: '#0A101A',
    hover: '#1A2838',
  },
  border: {
    subtle: '#2A3A4F',
    strong: '#3D5168',
    gold: '#8A7340',
  },
  text: {
    primary: '#F0F4FA',
    secondary: '#D8E0EC',
    muted: '#8B9BB0',
    faint: '#5C6D82',
    gold: '#C4A35A',
  },
  gold: {
    base: '#C4A35A',
    dim: '#8A7340',
    soft: 'rgba(196, 163, 90, 0.12)',
  },
  status: {
    ok: '#5A9E6F',
    okSoft: 'rgba(90, 158, 111, 0.15)',
    warn: '#C4A035',
    warnSoft: 'rgba(196, 160, 53, 0.15)',
    danger: '#B85A5A',
    dangerSoft: 'rgba(184, 90, 90, 0.15)',
    info: '#5A7EA0',
    live: '#C23030',
  },
  pitch: '#1F5C38',
  overlay: {
    scrim: 'rgba(3, 5, 10, 0.72)',
    hero: 'rgba(8, 12, 20, 0.55)',
  },
} as const;

export const space = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '24px',
  6: '32px',
  7: '40px',
  8: '48px',
} as const;

export const radius = {
  none: '0px',
  xs: '1px',
  sm: '2px',
  md: '4px',
} as const;

export const borderWidth = {
  hair: '1px',
  thick: '2px',
} as const;

export const shadow = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.35)',
  md: '0 8px 24px rgba(0, 0, 0, 0.45)',
} as const;

export const motion = {
  duration: {
    fast: '120ms',
    base: '180ms',
    slow: '280ms',
  },
  easing: {
    standard: 'ease-out',
  },
} as const;

export const focus = {
  ringColor: colors.gold.base,
  ringWidth: '1px',
  ringOffset: '1px',
} as const;

export const opacity = {
  disabled: '0.4',
  muted: '0.7',
  scrim: '0.72',
} as const;

export const zIndex = {
  base: 0,
  sticky: 10,
  chrome: 20,
  dropdown: 30,
  overlay: 40,
  modal: 50,
  toast: 60,
  max: 100,
} as const;

export const grid = {
  columns: 12,
  gutter: space[3],
  marginApp: space[3],
  shell: {
    nav: '168px',
    navCollapsed: '56px',
    rail: '220px',
    topbar: '36px',
  },
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1200px',
  xl: '1440px',
  uw: '1920px',
} as const;

export const overlay = {
  panelWidth: '400px',
  modalWidth: '560px',
} as const;

export const typography = {
  size: {
    hero: '36px',
    h1: '22px',
    h2: '15px',
    body: '13px',
    caption: '11px',
    label: '10px',
    table: '12px',
  },
  lineHeight: {
    hero: '1.1',
    tight: '1.2',
    body: '1.35',
  },
  tracking: {
    label: '0.06em',
  },
} as const;

/** CSS custom property map applied by ThemeProvider / globals.css */
export const cssVariableMap: Record<string, string> = {
  '--lf-color-bg-void': colors.bg.void,
  '--lf-color-bg-base': colors.bg.base,
  '--lf-color-bg-raised': colors.bg.raised,
  '--lf-color-bg-panel': colors.bg.panel,
  '--lf-color-bg-panel-alt': colors.bg.panelAlt,
  '--lf-color-bg-inset': colors.bg.inset,
  '--lf-color-bg-hover': colors.bg.hover,

  '--lf-color-border-subtle': colors.border.subtle,
  '--lf-color-border-strong': colors.border.strong,
  '--lf-color-border-gold': colors.border.gold,

  '--lf-color-text-primary': colors.text.primary,
  '--lf-color-text-secondary': colors.text.secondary,
  '--lf-color-text-muted': colors.text.muted,
  '--lf-color-text-faint': colors.text.faint,
  '--lf-color-text-gold': colors.text.gold,

  '--lf-color-gold-base': colors.gold.base,
  '--lf-color-gold-dim': colors.gold.dim,
  '--lf-color-gold-soft': colors.gold.soft,

  '--lf-color-status-ok': colors.status.ok,
  '--lf-color-status-ok-soft': colors.status.okSoft,
  '--lf-color-status-warn': colors.status.warn,
  '--lf-color-status-warn-soft': colors.status.warnSoft,
  '--lf-color-status-danger': colors.status.danger,
  '--lf-color-status-danger-soft': colors.status.dangerSoft,
  '--lf-color-status-info': colors.status.info,
  '--lf-color-status-live': colors.status.live,
  '--lf-color-pitch': colors.pitch,

  '--lf-color-overlay-scrim': colors.overlay.scrim,
  '--lf-color-overlay-hero': colors.overlay.hero,

  '--lf-space-1': space[1],
  '--lf-space-2': space[2],
  '--lf-space-3': space[3],
  '--lf-space-4': space[4],
  '--lf-space-5': space[5],
  '--lf-space-6': space[6],
  '--lf-space-7': space[7],
  '--lf-space-8': space[8],

  '--lf-radius-none': radius.none,
  '--lf-radius-xs': radius.xs,
  '--lf-radius-sm': radius.sm,
  '--lf-radius-md': radius.md,

  '--lf-border-width-hair': borderWidth.hair,
  '--lf-border-width-thick': borderWidth.thick,

  '--lf-shadow-none': shadow.none,
  '--lf-shadow-sm': shadow.sm,
  '--lf-shadow-md': shadow.md,

  '--lf-motion-fast': motion.duration.fast,
  '--lf-motion-base': motion.duration.base,
  '--lf-motion-slow': motion.duration.slow,
  '--lf-motion-easing': motion.easing.standard,

  '--lf-focus-ring-color': focus.ringColor,
  '--lf-focus-ring-width': focus.ringWidth,
  '--lf-focus-ring-offset': focus.ringOffset,

  '--lf-opacity-disabled': opacity.disabled,
  '--lf-opacity-muted': opacity.muted,

  '--lf-z-base': String(zIndex.base),
  '--lf-z-sticky': String(zIndex.sticky),
  '--lf-z-chrome': String(zIndex.chrome),
  '--lf-z-dropdown': String(zIndex.dropdown),
  '--lf-z-overlay': String(zIndex.overlay),
  '--lf-z-modal': String(zIndex.modal),
  '--lf-z-toast': String(zIndex.toast),

  '--lf-grid-gutter': grid.gutter,
  '--lf-grid-margin': grid.marginApp,
  '--lf-shell-nav': grid.shell.nav,
  '--lf-shell-nav-collapsed': grid.shell.navCollapsed,
  '--lf-shell-rail': grid.shell.rail,
  '--lf-shell-topbar': grid.shell.topbar,

  '--lf-overlay-panel-width': overlay.panelWidth,
  '--lf-overlay-modal-width': overlay.modalWidth,

  '--lf-type-hero': typography.size.hero,
  '--lf-type-h1': typography.size.h1,
  '--lf-type-h2': typography.size.h2,
  '--lf-type-body': typography.size.body,
  '--lf-type-caption': typography.size.caption,
  '--lf-type-label': typography.size.label,
  '--lf-type-table': typography.size.table,
  '--lf-type-tracking-label': typography.tracking.label,

  /* Legacy aliases → canonical (compat for existing pages) */
  '--lf-bg': colors.bg.base,
  '--lf-bg-raised': colors.bg.raised,
  '--lf-panel': colors.bg.panel,
  '--lf-panel-alt': colors.bg.panelAlt,
  '--lf-panel-hover': colors.bg.hover,
  '--lf-border': colors.border.subtle,
  '--lf-border-strong': colors.border.strong,
  '--lf-inset': colors.bg.inset,
  '--lf-text': colors.text.secondary,
  '--lf-text-strong': colors.text.primary,
  '--lf-muted': colors.text.muted,
  '--lf-faint': colors.text.faint,
  '--lf-gold': colors.gold.base,
  '--lf-gold-dim': colors.gold.dim,
  '--lf-gold-soft': colors.gold.soft,
  '--lf-ok': colors.status.ok,
  '--lf-ok-soft': colors.status.okSoft,
  '--lf-warn': colors.status.warn,
  '--lf-warn-soft': colors.status.warnSoft,
  '--lf-danger': colors.status.danger,
  '--lf-danger-soft': colors.status.dangerSoft,
  '--lf-info': colors.status.info,
  '--lf-topbar-h': grid.shell.topbar,
  '--lf-sidebar-w': grid.shell.nav,
  '--lf-aside-w': grid.shell.rail,
  '--lf-radius': radius.sm,
  '--bg': colors.bg.base,
  '--bg-elevated': colors.bg.panel,
  '--border': colors.border.subtle,
  '--text': colors.text.secondary,
  '--muted': colors.text.muted,
  '--accent': colors.gold.base,
  '--warn': colors.status.warn,
  '--danger': colors.status.danger,
};
