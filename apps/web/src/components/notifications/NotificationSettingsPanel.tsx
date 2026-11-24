'use client';

import { useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/FormControls';
import {
  checkPushDevice,
  removeAllPushDevices,
  removePushDevice,
  saveNotificationPrefs,
  savePushDevice,
  sendTestPush,
} from '@/lib/notifications/actions';
import {
  NOTIFICATION_KINDS,
  type NotificationActionResult,
  type NotificationKind,
  type NotificationSettings,
} from '@/lib/notifications/types';

type DeviceState = 'checking' | 'unsupported' | 'ios' | 'denied' | 'off' | 'on';

const KIND_LABELS: Readonly<Record<NotificationKind, string>> = {
  matchday: 'Mecz ligowy do rozegrania (17:00–20:00)',
  human_round: 'Liga ludzi przed wspólnym początkiem (ok. 17:30)',
  offer: 'Oferta transferowa do decyzji',
  challenge: 'Rywal rozegrał wyzwanie z Twoim klubem',
};

const PUSH_NOTES: Readonly<Record<DeviceState, string | null>> = {
  checking: null,
  unsupported: 'Ta przeglądarka nie obsługuje powiadomień.',
  ios: 'Na iPhonie i iPadzie najpierw wybierz Udostępnij, potem Dodaj do ekranu początkowego. Otwórz grę z tej ikony i wróć tutaj.',
  denied: 'Powiadomienia są zablokowane w ustawieniach przeglądarki.',
  off: null,
  on: null,
};

function keyBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function sameKey(current: ArrayBuffer | null, expected: Uint8Array): boolean {
  // Some browsers do not tell the key. Then the subscription stays as it is.
  if (!current) return true;
  const bytes = new Uint8Array(current);
  return bytes.length === expected.length && bytes.every((byte, i) => byte === expected[i]);
}

function devicePayload(subscription: PushSubscription) {
  const { endpoint, keys } = subscription.toJSON();
  return { endpoint, p256dh: keys?.p256dh, auth: keys?.auth };
}

/** Uses the current subscription when its key still matches the server, else makes a new one. */
async function subscribe(
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string,
): Promise<PushSubscription> {
  const key = keyBytes(vapidPublicKey);
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    if (sameKey(existing.options.applicationServerKey, key)) return existing;
    await removePushDevice(existing.endpoint);
    await existing.unsubscribe();
  }
  return registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
}

function unsupportedState(): DeviceState | null {
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
    return null;
  }
  return ios ? 'ios' : 'unsupported';
}

/** Reads only. The permission question waits for a click. */
async function readDevice(vapidPublicKey: string): Promise<DeviceState> {
  const missing = unsupportedState();
  if (missing) return missing;
  if (Notification.permission === 'denied') return 'denied';
  const registration = await navigator.serviceWorker.getRegistration('/');
  const subscription = await registration?.pushManager.getSubscription();
  if (!registration || !subscription) return 'off';
  if (!(await checkPushDevice(subscription.endpoint))) return 'off';
  if (!sameKey(subscription.options.applicationServerKey, keyBytes(vapidPublicKey))) {
    const renewed = await subscribe(registration, vapidPublicKey);
    return (await savePushDevice(devicePayload(renewed))).ok ? 'on' : 'off';
  }
  return 'on';
}

