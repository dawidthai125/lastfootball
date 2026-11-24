/** For new passwords. Older, shorter ones keep working. */
export const MIN_PASSWORD = 8;

export function passwordProblem(password: string, confirm?: string): string | null {
  if (password.length < MIN_PASSWORD) return `Hasło musi mieć co najmniej ${MIN_PASSWORD} znaków.`;
  if (password.length > 72) return 'Hasło może mieć najwyżej 72 znaki.';
  if (confirm !== undefined && password !== confirm) return 'Hasła muszą być takie same.';
  return null;
}
