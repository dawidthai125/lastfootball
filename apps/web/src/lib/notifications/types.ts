/** Notifications (GDD §22, D132). Shared shapes, safe for the browser. */

export const NOTIFICATION_KINDS = ['matchday', 'human_round', 'offer', 'challenge'] as const;

export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];
export type NotificationChannel = 'push' | 'email';

export type NotificationKinds = Readonly<Record<NotificationKind, boolean>>;

export type NotificationPrefs = {
  readonly push: boolean;
  readonly email: boolean;
  readonly kinds: NotificationKinds;
};

export const NO_KINDS: NotificationKinds = {
  matchday: false,
  human_round: false,
  offer: false,
  challenge: false,
};

export const PREFS_OFF: NotificationPrefs = { push: false, email: false, kinds: NO_KINDS };

export const MAX_PUSH_DEVICES = 5;

export type EmailChannelState = 'ready' | 'unconfirmed' | 'soon';

export type NotificationSettings = {
  readonly prefs: NotificationPrefs;
  /** Public by design: the browser needs it to subscribe. Null hides the push toggle. */
  readonly vapidPublicKey: string | null;
  readonly emailState: EmailChannelState;
  readonly deviceCount: number;
};

export type NotificationActionResult = {
  readonly ok: boolean;
  readonly message: string;
  /** What is stored now, so an older tab shows the truth after saving. */
  readonly prefs?: NotificationPrefs;
};

/** Only what the manager changed. An older tab must not write back the rest. */
export type NotificationChanges = {
  readonly email?: boolean;
  readonly kinds?: Partial<NotificationKinds>;
};

export function changedPrefs(
  before: NotificationPrefs,
  after: Pick<NotificationPrefs, 'email' | 'kinds'>,
): NotificationChanges {
  const kinds: Partial<Record<NotificationKind, boolean>> = {};
  for (const kind of NOTIFICATION_KINDS) {
    if (before.kinds[kind] !== after.kinds[kind]) kinds[kind] = after.kinds[kind];
  }
  return {
    ...(before.email !== after.email ? { email: after.email } : {}),
    ...(Object.keys(kinds).length > 0 ? { kinds } : {}),
  };
}

/** foreign: this browser's subscription is not the signed-in manager's. */
export type PushDeviceOwner = 'own' | 'foreign' | 'unknown';
