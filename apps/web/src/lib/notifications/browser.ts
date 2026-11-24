/** Browser side of push. No server imports here. */

const WAIT_MS = 2_000;

function within<T>(work: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([
    work.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), WAIT_MS)),
  ]);
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  const registration = await navigator.serviceWorker.getRegistration('/');
  return (await registration?.pushManager?.getSubscription()) ?? null;
}

/** Ends push in this browser and returns the endpoint for the server. Never blocks signing out. */
export async function forgetBrowserPush(): Promise<string | null> {
  const subscription = await within(currentSubscription(), null);
  if (!subscription) return null;
  await within(subscription.unsubscribe(), false);
  return subscription.endpoint;
}