export function NotificationSettingsPanel({ settings }: { settings: NotificationSettings }) {
  const { vapidPublicKey, emailState, deviceCount } = settings;
  const [device, setDevice] = useState<DeviceState>('checking');
  const [email, setEmail] = useState(settings.prefs.email);
  const [kinds, setKinds] = useState(settings.prefs.kinds);
  const [result, setResult] = useState<NotificationActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!vapidPublicKey) return;
    let alive = true;
    readDevice(vapidPublicKey)
      .catch((): DeviceState => 'off')
      .then((state) => {
        if (alive) setDevice(state);
      });
    return () => {
      alive = false;
    };
  }, [vapidPublicKey]);

  const run = (work: () => Promise<NotificationActionResult>) => {
    setResult(null);
    startTransition(async () => {
      try {
        setResult(await work());
      } catch {
        setResult({ ok: false, message: 'Nie udało się. Spróbuj ponownie.' });
      }
    });
  };

  const enable = () =>
    run(async () => {
      if (!vapidPublicKey) return { ok: false, message: 'Powiadomienia są teraz niedostępne.' };
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setDevice(permission === 'denied' ? 'denied' : 'off');
        return { ok: false, message: 'Przeglądarka nie dostała zgody na powiadomienia.' };
      }
      await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
      const registration = await navigator.serviceWorker.ready;
      const saved = await savePushDevice(
        devicePayload(await subscribe(registration, vapidPublicKey)),
      );
      setDevice(saved.ok ? 'on' : 'off');
      return saved;
    });

  const disable = () =>
    run(async () => {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const subscription = await registration?.pushManager.getSubscription();
      if (!subscription) {
        setDevice('off');
        return { ok: true, message: 'Powiadomienia na tym urządzeniu są wyłączone.' };
      }
      const removed = await removePushDevice(subscription.endpoint);
      await subscription.unsubscribe();
      if (removed.ok) setDevice('off');
      return removed;
    });

  const disableAll = () =>
    run(async () => {
      const removed = await removeAllPushDevices();
      if (removed.ok && device === 'on') setDevice('off');
      return removed;
    });

  const note = PUSH_NOTES[device];
  const anyKind = NOTIFICATION_KINDS.some((kind) => kinds[kind]);
  const anyChannel = email || device === 'on' || deviceCount > 0;

  return (
    <div className="space-y-3 text-[12px]">
      <p className="m-0 text-[var(--lf-muted)]">
        Powiadomienia tylko zapraszają do gry. Najwyżej dwa dziennie na kanał, nigdy między 22:00 a
        8:00. Wszystko, o czym piszą, jest też w grze.
      </p>

      <div className="space-y-1.5">
        <h3 className="m-0 text-[12px] font-semibold">Na telefonie i komputerze</h3>
        {vapidPublicKey ? (
          <>
            {note ? <p className="m-0">{note}</p> : null}
            <div className="flex flex-wrap gap-1.5">
              {device === 'off' ? (
                <Button variant="primary" size="md" disabled={pending} onClick={enable}>
                  Włącz na tym urządzeniu
                </Button>
              ) : null}
              {device === 'on' ? (
                <Button size="md" disabled={pending} onClick={disable}>
                  Wyłącz na tym urządzeniu
                </Button>
              ) : null}
              {device === 'on' || deviceCount > 0 ? (
                <Button size="md" disabled={pending} onClick={() => run(sendTestPush)}>
                  Wyślij próbne powiadomienie
                </Button>
              ) : null}
              {deviceCount > (device === 'on' ? 1 : 0) ? (
                <Button variant="ghost" size="md" disabled={pending} onClick={disableAll}>
                  Wyłącz wszędzie ({deviceCount})
                </Button>
              ) : null}
            </div>
          </>
        ) : (
          <p className="m-0">Powiadomienia na urządzeniu są teraz niedostępne.</p>
        )}
      </div>

      <div className="space-y-1.5">
        <h3 className="m-0 text-[12px] font-semibold">E-mail</h3>
        <Checkbox
          label="Wysyłaj też na e-mail"
          checked={email}
          disabled={pending || (emailState !== 'ready' && !email)}
          onChange={(event) => setEmail(event.target.checked)}
        />
        {emailState === 'soon' ? <p className="m-0">E-mail włączymy wkrótce</p> : null}
        {emailState === 'unconfirmed' ? (
          <p className="m-0">Najpierw potwierdź adres e-mail.</p>
        ) : null}
      </div>

      <fieldset className="m-0 space-y-1.5 border-0 p-0">
        <legend className="p-0 text-[12px] font-semibold">O czym</legend>
        {NOTIFICATION_KINDS.map((kind) => (
          <div key={kind}>
            <Checkbox
              label={KIND_LABELS[kind]}
              checked={kinds[kind]}
              disabled={pending}
              onChange={(event) => setKinds({ ...kinds, [kind]: event.target.checked })}
            />
          </div>
        ))}
        {anyChannel && !anyKind ? (
          <p className="m-0 text-[var(--lf-muted)]">Zaznacz, o czym chcesz wiedzieć.</p>
        ) : null}
      </fieldset>

      <Button
        variant="primary"
        size="md"
        disabled={pending}
        onClick={() => run(() => saveNotificationPrefs({ email, kinds }))}
      >
        {pending ? 'Chwila…' : 'Zapisz wybór'}
      </Button>
      <p role="status" className="m-0 min-h-[1.2em]">
        {result?.message ?? ''}
      </p>
    </div>
  );
}
