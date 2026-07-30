/**
 * Board — domain OUT (GDD + Season End).
 * Soft-lock enforced by SoftLockRouteGate (LFE-SOFTLOCK-01 · D52/D65).
 * Honest stub only if route ever opens — no preview shell / Fake Production.
 */
export default function BoardPage() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-xl text-[var(--lf-color-text-primary)]">
        Zarząd
      </h1>
      <p className="mt-2 text-[13px] text-[var(--lf-muted)]">
        Cele sezonu i ocena władz pojawią się po domknięciu architektury Season End. Ta powierzchnia
        nie udaje oceny zarządu.
      </p>
    </div>
  );
}
