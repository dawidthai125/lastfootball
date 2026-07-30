/**
 * Sponsors — domain OUT (Season End / economy EPIC).
 * Soft-lock enforced by SoftLockRouteGate (LFE-SOFTLOCK-01 · D52/D65).
 * Honest stub only if route ever opens (e.g. future phase) — no Fake Production.
 */
export default function SponsorsPage() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-xl text-[var(--lf-color-text-primary)]">
        Sponsorzy
      </h1>
      <p className="mt-2 text-[13px] text-[var(--lf-muted)]">
        Umowy sponsorskie pojawią się wraz z pełną ekonomią sezonu. Ta powierzchnia nie udaje
        aktywnych kontraktów.
      </p>
    </div>
  );
}
