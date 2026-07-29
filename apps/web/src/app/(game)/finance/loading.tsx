import { LoadingFrame } from '@/components/ui';

export default function FinanceLoading() {
  return (
    <LoadingFrame
      waId="LOD-007"
      illustrationSrc="/assets/world-art/lod-007-ledger-close.png"
      label="Ładowanie finansów…"
    />
  );
}
