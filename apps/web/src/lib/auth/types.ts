export type AuthActionState = {
  error: string | null;
  info: string | null;
};

export const AUTH_ACTION_INITIAL: AuthActionState = { error: null, info: null };
