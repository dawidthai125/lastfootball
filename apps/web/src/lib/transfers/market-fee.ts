import { deriveTransferFee } from '@/lib/transfers/derive-fee';

export function marketFee(skill: number, age: number, clubLabel: string): number {
  if (clubLabel === 'Wolny agent') return 0;
  return deriveTransferFee(skill, age);
}
