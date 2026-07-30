export { resolveClubAcademy } from '@/lib/academy/resolve-club-academy';
export {
  ACADEMY_THIN,
  ACADEMY_ACTION_INITIAL,
  type AcademyDto,
  type AcademyProspectDto,
  type AcademyActionState,
  type AcademyIntakeBlockedReason,
} from '@/lib/academy/types';
export {
  buildAcademyIntakeDraft,
  canPromoteProspect,
  allocateAcademyShirt,
  clubTagFromId,
} from '@/lib/academy/intake';
