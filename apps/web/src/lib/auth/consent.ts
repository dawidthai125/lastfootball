import { LEGAL } from '@/lib/legal';

/** Checked on the server: the browser only asks. Nothing about the age is stored. */
export function consentError(formData: FormData): string | null {
  if (formData.get('age') !== 'on') {
    return `Grać mogą osoby, które ukończyły ${LEGAL.minAge} lat. Zaznacz, że masz ukończone ${LEGAL.minAge} lat.`;
  }
  if (formData.get('terms') !== 'on') return 'Zaakceptuj Regulamin i Politykę prywatności.';
  return null;
}
