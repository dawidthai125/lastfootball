export function loanBlock(input: {
  readonly position: string;
  readonly starter: boolean;
  readonly onLoan: boolean;
  readonly emergency?: boolean;
}): string | null {
  if (input.onLoan) return 'Już jest wypożyczony.';
  if (input.emergency) return 'Juniora awaryjnego nie wypożyczysz.';
  if (input.position === 'BR') return 'Bramkarza nie wypożyczysz.';
  if (input.starter) return 'Zdejmij go z jedenastki.';
  return null;
}

export function loanWage(wage: number): number {
  if (!Number.isFinite(wage) || wage < 0) return 0;
  return Math.trunc(wage / 2);
}

export function recallWage(bank: number, current: number): number {
  if (Number.isFinite(bank) && bank >= 0) return Math.trunc(bank);
  if (Number.isFinite(current) && current >= 0) return Math.trunc(current);
  return 0;
}

export function loanUntilDate(today: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return '2027-06-30';
  const [yearText, monthText, dayText] = today.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const until = new Date(Date.UTC(year, month - 1, day + 120));
  const y = until.getUTCFullYear();
  const m = String(until.getUTCMonth() + 1).padStart(2, '0');
  const d = String(until.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
