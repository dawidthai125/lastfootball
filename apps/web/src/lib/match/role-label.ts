const ROLE_LABEL: Readonly<Record<string, string>> = {
  GK: 'BR',
  RB: 'PO',
  RWB: 'PO',
  CB: 'ŚO',
  LB: 'LO',
  LWB: 'LO',
  CDM: 'ŚP',
  CM: 'ŚP',
  CAM: 'ŚP',
  RM: 'PP',
  LM: 'LP',
  RW: 'PN',
  LW: 'PN',
  ST: 'N',
  CF: 'N',
};

/** Engine role as the short Polish position the squad screens use. */
export function roleLabel(role: string): string {
  return ROLE_LABEL[role] ?? role;
}
