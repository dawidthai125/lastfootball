type Reply = { readonly error: { readonly code?: string } | null };

/**
 * Some functions lock the club first, a deal locks the player first. Postgres then stops one of
 * them (40P01) and undoes all it did, so one more try is safe.
 */
export async function retryDeadlock<T extends Reply>(call: () => PromiseLike<T>): Promise<T> {
  const reply = await call();
  return reply.error?.code === '40P01' ? call() : reply;
}
